<#
.SYNOPSIS
    Diagnostic: works out why Start pins are missing from the Participant Kiosk restricted
    session. Read-only.

.DESCRIPTION
    A Start pin fails soft. Microsoft: "If an app isn't installed for the user, but is
    included in the Start layout XML, the app isn't shown on the Start screen." So a wrong
    shortcut path costs a missing tile and produces no error anywhere, which is why a kiosk
    can come up with a working restricted session and an almost empty Start menu.

    This reads the configuration actually applied to the device (not the source file),
    extracts every StartPins desktopAppLink and every AllowedApps DesktopAppPath, expands
    the environment variables against the kiosk profile rather than SYSTEM's, and tests
    each one. Then it lists the shortcuts that really are on the device, so the correct
    paths can be read off rather than guessed.

    Two couplings that produce the same symptom and are checked separately:
      - A pin whose shortcut does not exist is not shown.
      - A pin whose target executable is not in AllowedApps is not shown either, because
        Assigned Access generates the AppLocker allow-list from that list.

    %APPDATA% is expanded against the kiosk user's profile, not the running account's. Run
    as SYSTEM and %APPDATA% would otherwise resolve to SYSTEM's own AppData, and every
    per-user pin would read as missing when it is fine.

.NOTES
    Run elevated. Written to run under Constrained Language Mode.
    Diagnostic only. Not an Intune object, not deployed, not assigned.
#>
[CmdletBinding()]
param([string]$AccountName)

$ErrorActionPreference = 'Continue'
function Head($t) { Write-Host ''; Write-Host ('== ' + $t) -ForegroundColor Cyan }
function Item($k, $v) { Write-Host ('   {0,-58} {1}' -f $k, $v) }
function Good($t) { Write-Host ('   OK      ' + $t) -ForegroundColor Green }
function Bad($t)  { Write-Host ('   MISSING ' + $t) -ForegroundColor Red }
function Note($t) { Write-Host ('           ' + $t) -ForegroundColor DarkGray }

Write-Host ''
Write-Host 'Participant Kiosk - Start pin resolution' -ForegroundColor White
Item 'Language mode' $ExecutionContext.SessionState.LanguageMode

if (-not $AccountName) {
    $serial = ((Get-CimInstance Win32_BIOS).SerialNumber -replace '[^A-Za-z0-9]', '').ToUpperInvariant()
    if ($serial.Length -gt 14) { $serial = $serial.Substring(0, 14) }
    $AccountName = "Kiosk-$serial"
}
Item 'Session account' $AccountName

# The kiosk user's own profile, for %APPDATA% and %LOCALAPPDATA%. Absent until the account
# has signed in at least once, which is itself a finding.
$acct = Get-LocalUser -Name $AccountName -ErrorAction SilentlyContinue
$userProfile = $null
if ($acct) {
    $sid = "$($acct.SID)"
    $pl = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList\$sid" -ErrorAction SilentlyContinue
    if ($pl) { $userProfile = $pl.ProfileImagePath }
}
Item 'Kiosk profile path' $(if ($userProfile) { $userProfile } else { 'NOT CREATED - the account has never signed in' })

function Expand-KioskPath($p) {
    # Manual expansion: [Environment]::ExpandEnvironmentVariables is blocked under CLM.
    # %ProgramFiles(x86)% is replaced before %ProgramFiles%, and its parentheses are escaped
    # because -replace takes a regular expression.
    $up = $userProfile
    if (-not $up) { $up = "$env:SystemDrive\Users\$AccountName" }
    $p -replace '%ProgramFiles\(x86\)%', ${env:ProgramFiles(x86)} `
       -replace '%ProgramFiles%',        $env:ProgramFiles `
       -replace '%SystemRoot%',          $env:SystemRoot `
       -replace '%ALLUSERSPROFILE%',     $env:ALLUSERSPROFILE `
       -replace '%APPDATA%',             "$up\AppData\Roaming" `
       -replace '%LOCALAPPDATA%',        "$up\AppData\Local" `
       -replace '%USERPROFILE%',         $up
}

