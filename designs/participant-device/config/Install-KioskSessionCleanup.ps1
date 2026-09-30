<#
.SYNOPSIS
    Participant Kiosk session data cleanup installer. Stages Clear-KioskSessionData.ps1 to
    C:\APM\PK\ and registers the logon and logoff scheduled tasks.

.DESCRIPTION
    Written to run under Constrained Language Mode. Both tasks are registered with
    schtasks.exe from a task XML definition rather than with the New-ScheduledTask* cmdlets,
    for two reasons: those cmdlets cannot express an event trigger at all, and building a task
    from cmdlet objects needs constructor calls CLM disallows.

    Two tasks, both running as SYSTEM:

      APM-PK-CleanLogon    triggers at boot AND when the kiosk account signs in. The
                           authoritative pass: at those two points the participant has done
                           nothing, nothing they own is locked, and everything on the list can
                           be removed. The boot trigger also catches whatever the logoff pass
                           could not take, and reasserts autologon before the first logon
                           attempt of the boot, which is the only point at which that is any
                           use.

      APM-PK-CleanLogoff   triggers on Security event 4634 or 4647 for the kiosk account. Best
                           effort, because a closing application still holds files open.

    SYSTEM rather than the user's own context, deliberately. SYSTEM is exempt from AppLocker
    and from the RestrictRun list Assigned Access writes into the kiosk hive, so nothing has to
    be added to AllowedApps. Adding powershell.exe to a public kiosk's allowed applications to
    make a cleanup script run would be a poor trade.

    THE LOGOFF TASK HAS A DEPENDENCY THE LOGON TASK DOES NOT. Its event trigger only fires if
    logoff auditing is on, so the installer checks and reports. Without it the task registers
    and never runs, silently. The command to enable it:

        auditpol /set /subcategory:"Logoff" /success:enable

    Verify with Test-KioskSessionCleanup, or by signing out and reading the task history.

.PARAMETER SourceScript
    Path to Clear-KioskSessionData.ps1. Defaults to the installer's own directory, resolved from
    $PSScriptRoot, then the invocation path, then the working directory. The PowerShell ISE
    leaves $PSScriptRoot empty, which is why there are three fallbacks rather than one.

.PARAMETER SkipSignatureCheck
    Installs an unsigned script. FOR A TEST DEVICE ONLY. App Control puts an unsigned script
    into Constrained Language Mode; the cleaner is written to survive that, but an unsigned
    script in C:\APM\PK is also a script anyone who can write there can replace.

.NOTES
    Run as SYSTEM or an administrator. Deployed as a Win32 app:
      Install:   powershell.exe -ExecutionPolicy Bypass -File .\Install-KioskSessionCleanup.ps1
      Uninstall: powershell.exe -ExecutionPolicy Bypass -File .\Install-KioskSessionCleanup.ps1 -Uninstall
      Detection: both scheduled tasks present AND ready. A file-exists rule on the payload
                 passes even when task registration failed, which is the defect pattern the
                 other three kiosk installers already carry.
#>
[CmdletBinding()]
param(
    [string]$SourceScript,
    [switch]$SkipSignatureCheck,
    [switch]$Uninstall,
    [string]$AccountName
)

$ErrorActionPreference = 'Stop'
$dest = 'C:\APM\PK'
$scriptName = 'Clear-KioskSessionData.ps1'
$target = Join-Path $dest $scriptName
$logonTask = 'APM-PK-CleanLogon'
$logoffTask = 'APM-PK-CleanLogoff'

function Say($m) { Write-Output $m }

# Every native command in this script is run through here, and none is called directly.
#
# PowerShell wraps a native command's stderr output as a NativeCommandError record, and with
# $ErrorActionPreference = 'Stop' that record is TERMINATING. So a harmless
# "schtasks /delete" on a task that does not exist yet killed the whole installer with
# "ERROR: The system cannot find the file specified", pointing at schtasks.exe and telling you
# nothing about which file or which call. icacls, auditpol and schtasks /query are all capable
# of the same thing.
#
# Setting the preference to Continue for the duration of the call is the fix. Cmdlets keep
# Stop, so a real failure to copy or write still stops the installer.
function Invoke-Native($exe, $arguments) {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $out = & $exe @arguments 2>&1
    $code = $LASTEXITCODE
    $ErrorActionPreference = $prev
    return @{ Output = @($out); Code = $code }
}

# ---- uninstall ---------------------------------------------------------------
if ($Uninstall) {
    foreach ($t in $logonTask, $logoffTask) {
        Invoke-Native 'schtasks' @('/delete', '/tn', $t, '/f') | Out-Null
        Say "Removed task $t"
    }
    if (Test-Path $target) { Remove-Item -LiteralPath $target -Force -ErrorAction SilentlyContinue; Say "Removed $target" }
    Say 'Uninstall complete. Logs under C:\APM\PK\logs are left in place.'
    exit 0
}

