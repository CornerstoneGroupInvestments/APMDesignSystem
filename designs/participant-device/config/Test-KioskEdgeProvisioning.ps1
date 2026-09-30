<#
.SYNOPSIS
    Measures whether Microsoft Edge is provisioned and registered correctly on a Participant
    Kiosk, and whether its Start menu identity resolves. Read-only.

.DESCRIPTION
    Written to run under Constrained Language Mode, so it needs no signing.

    All three Assigned Access pin forms (desktopAppLink, desktopAppId, packagedAppId) failed
    identically, which rules out the pin form. Three different addressing mechanisms cannot
    share a naming fault, so the remaining question is whether the thing being named is
    resolvable at all.

    Edge on Windows 11 carries a packaged app identity. A packaged app appears on Start only
    when its package is REGISTERED FOR THAT ACCOUNT, not merely installed on the machine. A
    classic Win32 shortcut such as LibreOffice's resolves by path and has no such requirement.
    That is exactly the split observed on this device: Edge drops, LibreOffice survives.

    Sections:
      1. The Win32 installation. Paths, version, and which Program Files tree.
      2. The packaged identity, machine-wide, with the per-user registration state of EVERY
         account on the device. This is where a kiosk account with no registration shows up.
      3. The provisioned package, which is what a newly created profile inherits. A missing
         provisioned package means every new profile starts without Edge registered.
      4. Get-StartApps. The definitive test: if Edge is not listed, no pin can resolve.
      5. Shortcuts in both Start Menu trees.
      6. The update machinery, which is what re-stages the package and can deregister it.
      7. Verdict.

.NOTES
    Run elevated, so section 2 can enumerate all users. Runs happily as an administrator; it
    does not need SYSTEM because it writes nothing.

    Section 4 measures the account it runs as. Run it a second time signed in as the kiosk
    account for the answer that matters, or read section 2, which covers every account.

    Diagnostic tooling. Not an Intune object, not deployed, not assigned.
#>
[CmdletBinding()]
param(
    [string]$AccountName
)

$ErrorActionPreference = 'Continue'
function Head($t) { Write-Host ''; Write-Host ('== ' + $t) -ForegroundColor Cyan }
function Item($k, $v) { Write-Host ('   {0,-44} {1}' -f $k, $v) }
function Good($t) { Write-Host ('   OK    ' + $t) -ForegroundColor Green }
function Bad($t)  { Write-Host ('   FAIL  ' + $t) -ForegroundColor Red }
function Warn($t) { Write-Host ('   WARN  ' + $t) -ForegroundColor Yellow }
function Note($t) { Write-Host ('         ' + $t) -ForegroundColor DarkGray }
function Trunc($s, $n) {
    if (-not $s) { return '' }
    $t = "$s" -replace '\s+', ' '
    if ($t.Length -le $n) { return $t }
    return $t.Substring(0, $n)
}

$AUMID = 'Microsoft.MicrosoftEdge.Stable_8wekyb3d8bbwe!App'
$PFN = 'Microsoft.MicrosoftEdge.Stable_8wekyb3d8bbwe'
$findings = @()

if (-not $AccountName) {
    $serial = ((Get-CimInstance Win32_BIOS).SerialNumber -replace '[^A-Za-z0-9]', '').ToUpperInvariant()
    if ($serial.Length -gt 14) { $serial = $serial.Substring(0, 14) }
    $AccountName = "Kiosk-$serial"
}