# ------------------------------------------------- 1. the configuration in force
Head '1. Applied Assigned Access configuration'
$aa = Get-CimInstance -Namespace 'root\cimv2\mdm\dmmap' -ClassName 'MDM_AssignedAccess' -ErrorAction SilentlyContinue
if (-not $aa -or -not $aa.Configuration) {
    Bad 'No Assigned Access configuration is applied. Nothing further to check.'
    return
}
$cfg = $aa.Configuration -replace '&lt;', '<' -replace '&gt;', '>' -replace '&quot;', '"' -replace '&apos;', "'" -replace '&amp;', '&'
Item 'Configuration length' "$($cfg.Length) characters"
Item 'Names the session account' $cfg.Contains($AccountName)
Item 'Holds a literal [SERIAL]' $cfg.Contains('[SERIAL]')

# ------------------------------------------------------- 2. allowed applications
Head '2. AllowedApps - the executables'
$allowed = @()
foreach ($m in [regex]::Matches($cfg, 'DesktopAppPath="([^"]+)"')) {
    $raw = $m.Groups[1].Value
    $allowed += $raw
    $full = Expand-KioskPath $raw
    if (Test-Path $full) { Good $raw } else { Bad "$raw   ->   $full" }
}
Item 'Allowed apps in configuration' $allowed.Count
Note 'A missing executable here means the app is not installed. Its Start pin cannot appear.'

# --------------------------------------------------------------- 3. the Start pins
Head '3. StartPins - the shortcuts'
$pins = @()
foreach ($m in [regex]::Matches($cfg, '"desktopAppLink":"([^"]+)"')) {
    # JSON escapes each backslash, so \\ in the payload is one \ on disk
    $pins += ($m.Groups[1].Value -replace '\\\\', '\')
}
Item 'Pins in configuration' $pins.Count
Write-Host ''
$missing = @()
foreach ($p in $pins) {
    $full = Expand-KioskPath $p
    if (Test-Path $full) {
        Good $p
    } else {
        $missing += $p
        Bad $p
        Note "resolved to: $full"
    }
}

# --------------------------------------------- 4. what shortcuts actually exist
Head '4. Shortcuts that do exist on this device'
Note 'Read the correct paths from here. These are what the pins must name.'
$roots = @("$env:ALLUSERSPROFILE\Microsoft\Windows\Start Menu\Programs")
if ($userProfile) { $roots += "$userProfile\AppData\Roaming\Microsoft\Windows\Start Menu\Programs" }
foreach ($root in $roots) {
    Write-Host ''
    Item 'Searching' $root
    if (-not (Test-Path $root)) { Bad 'folder does not exist'; continue }
    $lnks = Get-ChildItem -Path $root -Filter '*.lnk' -Recurse -ErrorAction SilentlyContinue
    if (-not $lnks) { Bad 'no shortcuts found'; continue }
    foreach ($l in $lnks) {
        $rel = $l.FullName.Substring($root.Length)
        Write-Host ('      ' + $rel) -ForegroundColor Gray
    }
    Item 'Count' $lnks.Count
}

# -------------------------------------------------------------------- 5. verdict
Head '5. Verdict'
if ($missing.Count -eq 0) {
    Good 'Every pin resolves. If tiles are still missing, the cause is the AllowedApps coupling in section 2, not the shortcut paths.'
} else {
    Write-Host "   $($missing.Count) of $($pins.Count) pins do not resolve, and each is silently dropped from Start." -ForegroundColor Yellow
    Write-Host ''
    foreach ($p in $missing) { Write-Host "   $p" -ForegroundColor White }
    Write-Host ''
    Note 'Correct each path against section 4, then re-run the remediation. Assigned Access'
    Note 'reports nothing for a pin it cannot resolve, so a wrong path is invisible until'
    Note 'someone looks at the Start menu.'
    Note ''
    Note 'Two causes worth separating before editing paths:'
    Note '  - the application is genuinely not installed yet (section 2 will also show it'
    Note '    missing). Install order is the fix, through the Enrolment Status Page, not a'
    Note '    path change.'
    Note '  - the application is installed but its shortcut sits somewhere else, or under a'
    Note '    different name. Section 4 gives the real name.'
}
Write-Host ''