# ---- resolve the account, by the same rule every other kiosk script uses ------
if (-not $AccountName) {
    $serial = ((Get-CimInstance Win32_BIOS).SerialNumber -replace '[^A-Za-z0-9]', '').ToUpperInvariant()
    if (-not $serial) { throw 'No BIOS serial number available' }
    if ($serial.Length -gt 14) { $serial = $serial.Substring(0, 14) }
    $AccountName = "Kiosk-$serial"
}
$acct = Get-LocalUser -Name $AccountName -ErrorAction SilentlyContinue
if (-not $acct) { throw "Local account $AccountName does not exist. Run the session account remediation first." }
Say "Kiosk account: $AccountName"

# ---- 1. stage the payload ----------------------------------------------------
# $PSScriptRoot is empty in the PowerShell ISE and in a dot-sourced or selection run, and
# Join-Path throws "cannot bind argument" on an empty Path rather than returning anything
# useful. Fall back to the invocation path, then to the working directory.
if (-not $SourceScript) {
    $srcDir = $PSScriptRoot
    if (-not $srcDir -and $MyInvocation.MyCommand.Path) { $srcDir = Split-Path -Parent $MyInvocation.MyCommand.Path }
    if (-not $srcDir) { $srcDir = (Get-Location).Path }
    $SourceScript = Join-Path $srcDir $scriptName
    Say "Looking for the payload in: $srcDir"
}
if (-not (Test-Path $SourceScript)) {
    throw "Source script not found: $SourceScript. Run this from the directory holding $scriptName, or pass -SourceScript with its full path."
}
if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force | Out-Null }
Copy-Item -LiteralPath $SourceScript -Destination $target -Force
Say "Staged $target"

# ---- 2. signature ------------------------------------------------------------
$sig = Get-AuthenticodeSignature -LiteralPath $target
if ("$($sig.Status)" -ne 'Valid') {
    if (-not $SkipSignatureCheck) {
        Remove-Item -LiteralPath $target -Force -ErrorAction SilentlyContinue
        throw "Signature status is $($sig.Status). Sign with the APM code-signing certificate, or pass -SkipSignatureCheck on a test device. Payload removed."
    }
    Say "WARNING: signature status is $($sig.Status). Installing unsigned, test devices only."
} else {
    $subject = "$($sig.SignerCertificate.Subject)"
    Say "Signature valid: $subject"
}

# ---- 3. lock the payload down ------------------------------------------------
# A cleanup task running as SYSTEM executes whatever is at this path. If a standard user can
# write to it, they can run code as SYSTEM.
Invoke-Native 'icacls' @($target, '/inheritance:r', '/grant', 'SYSTEM:(RX)', 'Administrators:(F)') | Out-Null
Say 'Applied ACL: SYSTEM read and execute, Administrators full, no inheritance'

# ---- 4. register the tasks ---------------------------------------------------
$cmd = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$logonArgs = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$target`" -Phase Startup"
$logoffArgs = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$target`" -Phase Logoff"
$userId = "$env:COMPUTERNAME\$AccountName"

