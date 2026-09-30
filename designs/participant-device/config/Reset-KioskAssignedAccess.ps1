<#
.SYNOPSIS
    Clean reset of Assigned Access on one kiosk device, so a configuration can be applied once
    against known-empty state instead of on top of everything applied before it.

.DESCRIPTION
    Written to run under Constrained Language Mode, so it needs no signing.

    Microsoft's guidance for a kiosk that behaves inconsistently after several configuration
    changes is a full reset rather than another apply, because deleting an Assigned Access
    configuration is documented as not reverting everything: in a multi-app kiosk the Start
    menu configuration is maintained. This device has had the applied document changed many
    times, and RestrictRun was measured holding 20 entries for 17 allowed applications, with
    three appended duplicates. That is accumulated state, and this clears it.

    THIS IS DESTRUCTIVE. It deletes the Assigned Access configuration and the kiosk account's
    Windows profile. The account itself is left alone, and the profile is rebuilt at the next
    sign-in, which is what the session purge does on every restart anyway. Nothing a
    participant would miss is lost, but do not run it on a device someone is using.

    Order matters and the script enforces it:
      1. Enables the Assigned Access log channels. First, because some kiosk failures are
         logged once only and a channel enabled after the event captures nothing.
      2. Deletes the configuration from the CSP node.
      3. Reads the kiosk hive back and reports whether RestrictRun actually cleared. This is
         the check that tells you whether the reset did anything, and it is the reason to run
         this rather than clicking through it.
      4. Deletes the kiosk profile.
      5. Reports what remains and what to do next.

.PARAMETER SkipProfileDelete
    Leaves the kiosk profile in place. Use only if the profile itself is under test.

.PARAMETER WhatIf
    Reports what would be removed and changes nothing.

.NOTES
    MUST run as SYSTEM for the CSP delete. The MDM WMI bridge rejects an ordinary
    administrator.
      psexec -s -i powershell.exe -File .\Reset-KioskAssignedAccess.ps1

    PAUSE THE REMEDIATION ASSIGNMENT IN INTUNE FIRST. CDG-W11-REM-Kiosk Session Account-P-1.0
    owns this CSP node and will re-apply at its next check-in, which would put the device back
    into the state being cleared and invalidate the test.

    Test tooling. Not an Intune object, not deployed, not assigned.
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [switch]$SkipProfileDelete,
    [string]$AccountName
)

$ErrorActionPreference = 'Continue'
function Head($t) { Write-Host ''; Write-Host ('== ' + $t) -ForegroundColor Cyan }
function Item($k, $v) { Write-Host ('   {0,-42} {1}' -f $k, $v) }
function Good($t) { Write-Host ('   OK    ' + $t) -ForegroundColor Green }
function Bad($t)  { Write-Host ('   FAIL  ' + $t) -ForegroundColor Red }
function Warn($t) { Write-Host ('   WARN  ' + $t) -ForegroundColor Yellow }
function Note($t) { Write-Host ('         ' + $t) -ForegroundColor DarkGray }

$NS = 'root\cimv2\mdm\dmmap'
$CLASS = 'MDM_AssignedAccess'
$hiveTag = 'APMKioskReset'

