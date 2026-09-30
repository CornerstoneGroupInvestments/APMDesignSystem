<#
.SYNOPSIS
    Participant Kiosk inactivity watchdog installer.
    Copies the signed watchdog to C:\APM\PK\ and registers the scheduled task that restarts
    the device after 600 seconds with no keyboard or mouse input.

.DESCRIPTION
    Runs once per device as SYSTEM. Performs:
      1. Copies Watch-KioskIdle.ps1 from this package to C:\APM\PK\Watch-KioskIdle.ps1.
      2. Verifies the copied file carries a valid Authenticode signature, and exits 1
         without registering the task if it does not.
      3. Sets read-only ACLs so the participant session cannot alter the watchdog.
      4. Registers the scheduled task APM-PK-IdleWatchdog: logon trigger, 30-second repeat,
         running in the interactive user context (not SYSTEM), so GetLastInputInfo returns
         that session's true input time.

.NOTES
    Deploy as a Win32 application, NOT a platform script: the package must carry two files,
    this installer and the separately signed Watch-KioskIdle.ps1, because the scheduled task
    launches the watchdog with -ExecutionPolicy AllSigned and a watchdog generated on the
    device cannot be signed.
      Install command:    powershell.exe -NoProfile -ExecutionPolicy AllSigned -File .\Install-KioskIdleWatchdog.ps1
      Uninstall command:  powershell.exe -NoProfile -ExecutionPolicy AllSigned -Command "Unregister-ScheduledTask -TaskName 'APM-PK-IdleWatchdog' -Confirm:$false; Remove-Item 'C:\APM\PK\Watch-KioskIdle.ps1' -Force"
      Detection rule:     File - C:\APM\PK - Watch-KioskIdle.ps1 - File or folder exists
      Install behaviour:  System.  Device restart behaviour: No specific action.
    Both this installer and Watch-KioskIdle.ps1 signed with the APM code-signing certificate
    (SOE-02) before packaging. Policy: CDG-W11-REM-Idle Restart-P-1.0.
    Assignment: sg-dyn-dvc-cdg-participant-kiosk. Values per the Detailed Design, 4.3.2.
#>
$ErrorActionPreference = 'Stop'

$dir = 'C:\APM\PK'
$watchdogPath = Join-Path $dir 'Watch-KioskIdle.ps1'
$taskName = 'APM-PK-IdleWatchdog'
$source = Join-Path $PSScriptRoot 'Watch-KioskIdle.ps1'

if (-not (Test-Path $dir)) { New-Item -Path $dir -ItemType Directory -Force | Out-Null }

# ---- 1. copy the signed watchdog from the package ----------------------------
if (-not (Test-Path $source)) {
    Write-Output "FAILED: Watch-KioskIdle.ps1 not found beside this installer. Package both files in the same .intunewin."
    exit 1
}
Copy-Item -Path $source -Destination $watchdogPath -Force

# ---- 2. verify the signature before registering anything ---------------------
$sig = Get-AuthenticodeSignature -FilePath $watchdogPath
if ($sig.Status -ne 'Valid') {
    Write-Output "FAILED: Watch-KioskIdle.ps1 signature status is $($sig.Status), not Valid. The scheduled task runs with -ExecutionPolicy AllSigned and would never execute. Sign the file with the APM code-signing certificate and repackage."
    Remove-Item $watchdogPath -Force -ErrorAction SilentlyContinue
    exit 1
}
Write-Output "Watchdog signature valid: $($sig.SignerCertificate.Subject)"

# ---- 3. read-only ACLs: the participant session must not alter the watchdog --
$acl = Get-Acl $watchdogPath
$acl.SetAccessRuleProtection($true, $false)
$acl.Access | ForEach-Object { [void]$acl.RemoveAccessRule($_) }
foreach ($id in @('NT AUTHORITY\SYSTEM', 'BUILTIN\Administrators')) {
    $acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule($id, 'FullControl', 'Allow')))
}
$acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule('BUILTIN\Users', 'ReadAndExecute', 'Allow')))
Set-Acl -Path $watchdogPath -AclObject $acl
Write-Output "ACLs set: SYSTEM and Administrators full control, Users read and execute"

# ---- 4. scheduled task: interactive user context, 30-second repeat -----------
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

$argString = "-NoProfile -WindowStyle Hidden -ExecutionPolicy AllSigned -File " + [char]34 + $watchdogPath + [char]34
$action  = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $argString
$trigger = New-ScheduledTaskTrigger -AtLogOn
$repeat  = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Seconds 30) -RepetitionDuration ([System.TimeSpan]::MaxValue)
$trigger.Repetition = $repeat.Repetition
$principal = New-ScheduledTaskPrincipal -GroupId 'S-1-5-32-545' -RunLevel Limited   # BUILTIN\Users, interactive
$settings  = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit ([System.TimeSpan]::Zero)

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null

Write-Output "Scheduled task $taskName registered - logon trigger, 30-second repeat, interactive user"
exit 0