# The event subscription is XML inside XML, so every angle bracket in it is escaped. 4634 is a
# logoff, 4647 is a user-initiated logoff, and both are filtered to the kiosk account so the
# task does not fire when a support engineer signs out.
$subscription = '&lt;QueryList&gt;&lt;Query Id="0" Path="Security"&gt;&lt;Select Path="Security"&gt;*[System[(EventID=4634 or EventID=4647)]] and *[EventData[Data[@Name=''TargetUserName'']=''' + $AccountName + ''']]&lt;/Select&gt;&lt;/Query&gt;&lt;/QueryList&gt;'

function New-TaskXml($description, $triggerXml, $arguments) {
    # Schema 1.2, not 1.4. Both support EventTrigger and BootTrigger, and 1.2 is accepted by
    # every schtasks.exe on every supported build, so it removes one variable.
    #
    # No <URI> element. It is optional, it has to agree with /tn, and keeping the two in step
    # needed a string substitution per task, which is a failure waiting to happen for no gain.
    return @"
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>$description</Description>
  </RegistrationInfo>
  <Triggers>
$triggerXml
  </Triggers>
  <Principals>
    <Principal id="Author">
      <UserId>S-1-5-18</UserId>
      <RunLevel>HighestAvailable</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>false</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <IdleSettings>
      <StopOnIdleEnd>false</StopOnIdleEnd>
      <RestartOnIdle>false</RestartOnIdle>
    </IdleSettings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>true</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT10M</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>$cmd</Command>
      <Arguments>$arguments</Arguments>
    </Exec>
  </Actions>
</Task>
"@
}

$logonTrigger = @"
    <LogonTrigger>
      <Enabled>true</Enabled>
      <UserId>$userId</UserId>
    </LogonTrigger>
    <BootTrigger>
      <Enabled>true</Enabled>
    </BootTrigger>
"@
$logoffTrigger = @"
    <EventTrigger>
      <Enabled>true</Enabled>
      <Subscription>$subscription</Subscription>
    </EventTrigger>
"@

# The XML goes in C:\APM\PK, which step 1 has just created, rather than %TEMP%. schtasks
# reports a missing or unreadable XML as "the system cannot find the file specified", which
# names schtasks.exe and not the file, so a redirected or restricted TEMP produces an error
# that points at the wrong thing entirely.
$tmp = Join-Path $dest 'apm-pk-task.xml'
$registered = @()
foreach ($spec in @(
    @{ Name = $logonTask;  Trigger = $logonTrigger;  Args = $logonArgs;  Desc = 'APM Participant Kiosk - clear participant data at boot and at kiosk logon. Authoritative pass.' },
    @{ Name = $logoffTask; Trigger = $logoffTrigger; Args = $logoffArgs; Desc = 'APM Participant Kiosk - clear participant data at logoff. Best effort; files still open cannot be removed.' }
)) {
    $xml = New-TaskXml $spec.Desc $spec.Trigger $spec.Args
    Set-Content -LiteralPath $tmp -Value $xml -Encoding Unicode -Force

    # Confirm the file is actually there and non-empty before blaming schtasks for not finding it.
    if (-not (Test-Path -LiteralPath $tmp)) {
        throw "Could not write the task definition to $tmp. Check write access to $dest."
    }
    $len = (Get-Item -LiteralPath $tmp).Length
    Say "  task definition written: $tmp ($len bytes)"
    if ($len -lt 200) { throw "Task definition at $tmp is only $len bytes. It did not render." }

    # Delete first so /f on a create cannot collide with a task left from an earlier attempt.
    # A failure here is expected on a first install and is deliberately ignored.
    Invoke-Native 'schtasks' @('/delete', '/tn', $spec.Name, '/f') | Out-Null

    $r = Invoke-Native 'schtasks' @('/create', '/tn', $spec.Name, '/xml', $tmp, '/f')
    if ($r.Code -eq 0) {
        Say "Registered $($spec.Name)"
        $registered += $spec.Name
        continue
    }

    Say "  schtasks /create failed for $($spec.Name), exit $($r.Code)"
    foreach ($line in $r.Output) { if ("$line".Trim()) { Say "    $line" } }

    # The logon and boot pass is the one that matters, and it can be registered without XML.
    # The logoff task cannot: an event trigger has no schtasks command-line equivalent.
    if ($spec.Name -eq $logonTask) {
        Say '  Falling back to a command-line registration without XML.'
        $tr = "`"$cmd`" $($spec.Args)"
        $r2 = Invoke-Native 'schtasks' @('/create', '/tn', $spec.Name, '/tr', $tr, '/sc', 'ONLOGON', '/ru', 'SYSTEM', '/rl', 'HIGHEST', '/f')
        if ($r2.Code -eq 0) {
            Say "  Registered $($spec.Name) as ONLOGON only."
            Say '  NOTE: the boot trigger could not be added this way, so the pass that catches files'
            Say '  left locked by the previous session, and reasserts autologon before the first logon'
            Say '  of the boot, is missing. Add a boot trigger by hand in Task Scheduler, or fix the'
            Say '  XML registration above.'
            $registered += $spec.Name
            continue
        }
        foreach ($line in $r2.Output) { if ("$line".Trim()) { Say "    $line" } }
    }

    Say "  The task definition has been left at $tmp for inspection."
    throw "Failed to register $($spec.Name)."
}
Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue

# ---- 5. verify what was actually registered ----------------------------------
# Registration succeeding is not the same as the task being able to run. Both installers that
# preceded this one reported success on a file copy alone.
$ok = $true
foreach ($t in $logonTask, $logoffTask) {
    $q = Invoke-Native 'schtasks' @('/query', '/tn', $t, '/fo', 'LIST')
    if ($q.Code -ne 0) { Say "FAIL: $t did not register"; $ok = $false; continue }
    $state = ''
    foreach ($line in $q.Output) { if ("$line" -match '^\s*Status:\s*(.+?)\s*$') { $state = $Matches[1] } }
    Say "  $t status: $state"
    if ($state -match 'Disabled') { Say "  FAIL: $t is disabled"; $ok = $false }
}

# ---- 6. the logoff task's silent dependency ---------------------------------
$audit = Invoke-Native 'auditpol' @('/get', '/subcategory:Logoff')
$auditOn = $false
foreach ($line in $audit.Output) { if ("$line" -match 'Logoff\s+(Success|Success and Failure)') { $auditOn = $true } }
if ($auditOn) {
    Say 'Logoff auditing is enabled, so the logoff task will fire.'
} else {
    Say ''
    Say 'WARNING: logoff auditing is NOT enabled. APM-PK-CleanLogoff is registered but will'
    Say 'never fire, and it will report no error. Enable it, or accept that only the logon pass'
    Say 'runs:'
    Say '    auditpol /set /subcategory:"Logoff" /success:enable'
    Say 'Check whether the SOE hardening standard already sets this before changing it locally,'
    Say 'because a local auditpol change is overwritten by policy at the next refresh.'
}

# ---- 7. first run ------------------------------------------------------------
Say ''
Say 'Running the logon pass once now, so the device does not carry data from before install.'
Invoke-Native $cmd @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $target, '-Phase', 'Logon') | Out-Null
Say 'Done. Log: C:\APM\PK\logs'

if (-not $ok) { exit 1 }
Say ''
Say 'Install complete.'
exit 0