Write-Host ''
Write-Host 'Participant Kiosk - clean reset of Assigned Access' -ForegroundColor White
Item 'Device' $env:COMPUTERNAME
Item 'Run at' (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Item 'Language mode' $ExecutionContext.SessionState.LanguageMode
$who = (& whoami) -join ''
Item 'Running as' $who
if ($who -notmatch 'nt authority\\system') {
    Bad 'Not running as SYSTEM. The MDM WMI bridge rejects the CSP delete from an ordinary administrator.'
    Note 'psexec -s -i powershell.exe -File .\Reset-KioskAssignedAccess.ps1'
    exit 1
}

if (-not $AccountName) {
    $serial = ((Get-CimInstance Win32_BIOS).SerialNumber -replace '[^A-Za-z0-9]', '').ToUpperInvariant()
    if ($serial.Length -gt 14) { $serial = $serial.Substring(0, 14) }
    $AccountName = "Kiosk-$serial"
}
Item 'Kiosk account' $AccountName
$acct = Get-LocalUser -Name $AccountName -ErrorAction SilentlyContinue
if (-not $acct) { Bad "Local account $AccountName does not exist."; exit 1 }
$sid = "$($acct.SID)"
Item 'SID' $sid
Warn 'Pause CDG-W11-REM-Kiosk Session Account-P-1.0 in Intune before continuing, or it will'
Note 'restore the state being cleared at its next check-in.'

# ---------------------------------------------------------------- 1. logging
Head '1. Assigned Access logging'
Note 'Enabled first. Some kiosk failures are logged once only, so a channel switched on after'
Note 'the event captures nothing.'
foreach ($ch in 'Microsoft-Windows-AssignedAccess/Operational', 'Microsoft-Windows-AssignedAccess/Admin') {
    if ($PSCmdlet.ShouldProcess($ch, 'Enable log channel')) {
        $o = & wevtutil sl $ch /e:true /ms:8388608 2>&1
        if ($LASTEXITCODE -eq 0) { Good "Enabled $ch" } else { Warn "$ch : $($o -join ' ')" }
    }
}
# AppLocker and CodeIntegrity too, since the same test will want them
foreach ($ch in 'Microsoft-Windows-AppLocker/EXE and DLL', 'Microsoft-Windows-CodeIntegrity/Operational') {
    if ($PSCmdlet.ShouldProcess($ch, 'Enable log channel')) {
        & wevtutil sl $ch /e:true 2>&1 | Out-Null
        Item 'Also enabled' $ch
    }
}

# ------------------------------------------------------- 2. before, and delete
Head '2. Configuration currently applied'
$inst = Get-CimInstance -Namespace $NS -ClassName $CLASS -ErrorAction SilentlyContinue
if (-not $inst) {
    Item 'MDM_AssignedAccess instance' 'none, nothing to delete'
} elseif (-not $inst.Configuration) {
    Item 'MDM_AssignedAccess instance' 'present, Configuration already empty'
} else {
    $cfg = "$($inst.Configuration)" -replace '&lt;', '<' -replace '&gt;', '>' -replace '&quot;', '"' -replace '&amp;', '&'
    Item 'Bytes' "$($cfg.Length)"
    Item 'AllowedApps entries' ([regex]::Matches($cfg, '<App ')).Count
    Item 'Edge pinned by' $(if ($cfg -match 'desktopAppId"\s*:\s*"MSEdge"') { 'desktopAppId MSEdge' } elseif ($cfg -match 'Microsoft Edge\.lnk') { 'shortcut path' } else { 'not pinned' })
    $bk = 'C:\APM\PK\assigned-access-before-reset.xml'
    if ($PSCmdlet.ShouldProcess($bk, 'Save current configuration')) {
        $d = Split-Path $bk -Parent
        if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
        Set-Content -LiteralPath $bk -Value $cfg -Encoding UTF8 -Force
        Item 'Saved to' $bk
    }
}

Head '3. Deleting the configuration'
if ($inst) {
    if ($PSCmdlet.ShouldProcess('./Vendor/MSFT/AssignedAccess/Configuration', 'Delete')) {
        Remove-CimInstance -InputObject $inst -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
        $chk = Get-CimInstance -Namespace $NS -ClassName $CLASS -ErrorAction SilentlyContinue
        if (-not $chk -or -not $chk.Configuration) {
            Good 'Configuration deleted.'
        } else {
            Bad 'The configuration is still present after the delete.'
            Note 'Something is re-applying it. Confirm the remediation assignment is paused, and that'
            Note 'no configuration profile writes this OMA-URI.'
        }
    }
} else {
    Note 'Nothing to delete.'
}

# --------------------------------------------- 4. did the derived state clear?
Head '4. Did RestrictRun clear?'
Note 'This is the check worth running the script for. Deleting the configuration is documented'
Note 'as not reverting everything, so the question is what actually went.'
if (-not (Test-Path 'HKU:')) {
    New-PSDrive -Name HKU -PSProvider Registry -Root HKEY_USERS -Scope Script -ErrorAction SilentlyContinue | Out-Null
}
$root = "HKU:\$sid"
$loaded = $false
if (-not (Test-Path $root)) {
    $dat = "C:\Users\$AccountName\NTUSER.DAT"
    if (Test-Path $dat) {
        $o = & reg load "HKU\$hiveTag" $dat 2>&1
        if ($LASTEXITCODE -eq 0) { $root = "HKU:\$hiveTag"; $loaded = $true }
        else { Warn "Could not load the hive: $($o -join ' ')"; $root = $null }
    } else {
        Item 'Hive' 'no NTUSER.DAT, the profile has never been created'
        $root = $null
    }
}
$rrStillThere = $false
if ($root) {
    $ek = "$root\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer"
    if (-not (Test-Path $ek)) {
        Good 'No Policies\Explorer key. RestrictRun is gone.'
    } else {
        $ex = Get-ItemProperty $ek -ErrorAction SilentlyContinue
        Item 'RestrictRun' $(if ($null -eq $ex.RestrictRun) { 'not set, cleared' } else { "$($ex.RestrictRun)" })
        $sub = "$ek\RestrictRun"
        if (Test-Path $sub) {
            $props = @(Get-Item $sub | Select-Object -ExpandProperty Property -ErrorAction SilentlyContinue)
            Item 'RestrictRun list entries' $props.Count
            if ($props.Count -gt 0) {
                $rrStillThere = $true
                Warn 'The list survived the configuration delete. This is the accumulated state.'
                Note 'It is rewritten at the next sign-in under the new configuration, so it does not need'
                Note 'clearing by hand. Deleting the profile in the next step removes it outright.'
            }
        } else {
            Good 'RestrictRun list subkey is gone.'
        }
    }
    if ($loaded) { & reg unload "HKU\$hiveTag" 2>&1 | Out-Null }
}

# -------------------------------------------------------- 5. delete the profile
Head '5. Kiosk profile'
if ($SkipProfileDelete) {
    Warn 'Skipped by request. Note that the Start menu configuration is documented as surviving'
    Note 'a configuration delete, so leaving the profile leaves the state most likely at fault.'
} else {
    $prof = @(Get-CimInstance Win32_UserProfile -ErrorAction SilentlyContinue |
              Where-Object { $_.SID -eq $sid })
    if ($prof.Count -eq 0) {
        Item 'Profile' 'none registered, nothing to delete'
    } else {
        foreach ($p in $prof) {
            Item 'Path' "$($p.LocalPath)"
            Item 'Loaded' "$($p.Loaded)"
            if ($p.Loaded) {
                Bad 'The profile is loaded, so the account is signed in. Sign it out and run again.'
                Note 'Deleting a loaded profile leaves the account in a broken half-state.'
            } elseif ($PSCmdlet.ShouldProcess("$($p.LocalPath)", 'Delete user profile')) {
                Remove-CimInstance -InputObject $p -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 2
                if (Test-Path "$($p.LocalPath)") {
                    Warn 'The directory still exists. The registry entry may have gone; check after restart.'
                } else {
                    Good 'Profile deleted, including its registry hive and ProfileList entry.'
                }
            }
        }
    }
}

# ------------------------------------------------------------------ 6. next
Head '6. State after reset'
$inst2 = Get-CimInstance -Namespace $NS -ClassName $CLASS -ErrorAction SilentlyContinue
Item 'Assigned Access configuration' $(if (-not $inst2 -or -not $inst2.Configuration) { 'empty' } else { 'STILL PRESENT' })
Item 'Kiosk profile directory' $(if (Test-Path "C:\Users\$AccountName") { 'still present' } else { 'gone' })
Item 'Local account' $(if (Get-LocalUser -Name $AccountName -ErrorAction SilentlyContinue) { 'intact, as intended' } else { 'MISSING' })

Head '7. Next'
Note '1. RESTART now. Do not apply anything first.'
Note '2. Run Set-KioskAssignedAccessTest.ps1 ONCE as SYSTEM. Do not run it repeatedly.'
Note '3. RESTART again, and let the kiosk account sign in.'
Note '4. Check the Start menu: Edge and the three LibreOffice pins.'
Note '5. RESTART four or five more times and count the failures. One clean boot proves nothing,'
Note '   because the fault is intermittent. Note for each boot whether an Edge update landed.'
Note '6. If a pin drops, read Microsoft-Windows-AssignedAccess/Operational immediately. It is'
Note '   enabled now, and some of these events are written once only.'
Note '7. Leave the remediation assignment paused until the count is done.'
Write-Host ''
