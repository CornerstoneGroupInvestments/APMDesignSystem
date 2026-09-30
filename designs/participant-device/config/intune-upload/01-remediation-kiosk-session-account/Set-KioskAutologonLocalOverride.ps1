<#
.SYNOPSIS
    Clears the two local settings that block automatic logon on a Participant Kiosk, then
    proves whether they were local or pushed.

.DESCRIPTION
    Get-KioskAutologonBlockers.ps1 reported that neither the logon banner nor the device
    password policy arrived through MDM. That leaves local security policy or a Group Policy
    object, and neither is fixed by an Intune exclusion. This script changes them on the
    device, through the supported mechanism for each.

    What it changes:
      1. Logon banner. Clears LegalNoticeCaption and LegalNoticeText as a security option
         through secedit, and from both registry locations Winlogon reads (the policy key
         and the legacy Winlogon key).
      2. Local password policy. Minimum length 0, complexity off, maximum age unlimited,
         history 0, lockout threshold 0. A device password restriction disables automatic
         logon by design, and exempting the account from expiry does not address it.
      3. Machine inactivity limit. Cleared, because an unattended kiosk that locks its own
         screen presents a lock screen no participant can clear.

    Then it runs gpupdate /force and re-reads every value. That is the point of the script,
    not a formality: if a value returns, it is being pushed from somewhere and the real fix
    is an exclusion, not this script. If it stays clear, it was local and the device is done.

    Everything changed is backed up to JSON first, and -Restore puts it all back.

.PARAMETER Restore
    Restores the values saved in the backup file and exits.

.PARAMETER SkipPasswordPolicy
    Clears the banner and inactivity limit only, leaving the password policy alone.

.NOTES
    Run elevated. Test device only: this weakens the device's local security posture, which
    on a kiosk is compensated by Assigned Access, App Control and the absence of any
    participant identity, but on any other device it is simply a weakening.
    Diagnostic and build tooling. Not an Intune object, not deployed, not assigned.
#>
[CmdletBinding()]
param(
    [switch]$Restore,
    [switch]$SkipPasswordPolicy,
    [string]$BackupPath = 'C:\APM\PK\autologon-local-override-backup.json'
)

$ErrorActionPreference = 'Continue'
function Head($t) { Write-Host ''; Write-Host ('== ' + $t) -ForegroundColor Cyan }
function Item($k, $v) { Write-Host ('   {0,-40} {1}' -f $k, $v) }
function Good($t) { Write-Host ('   OK    ' + $t) -ForegroundColor Green }
function Bad($t)  { Write-Host ('   PUSH  ' + $t) -ForegroundColor Red }
function Note($t) { Write-Host ('         ' + $t) -ForegroundColor DarkGray }

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Run this script elevated.'
}

$POLSYS = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System'
$WINLOG = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
$sdb    = "$env:TEMP\apm-kiosk-secedit.sdb"
$infOut = "$env:TEMP\apm-kiosk-apply.inf"

function Read-State {
    $p = Get-ItemProperty $POLSYS -ErrorAction SilentlyContinue
    $w = Get-ItemProperty $WINLOG -ErrorAction SilentlyContinue
    $exp = "$env:TEMP\apm-kiosk-export.inf"
    & secedit /export /cfg $exp /quiet 2>$null | Out-Null
    $sys = @{}
    if (Test-Path $exp) {
        $inSection = $false
        foreach ($line in Get-Content $exp -Encoding Unicode) {
            if ($line -match '^\[System Access\]') { $inSection = $true; continue }
            if ($line -match '^\[') { $inSection = $false; continue }
            if ($inSection -and $line -match '^\s*(\w+)\s*=\s*(.+?)\s*$') { $sys[$Matches[1]] = $Matches[2] }
        }
        Remove-Item $exp -Force -ErrorAction SilentlyContinue
    }
    [pscustomobject]@{
        LegalNoticeCaption       = $p.LegalNoticeCaption
        LegalNoticeText          = $p.LegalNoticeText
        WinlogonNoticeCaption    = $w.LegalNoticeCaption
        WinlogonNoticeText       = $w.LegalNoticeText
        InactivityTimeoutSecs    = $p.InactivityTimeoutSecs
        MinimumPasswordLength    = $sys['MinimumPasswordLength']
        PasswordComplexity       = $sys['PasswordComplexity']
        MaximumPasswordAge       = $sys['MaximumPasswordAge']
        PasswordHistorySize      = $sys['PasswordHistorySize']
        LockoutBadCount          = $sys['LockoutBadCount']
    }
}