Write-Host ''
Write-Host 'Participant Kiosk - Microsoft Edge provisioning' -ForegroundColor White
Item 'Device' $env:COMPUTERNAME
Item 'Run at' (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Item 'Running as' ((& whoami) -join '')
Item 'Language mode' $ExecutionContext.SessionState.LanguageMode
Item 'Kiosk account' $AccountName
Item 'Expected AUMID' $AUMID

# --------------------------------------------------------- 1. Win32 install
Head '1. Win32 installation'
$exe = $null
foreach ($p in "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe") {
    if (-not $exe -and (Test-Path $p)) { $exe = $p }
}
if (-not $exe) {
    Bad 'msedge.exe not found in either Program Files tree. Edge is not installed.'
    $findings += 'Edge not installed'
} else {
    Item 'Executable' $exe
    $fi = Get-Item -LiteralPath $exe
    Item 'Version' "$($fi.VersionInfo.ProductVersion)"
    Item 'Last written' $fi.LastWriteTime.ToString('yyyy-MM-dd HH:mm')
    $verDirs = @(Get-ChildItem (Split-Path $exe -Parent) -Directory -ErrorAction SilentlyContinue |
                 Where-Object { $_.Name -match '^\d+\.' })
    Item 'Version folders present' $(if ($verDirs.Count -gt 0) { ($verDirs | Select-Object -ExpandProperty Name) -join ', ' } else { 'none' })
    if ($verDirs.Count -gt 1) {
        Warn 'More than one version folder. An update has been staged and the old build not yet removed.'
        Note 'A staged update re-registers the package at restart, which is one way a pin is lost.'
        $findings += 'multiple Edge versions staged'
    }
}

# ------------------------------------------- 2. packaged identity, all users
Head '2. Packaged identity and per-user registration'
Note 'A packaged app appears on Start only when registered for that account. This is the check'
Note 'that shows whether the kiosk account has it.'
$anyAll = $null
try {
    $anyAll = @(Get-AppxPackage -Name 'Microsoft.MicrosoftEdge.Stable' -AllUsers -ErrorAction Stop)
} catch {
    Warn "Get-AppxPackage -AllUsers failed: $(Trunc $_.Exception.Message 80)"
    Note 'Needs elevation. Without it, only the running account can be measured.'
}
if ($null -eq $anyAll) {
    try { $anyAll = @(Get-AppxPackage -Name 'Microsoft.MicrosoftEdge.Stable' -ErrorAction Stop) } catch { $anyAll = @() }
}
if ($anyAll.Count -eq 0) {
    Bad 'No Microsoft.MicrosoftEdge.Stable package on this device at all.'
    Note 'Edge is installed as a Win32 application but its packaged identity is not registered.'
    Note 'A packagedAppId pin cannot resolve, and neither can a shortcut that resolves to that identity.'
    $findings += 'no packaged identity'
} else {
    foreach ($pkg in $anyAll) {
        Item 'PackageFullName' "$($pkg.PackageFullName)"
        Item 'PackageFamilyName' "$($pkg.PackageFamilyName)"
        Item 'Status' "$($pkg.Status)"
        Item 'InstallLocation' "$(Trunc $pkg.InstallLocation 70)"
        if ("$($pkg.PackageFamilyName)" -ne $PFN) {
            Warn "PackageFamilyName does not match the AUMID in the configuration ($PFN)."
            $findings += 'AUMID mismatch'
        }
        $kioskSeen = $false
        $users = @($pkg.PackageUserInformation)
        if ($users.Count -eq 0) {
            Warn 'No per-user registration information returned. Re-run elevated.'
        } else {
            Write-Host ''
            Item 'Per-user registration' "$($users.Count) account(s)"
            foreach ($u in $users) {
                # "$u" on an AppxUserSecurityId prints the type name, not the SID. An earlier
                # build did that and then matched the account name against the type name, so it
                # reported every account as unregistered. Read the SID and resolve it instead.
                $usid = "$($u.UserSecurityId.Sid)"
                if (-not $usid) { $usid = "$($u.UserSecurityId)" }
                $uname = ''
                foreach ($lu in @(Get-LocalUser -ErrorAction SilentlyContinue)) {
                    if ("$($lu.SID)" -eq $usid) { $uname = "$($lu.Name)" }
                }
                $st = "$($u.InstallState)"
                Item "   $(if ($uname) { $uname } else { $usid })" "$st$(if ($uname) { "  ($usid)" })"
                if ($uname -eq $AccountName) {
                    $kioskSeen = $true
                    if ($st -ne 'Installed') {
                        Bad "The kiosk account's registration state is $st, not Installed."
                        $findings += 'kiosk registration not Installed'
                    } else {
                        Good 'The kiosk account has Edge registered.'
                    }
                }
            }
            if (-not $kioskSeen) {
                Warn "No registration entry resolved to $AccountName."
                Note 'If a SID above could not be resolved to a name, this is inconclusive rather than a'
                Note 'finding. Compare the SIDs above against the kiosk account SID before concluding.'
                $kioskSid = ''
                $ka = Get-LocalUser -Name $AccountName -ErrorAction SilentlyContinue
                if ($ka) { $kioskSid = "$($ka.SID)" }
                Item '   Kiosk account SID for comparison' $kioskSid
                $findings += 'kiosk registration not confirmed'
            }
        }
    }
}

# ------------------------------------------------- 3. provisioned package
Head '3. Provisioned package, inherited by new profiles'
Note 'A provisioned package is registered automatically for each newly created profile. Without'
Note 'one, every new profile starts with Edge unregistered.'
try {
    $prov = @(Get-AppxProvisionedPackage -Online -ErrorAction Stop |
              Where-Object { $_.DisplayName -match 'MicrosoftEdge' })
    if ($prov.Count -eq 0) {
        Bad 'Edge is NOT provisioned. New profiles will not get the packaged identity registered.'
        $findings += 'not provisioned'
    } else {
        foreach ($p in $prov) {
            Item "$($p.DisplayName)" "$($p.Version)"
            Item '   PackageName' "$(Trunc $p.PackageName 70)"
        }
        Good 'Edge is provisioned for new profiles.'
    }
} catch {
    Warn "Get-AppxProvisionedPackage failed: $(Trunc $_.Exception.Message 80)"
    Note 'Needs elevation. Nothing is concluded about provisioning from this run.'
}

# ------------------------------------------------------- 4. does it resolve
Head '4. Does the identity resolve as a Start app?'
Note 'The definitive test. Get-StartApps lists what Start can actually show for THIS account.'
Note 'If Edge is absent here, no pin of any form can appear for this account.'
try {
    $apps = @(Get-StartApps -ErrorAction Stop)
    Item 'Start apps visible to this account' $apps.Count
    $edgeApps = @($apps | Where-Object { "$($_.Name)" -match 'Edge' -or "$($_.AppID)" -match 'MicrosoftEdge' })
    if ($edgeApps.Count -eq 0) {
        Bad 'Edge does not appear in Get-StartApps for this account.'
        $findings += 'does not resolve as a Start app'
    } else {
        foreach ($a in $edgeApps) { Item "   $($a.Name)" "$($a.AppID)" }
        $exact = @($edgeApps | Where-Object { "$($_.AppID)" -eq $AUMID })
        if ($exact.Count -gt 0) {
            Good "The configured AUMID resolves exactly: $AUMID"
        } else {
            Bad 'Edge resolves, but NOT under the packaged AUMID.'
            Note 'Use the AppID reported above verbatim. An AppID in Known Folder GUID form is a'
            Note 'classic desktop AppID, so the pin must be desktopAppId, not packagedAppId.'
            Note 'Copy it into the pin exactly, escaping each backslash for JSON.'
            $findings += 'AUMID differs from the resolved AppID'
        }
    }
    # LibreOffice for contrast: these pins survive, so their resolution is the control case
    $lo = @($apps | Where-Object { "$($_.Name)" -match 'LibreOffice' })
    Item 'LibreOffice entries (control)' $lo.Count
} catch {
    Warn "Get-StartApps failed: $(Trunc $_.Exception.Message 80)"
    Note 'This cmdlet is per-user and needs an interactive session. It returns nothing under SYSTEM.'
}

# ------------------------------------------------------------ 5. shortcuts
Head '5. Start menu shortcuts'
foreach ($sm in "$env:ALLUSERSPROFILE\Microsoft\Windows\Start Menu\Programs\Microsoft Edge.lnk",
                "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Microsoft Edge.lnk") {
    if (Test-Path $sm) {
        $l = Get-Item -LiteralPath $sm
        Item 'Present' "$sm"
        Item '   Created / written' "$($l.CreationTime.ToString('MM-dd HH:mm')) / $($l.LastWriteTime.ToString('MM-dd HH:mm'))"
    } else {
        Item 'Absent' "$sm"
    }
}
$kioskLnk = "C:\Users\$AccountName\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Microsoft Edge.lnk"
Item 'Kiosk per-user shortcut' $(if (Test-Path $kioskLnk) { 'present' } else { 'absent' })

# ------------------------------------------------------ 6. update machinery
Head '6. Update machinery'
Note 'An Edge update re-stages the package. Re-registration at restart is one documented way a'
Note 'Start pin is lost, and it is the remaining candidate if registration looks correct.'
foreach ($svc in 'edgeupdate', 'edgeupdatem', 'MicrosoftEdgeElevationService') {
    $s = Get-Service -Name $svc -ErrorAction SilentlyContinue
    Item $svc $(if ($s) { "$($s.Status), startup $($s.StartType)" } else { 'not present' })
}
$tasks = @(Get-ScheduledTask -TaskPath '\' -ErrorAction SilentlyContinue |
           Where-Object { "$($_.TaskName)" -match 'Edge' })
Item 'Edge scheduled tasks' $tasks.Count
foreach ($t in $tasks) { Item "   $($t.TaskName)" "$($t.State)" }
if ($tasks.Count -gt 0 -or (Get-Service -Name 'edgeupdate' -ErrorAction SilentlyContinue)) {
    Note 'Edge updates itself on this device. Suppressing the updater and managing the version'
    Note 'through the same controlled path as the other applications removes this variable.'
}

# ------------------------------------------------------------- 7. verdict
Head '7. Verdict'
if ($findings.Count -eq 0) {
    Good 'Edge is provisioned, registered and resolves as a Start app for the account tested.'
    Note 'If the pin still drops, registration is not the cause. Run this again signed in as the'
    Note 'kiosk account immediately after a failed boot, so section 4 measures that account at the'
    Note 'moment the pin is missing. If it resolves then too, the remaining candidate is the Edge'
    Note 'updater re-staging the package at restart.'
} else {
    Write-Host ''
    Write-Host "   $($findings.Count) finding(s): $($findings -join '; ')" -ForegroundColor Yellow
    Write-Host ''
    if ($findings -contains 'no packaged identity' -or $findings -contains 'not provisioned') {
        Write-Host '   Edge has no packaged identity to pin' -ForegroundColor White
        Note 'Edge is installed as a Win32 application without its packaged registration, so the AUMID'
        Note 'in AllowedApps names something that does not exist on this device. That explains why all'
        Note 'three pin forms behave the same, and why the pin appears only transiently.'
        Note 'Deploy Edge through the Microsoft Edge Enterprise MSI rather than any stub or offline'
        Note 'installer that skips registration, and confirm with this script that the provisioned'
        Note 'package appears before enrolling more devices.'
    }
    if ($findings -contains 'kiosk registration not confirmed' -or $findings -contains 'kiosk registration not Installed') {
        Write-Host '   Kiosk account registration' -ForegroundColor White
        Note 'Compare the SIDs listed in section 2 against the kiosk account SID printed there. If the'
        Note 'kiosk SID is absent, Edge is not registered for that account and Start has nothing to'
        Note 'show. Registration normally happens at first sign-in from the provisioned package, so'
        Note 'check section 3 first: if Edge is not provisioned, no new profile will ever get it.'
    }
    if ($findings -contains 'AUMID differs from the resolved AppID' -or $findings -contains 'AUMID mismatch') {
        Write-Host '   The configuration names an identity Start does not use' -ForegroundColor White
        Note 'Take the AppID from section 4 verbatim. If it is in Known Folder GUID form it is a'
        Note 'classic desktop AppID, so the pin is desktopAppId, not packagedAppId, and the AUMID'
        Note 'entry in AllowedApps stays as it is (Microsoft documents it for Edge secondary tiles).'
    }
    if ($findings -contains 'multiple Edge versions staged') {
        Write-Host '   An update is staged' -ForegroundColor White
        Note 'Re-run after a restart. If the pin fails on exactly the boots where a version folder is'
        Note 'cleaned up, the updater is the cause.'
    }
}
Write-Host ''
