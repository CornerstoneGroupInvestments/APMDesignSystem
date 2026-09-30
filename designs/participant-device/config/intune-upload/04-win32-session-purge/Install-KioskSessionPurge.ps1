<#
.SYNOPSIS
    Participant Kiosk session purge installer.
    Copies the signed purge script to C:\APM\PK\ and registers it to run at shutdown and
    again at startup (layers 2 and 3 of the three-layer purge, Detailed Design 6.4).

.DESCRIPTION
    Runs once per device as SYSTEM. Performs:
      1. Copies Invoke-KioskSessionPurge.ps1 from this package to C:\APM\PK\.
      2. Verifies the copied file carries a valid Authenticode signature, and exits 1
         without registering anything if it does not.
      3. Sets read-only ACLs so the participant session cannot alter or delete the script.
      4. Registers the STARTUP pass as scheduled task APM-PK-PurgeStartup: AtStartup
         trigger, SYSTEM, highest privileges. This is the pass that removes a profile the
         shutdown pass could not, because it was still loaded.
      5. Registers the SHUTDOWN pass as a local Group Policy shutdown script, which is the
         only mechanism Windows waits for during shutdown. Task Scheduler has no shutdown
         trigger, so a scheduled task cannot serve here.

.NOTES
    Deploy as a Win32 application, NOT a platform script: an Intune platform script runs
    once when Intune delivers it and has no shutdown hook, so a platform script alone would
    never produce a shutdown pass at all.
      Install command:    powershell.exe -NoProfile -ExecutionPolicy AllSigned -File .\Install-KioskSessionPurge.ps1
      Uninstall command:  powershell.exe -NoProfile -ExecutionPolicy AllSigned -File .\Install-KioskSessionPurge.ps1 -Uninstall
                          (removes the startup task, both script copies, the [Shutdown] entry
                           from psscripts.ini and the Scripts CSE from gpt.ini, then refreshes
                           policy - deleting the script file alone leaves Windows trying to run
                           a missing shutdown script on every restart)
      Detection rule:     File - C:\APM\PK - Invoke-KioskSessionPurge.ps1 - File or folder exists
      Install behaviour:  System.  Device restart behaviour: No specific action.
    Both this installer and Invoke-KioskSessionPurge.ps1 signed with the APM code-signing
    certificate (SOE-02) before packaging. Policy: CDG-W11-REM-Profile Purge-P-1.0.
    Assignment: sg-dyn-dvc-cdg-participant-kiosk.
    The shutdown script timeout is 600 seconds by default, far longer than a purge pass takes.
#>
[CmdletBinding()]
param([switch]$Uninstall)

$ErrorActionPreference = 'Stop'

$dir = 'C:\APM\PK'
$scriptName = 'Invoke-KioskSessionPurge.ps1'
$purgePath = Join-Path $dir $scriptName
$taskName = 'APM-PK-PurgeStartup'
$source = Join-Path $PSScriptRoot $scriptName
$gpRoot = 'C:\Windows\System32\GroupPolicy'
$gpShutdown = Join-Path $gpRoot 'Machine\Scripts\Shutdown'

if (-not (Test-Path $dir)) { New-Item -Path $dir -ItemType Directory -Force | Out-Null }

# ---- 0. uninstall: undo everything install registered ------------------------
# Removing the script file alone is not enough. The [Shutdown] entry in psscripts.ini and the
# Scripts client-side extension in gpt.ini survive, so Windows keeps trying to run a script
# that is no longer there and logs a failure on every restart.
if ($Uninstall) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $gpShutdown $scriptName) -Force -ErrorAction SilentlyContinue
    Remove-Item $purgePath -Force -ErrorAction SilentlyContinue

    $iniPath = Join-Path $gpRoot 'Machine\Scripts\psscripts.ini'
    if (Test-Path $iniPath) {
        $keep = Get-Content $iniPath | Where-Object { $_ -notmatch [regex]::Escape($scriptName) -and $_ -notmatch '^\s*0Parameters\s*=' }
        if ($keep -join '' -match '\S') { Set-Content -Path $iniPath -Value $keep -Encoding Unicode -Force }
        else { Remove-Item $iniPath -Force -ErrorAction SilentlyContinue }
    }

    # Bump gpt.ini so the local policy engine reprocesses and drops the shutdown script
    $gptPath = Join-Path $gpRoot 'gpt.ini'
    if (Test-Path $gptPath) {
        $v = 1
        foreach ($line in (Get-Content $gptPath)) { if ($line -match '^\s*Version\s*=\s*(\d+)') { $v = [int]$matches[1] + 1 } }
        $lines = @()
        foreach ($line in (Get-Content $gptPath)) {
            if ($line -match '^\s*Version\s*=') { $lines += ('Version=' + $v) } else { $lines += $line }
        }
        Set-Content -Path $gptPath -Value $lines -Encoding ASCII -Force
    }

    Start-Process -FilePath 'gpupdate.exe' -ArgumentList '/target:computer /force' -Wait -WindowStyle Hidden
    Write-Output 'Uninstalled: startup task, both script copies, psscripts.ini entry and policy refreshed'
    exit 0
}