function Show-State($s, $label) {
    Head $label
    Item 'LegalNoticeCaption (policy key)' $(if ($s.LegalNoticeCaption) { "SET: $($s.LegalNoticeCaption)" } else { '(clear)' })
    Item 'LegalNoticeText (policy key)'    $(if ($s.LegalNoticeText) { 'SET' } else { '(clear)' })
    Item 'LegalNoticeCaption (Winlogon)'   $(if ($s.WinlogonNoticeCaption) { "SET: $($s.WinlogonNoticeCaption)" } else { '(clear)' })
    Item 'LegalNoticeText (Winlogon)'      $(if ($s.WinlogonNoticeText) { 'SET' } else { '(clear)' })
    Item 'InactivityTimeoutSecs'           $(if ($s.InactivityTimeoutSecs) { "$($s.InactivityTimeoutSecs) - locks the screen" } else { '(clear)' })
    Item 'MinimumPasswordLength'           $s.MinimumPasswordLength
    Item 'PasswordComplexity'              $s.PasswordComplexity
    Item 'MaximumPasswordAge'              $s.MaximumPasswordAge
    Item 'PasswordHistorySize'             $s.PasswordHistorySize
    Item 'LockoutBadCount'                 $s.LockoutBadCount
}

function Invoke-Secedit($body) {
    # A minimal INF applies only the keys it names. Applying a whole re-imported export
    # would rewrite every security option on the device, including ones nothing asked for.
    $inf = @"
[Unicode]
Unicode=yes
[Version]
signature="`$CHICAGO`$"
Revision=1
$body
"@
    Set-Content -Path $infOut -Value $inf -Encoding Unicode -Force
    $out = & secedit /configure /db $sdb /cfg $infOut /areas SECURITYPOLICY /quiet 2>&1
    if ($LASTEXITCODE -ne 0) { Write-Warning "secedit exit $LASTEXITCODE : $out" }
}

# ------------------------------------------------------------------- restore
if ($Restore) {
    if (-not (Test-Path $BackupPath)) { throw "No backup at $BackupPath" }
    $b = Get-Content $BackupPath -Raw | ConvertFrom-Json
    Head 'Restoring saved values'
    $reg = @()
    if ($b.LegalNoticeCaption) { $reg += "MACHINE\Software\Microsoft\Windows\CurrentVersion\Policies\System\LegalNoticeCaption=1,$($b.LegalNoticeCaption)" }
    if ($b.LegalNoticeText)    { $reg += "MACHINE\Software\Microsoft\Windows\CurrentVersion\Policies\System\LegalNoticeText=7,$($b.LegalNoticeText)" }
    if ($b.InactivityTimeoutSecs) { $reg += "MACHINE\Software\Microsoft\Windows\CurrentVersion\Policies\System\InactivityTimeoutSecs=4,$($b.InactivityTimeoutSecs)" }
    $sysBody = @()
    foreach ($k in 'MinimumPasswordLength', 'PasswordComplexity', 'MaximumPasswordAge', 'PasswordHistorySize', 'LockoutBadCount') {
        if ($null -ne $b.$k -and $b.$k -ne '') { $sysBody += "$k = $($b.$k)" }
    }
    $body = ''
    if ($sysBody.Count) { $body += "[System Access]`n" + ($sysBody -join "`n") + "`n" }
    if ($reg.Count)     { $body += "[Registry Values]`n" + ($reg -join "`n") + "`n" }
    if ($body) { Invoke-Secedit $body }
    if ($b.WinlogonNoticeCaption) { Set-ItemProperty $WINLOG -Name LegalNoticeCaption -Value $b.WinlogonNoticeCaption -Type String }
    if ($b.WinlogonNoticeText)    { Set-ItemProperty $WINLOG -Name LegalNoticeText    -Value $b.WinlogonNoticeText    -Type String }
    & gpupdate /force /target:computer | Out-Null
    Show-State (Read-State) 'State after restore'
    Good 'Restored.'
    return
}