# ---- 1. copy the signed purge script from the package -----------------------
if (-not (Test-Path $source)) {
    Write-Output "FAILED: $scriptName not found beside this installer. Package both files in the same .intunewin."
    exit 1
}
Copy-Item -Path $source -Destination $purgePath -Force

# ---- 2. verify the signature before registering anything --------------------
$sig = Get-AuthenticodeSignature -FilePath $purgePath
if ($sig.Status -ne 'Valid') {
    Write-Output "FAILED: $scriptName signature status is $($sig.Status), not Valid. Sign the file with the APM code-signing certificate and repackage."
    Remove-Item $purgePath -Force -ErrorAction SilentlyContinue
    exit 1
}
Write-Output "Purge script signature valid: $($sig.SignerCertificate.Subject)"

# ---- 3. read-only ACLs ------------------------------------------------------
$acl = Get-Acl $purgePath
$acl.SetAccessRuleProtection($true, $false)
$acl.Access | ForEach-Object { [void]$acl.RemoveAccessRule($_) }
foreach ($id in @('NT AUTHORITY\SYSTEM', 'BUILTIN\Administrators')) {
    $acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule($id, 'FullControl', 'Allow')))
}
$acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule('BUILTIN\Users', 'ReadAndExecute', 'Allow')))
Set-Acl -Path $purgePath -AclObject $acl
Write-Output "ACLs set: SYSTEM and Administrators full control, Users read and execute"

# ---- 4. startup pass: scheduled task, SYSTEM, AtStartup ---------------------
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
$argString = "-NoProfile -WindowStyle Hidden -ExecutionPolicy AllSigned -File " + [char]34 + $purgePath + [char]34
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $argString
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId 'NT AUTHORITY\SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
Write-Output "Scheduled task $taskName registered - AtStartup, SYSTEM"

# ---- 5. shutdown pass: local Group Policy shutdown script -------------------
if (-not (Test-Path $gpShutdown)) { New-Item -Path $gpShutdown -ItemType Directory -Force | Out-Null }
Copy-Item -Path $source -Destination (Join-Path $gpShutdown $scriptName) -Force

# psscripts.ini is the PowerShell shutdown/startup script register (scripts.ini is cmd only)
$iniPath = Join-Path $gpRoot 'Machine\Scripts\psscripts.ini'
$ini = @(
    '[ShutdownPSScriptOrder]',
    'StartExecutePSFirst=true',
    '[Shutdown]',
    ('0CmdLine=' + $scriptName),
    '0Parameters='
)
Set-Content -Path $iniPath -Value $ini -Encoding Unicode -Force
(Get-Item $iniPath).Attributes = 'Hidden'

# gpt.ini must name the Scripts client-side extension and carry a non-zero, incremented
# Version, or the local policy engine does not process the shutdown script at all
$gptPath = Join-Path $gpRoot 'gpt.ini'
$cse = '[{42B5FAAE-6053-11D2-9CF6-0060B0EC3D80}{40B6664F-4972-11D1-A7CA-0000F87571E3}]'
$version = 1
$existingCse = ''
if (Test-Path $gptPath) {
    foreach ($line in (Get-Content $gptPath)) {
        if ($line -match '^\s*Version\s*=\s*(\d+)') { $version = [int]$matches[1] + 1 }
        if ($line -match '^\s*gPCMachineExtensionNames\s*=\s*(.*)$') { $existingCse = $matches[1].Trim() }
    }
}
if ($existingCse -and $existingCse -notlike "*42B5FAAE-6053-11D2-9CF6-0060B0EC3D80*") { $cse = $existingCse + $cse }
elseif ($existingCse) { $cse = $existingCse }
Set-Content -Path $gptPath -Value @('[General]', ('gPCMachineExtensionNames=' + $cse), ('Version=' + $version)) -Encoding ASCII -Force
Write-Output "Local Group Policy shutdown script registered, gpt.ini Version=$version"

Start-Process -FilePath 'gpupdate.exe' -ArgumentList '/target:computer /force' -Wait -WindowStyle Hidden
Write-Output "Machine policy refreshed - shutdown and startup purge passes both active"
exit 0