# -------------------------------------------------------------------- backup
$before = Read-State
Show-State $before 'Before'

New-Item -ItemType Directory -Path (Split-Path $BackupPath -Parent) -Force | Out-Null
$before | ConvertTo-Json -Depth 3 | Set-Content -Path $BackupPath -Encoding UTF8 -Force
Head 'Backup'
Item 'Written to' $BackupPath
Note 'Reverse everything with:  .\Set-KioskAutologonLocalOverride.ps1 -Restore'

# --------------------------------------------------------------------- apply
Head 'Applying'
$regLines = @(
    'MACHINE\Software\Microsoft\Windows\CurrentVersion\Policies\System\LegalNoticeCaption=1,',
    'MACHINE\Software\Microsoft\Windows\CurrentVersion\Policies\System\LegalNoticeText=7,',
    'MACHINE\Software\Microsoft\Windows\CurrentVersion\Policies\System\InactivityTimeoutSecs=4,0'
)
$body = "[Registry Values]`n" + ($regLines -join "`n") + "`n"
if (-not $SkipPasswordPolicy) {
    $body = @"
[System Access]
MinimumPasswordLength = 0
PasswordComplexity = 0
MaximumPasswordAge = -1
PasswordHistorySize = 0
LockoutBadCount = 0
"@ + "`n" + $body
    Item 'Password policy' 'minimum length 0, complexity off, age unlimited, history 0, lockout 0'
} else {
    Item 'Password policy' 'skipped (-SkipPasswordPolicy)'
}
Item 'Logon banner' 'cleared as a security option'
Item 'Machine inactivity limit' 'cleared'
Invoke-Secedit $body

# The security option covers the policy key. The legacy Winlogon values are a separate
# location that Windows still honours and secedit does not touch.
Remove-ItemProperty $WINLOG -Name LegalNoticeCaption -ErrorAction SilentlyContinue
Remove-ItemProperty $WINLOG -Name LegalNoticeText    -ErrorAction SilentlyContinue
Remove-ItemProperty $POLSYS -Name LegalNoticeCaption -ErrorAction SilentlyContinue
Remove-ItemProperty $POLSYS -Name LegalNoticeText    -ErrorAction SilentlyContinue
Item 'Legacy Winlogon banner values' 'removed'

# --------------------------------------------------------- prove it was local
Head 'Forcing a policy refresh, then re-reading'
Note 'This is the test. A value that comes back is being pushed, and no local change will hold it.'
& gpupdate /force /target:computer | Out-Null
Start-Sleep -Seconds 5
$after = Read-State
Show-State $after 'After gpupdate'

Head 'Verdict'
$returned = @()
if ($after.LegalNoticeCaption -or $after.LegalNoticeText -or $after.WinlogonNoticeCaption -or $after.WinlogonNoticeText) { $returned += 'logon banner' }
if ($after.InactivityTimeoutSecs) { $returned += 'machine inactivity limit' }
if (-not $SkipPasswordPolicy -and ([int]$after.MinimumPasswordLength -gt 0 -or [int]$after.PasswordComplexity -eq 1)) { $returned += 'password policy' }

if ($returned.Count -eq 0) {
    Good 'Everything stayed clear. These settings were local to this device and are now cleared.'
    Note 'Restart, then run Detect-KioskSessionAccount.ps1. It should report compliant, and the device should sign itself in.'
    Note 'Nothing needs excluding in Intune for this device. A production device carrying the corporate baseline will still need the exclusions.'
} else {
    Bad "Returned after gpupdate: $($returned -join ', ')"
    Note 'A pushed setting cannot be fixed on the device. Find the source and exclude the kiosk group.'
    Note 'Domain or local GPO:  gpresult /scope computer /h gp.html  then search for LegalNotice and Password.'
    Note 'Intune ADMX or settings catalog: re-run Get-KioskAutologonBlockers.ps1 -MdmReport and read MDMDiagReport.html.'
    Note 'If a local GPO is the source, the Registry.pol under C:\Windows\System32\GroupPolicy re-applies at every refresh: edit it with the Local Group Policy Editor or LGPO.exe, not with the registry.'
}
Write-Host ''
