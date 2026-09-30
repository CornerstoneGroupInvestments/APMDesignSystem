<#
.SYNOPSIS
    Reads RestrictRun and the other per-user restriction policies from the kiosk account's
    registry hive, and compares them against the applied Assigned Access allowed-app list.
    Read-only.

.DESCRIPTION
    Written to run under Constrained Language Mode, so it needs no signing.

    Pinning Edge by application identifier did not hold, so the next candidate is RestrictRun:
    a second allow-list that is not AppLocker, lives in the user's own hive, matches on the
    executable NAME rather than the path, and is rewritten whenever the kiosk profile
    refreshes. A per-user value regenerated on a schedule is the shape of a fault that comes
    and goes, which is what the Edge pin has been doing.

    HKEY_CURRENT_USER is the running user's hive, so reading the kiosk account's copy means
    either finding it already mounted under HKEY_USERS (it is, while that account is signed
    in) or loading NTUSER.DAT from its profile. This script does both, and unloads anything
    it loaded.

    Nothing here changes a value. The circulating workaround for RestrictRun is a scheduled
    task setting it to 0, which its own author describes as unsupported, and which would
    remove an enforcement layer from a public device whose AppLocker collections are already
    in audit. Establish the facts first.

.NOTES
    Run elevated, ideally while the kiosk account is signed in so its hive is live.
    Diagnostic tooling. Not an Intune object, not deployed, not assigned.
#>
[CmdletBinding()]
param(
    [string]$AccountName
)

$ErrorActionPreference = 'Continue'
function Head($t) { Write-Host ''; Write-Host ('== ' + $t) -ForegroundColor Cyan }
function Item($k, $v) { Write-Host ('   {0,-42} {1}' -f $k, $v) }
function Good($t) { Write-Host ('   OK    ' + $t) -ForegroundColor Green }
function Bad($t)  { Write-Host ('   FAIL  ' + $t) -ForegroundColor Red }
function Warn($t) { Write-Host ('   WARN  ' + $t) -ForegroundColor Yellow }
function Note($t) { Write-Host ('         ' + $t) -ForegroundColor DarkGray }

$findings = @()
$loadedHive = $false
$hiveTag = 'APMKioskDiag'

Write-Host ''
Write-Host 'Participant Kiosk - per-user restriction policies' -ForegroundColor White
Item 'Device' $env:COMPUTERNAME
Item 'Run at' (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Item 'Running as' ((& whoami) -join '')
Item 'Language mode' $ExecutionContext.SessionState.LanguageMode

# ------------------------------------------------------------- account and SID
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

# --------------------------------------------------------------- reach the hive
Head '1. Reaching the kiosk hive'
if (-not (Test-Path 'HKU:')) {
    New-PSDrive -Name HKU -PSProvider Registry -Root HKEY_USERS -Scope Script -ErrorAction SilentlyContinue | Out-Null
}
$root = "HKU:\$sid"
if (Test-Path $root) {
    Good 'Hive already mounted, so the account is signed in and these are live values.'
} else {
    $dat = "C:\Users\$AccountName\NTUSER.DAT"
    Item 'Not mounted, loading' $dat
    if (-not (Test-Path $dat)) {
        Bad 'No NTUSER.DAT. The account has never signed in on this device, so there is no hive to read.'
        exit 1
    }
    $out = & reg load "HKU\$hiveTag" $dat 2>&1
    if ($LASTEXITCODE -ne 0) {
        Bad "reg load failed: $($out -join ' ')"
        Note 'The hive is locked while the account is signed in. Either run this while it IS signed in'
        Note '(the values are live then and no load is needed), or sign it out fully first.'
        exit 1
    }
    $loadedHive = $true
    $root = "HKU:\$hiveTag"
    Warn 'Loaded from file. These are the values as last written, not necessarily what a live session sees.'
}

$explorerKey = "$root\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer"

# ------------------------------------------------------------- 2. RestrictRun
Head '2. RestrictRun'
Note 'Maps to the policy "Run only specified Windows applications". Matches on the executable'
Note 'NAME only, never the path, so no path correction affects this layer.'
$allowedNames = @()
if (-not (Test-Path $explorerKey)) {
    Good 'No Policies\Explorer key, so no RestrictRun and no DisallowRun.'
} else {
    $ex = Get-ItemProperty $explorerKey -ErrorAction SilentlyContinue
    $rr = $null
    if ($null -ne $ex.RestrictRun) { $rr = $ex.RestrictRun }
    Item 'RestrictRun' $(if ($null -eq $rr) { 'not set' } else { "$rr" })

    if ("$rr" -eq '1') {
        Bad 'RestrictRun is enforced. Only the executable names listed below can run in this session.'
        $sub = "$explorerKey\RestrictRun"
        if (-not (Test-Path $sub)) {
            Bad 'RestrictRun is 1 but the list subkey is missing. Nothing at all can run.'
            $findings += 'RestrictRun enforced with no list'
        } else {
            $props = @(Get-Item $sub | Select-Object -ExpandProperty Property -ErrorAction SilentlyContinue)
            Item 'Entries' $props.Count
            $vals = Get-ItemProperty $sub -ErrorAction SilentlyContinue
            foreach ($p in ($props | Sort-Object { [int]$_ } -ErrorAction SilentlyContinue)) {
                $v = "$($vals.$p)"
                if ($v) { $allowedNames += $v; Note ("  {0,-4} {1}" -f $p, $v) }
            }
            # A list longer than the allowed-app list means entries are appended at each apply
            # rather than the list being rebuilt. Not a block on its own, but it shows the
            # configuration is re-applied repeatedly, and a list that only grows will eventually
            # collide with the policy's own limits.
            $seen = @()
            $dupes = @()
            foreach ($n in $allowedNames) {
                $hit = $false
                foreach ($sn in $seen) { if ($sn -eq $n) { $hit = $true } }
                if ($hit) { $dupes += $n } else { $seen += $n }
            }
            Item 'Distinct names' $seen.Count
            if ($dupes.Count -gt 0) {
                Warn "Duplicated entries: $($dupes -join ', ')"
                Note 'The list is being appended to across applies, not rebuilt. Worth watching rather'
                Note 'than fixing, but a list that only grows will eventually be a problem.'
            }
        }
    } elseif ("$rr" -eq '0') {
        Warn 'RestrictRun is present and set to 0, so it is not restricting anything.'
        Note 'If nobody set that deliberately, something is turning it off. If somebody did, note that'
        Note 'it is reverted at every kiosk profile refresh and is not a supported configuration.'
        $findings += 'RestrictRun disabled'
    } else {
        Good 'RestrictRun is not set, so this layer is not restricting anything.'
    }

    if ($null -ne $ex.DisallowRun) {
        Bad "DisallowRun is set to $($ex.DisallowRun). This is a deny-list and blocks whatever it names."
        $dsub = "$explorerKey\DisallowRun"
        if (Test-Path $dsub) {
            $dp = @(Get-Item $dsub | Select-Object -ExpandProperty Property -ErrorAction SilentlyContinue)
            $dv = Get-ItemProperty $dsub -ErrorAction SilentlyContinue
            foreach ($p in $dp) { Note "  denied: $($dv.$p)" }
        }
        $findings += 'DisallowRun set'
    } else {
        Item 'DisallowRun' 'not set'
    }
}

# ------------------------------------- 3. compare against the applied allow-list
Head '3. RestrictRun list against the applied Assigned Access allow-list'
$aa = Get-CimInstance -Namespace 'root\cimv2\mdm\dmmap' -ClassName 'MDM_AssignedAccess' -ErrorAction SilentlyContinue
if (-not $aa -or -not $aa.Configuration) {
    Warn 'No Assigned Access configuration applied, so there is nothing to compare.'
} else {
    $cfg = "$($aa.Configuration)" -replace '&lt;', '<' -replace '&gt;', '>' -replace '&quot;', '"' -replace '&amp;', '&'
    $wanted = @()
    foreach ($m in ([regex]::Matches($cfg, 'DesktopAppPath="([^"]+)"'))) {
        $p = "$($m.Groups[1].Value)"
        $leaf = $p -replace '^.*\\', ''
        if ($leaf) { $wanted += $leaf }
    }
    Item 'Executables in AllowedApps' $wanted.Count
    Item 'Names in RestrictRun' $allowedNames.Count

    if ($allowedNames.Count -eq 0) {
        Note 'RestrictRun is not restricting, so no comparison is needed.'
    } else {
        $missing = @()
        foreach ($w in $wanted) {
            $hit = $false
            foreach ($a in $allowedNames) { if ($a -eq $w) { $hit = $true } }
            if (-not $hit) { $missing += $w }
        }
        if ($missing.Count -eq 0) {
            Good 'Every allowed application also appears in RestrictRun.'
        } else {
            Bad "In AllowedApps but NOT in RestrictRun: $($missing -join ', ')"
            Note 'Each of these is permitted by AppLocker and blocked by RestrictRun. That is the fault.'
            $findings += 'allow-lists disagree'
        }
        # the reverse is informational: RestrictRun carrying names the design never allowed
        $extra = @()
        foreach ($a in $allowedNames) {
            $hit = $false
            foreach ($w in $wanted) { if ($a -eq $w) { $hit = $true } }
            if (-not $hit) { $extra += $a }
        }
        if ($extra.Count -gt 0) { Item 'In RestrictRun only (system entries)' ($extra -join ', ') }
    }

    foreach ($n in 'msedge.exe', 'msedge_proxy.exe', 'explorer.exe', 'soffice.bin') {
        $inRR = $false
        foreach ($a in $allowedNames) { if ($a -eq $n) { $inRR = $true } }
        $inAA = $false
        foreach ($w in $wanted) { if ($w -eq $n) { $inAA = $true } }
        Item "  $n" "AllowedApps: $inAA   RestrictRun: $(if ($allowedNames.Count -eq 0) { 'n/a' } else { $inRR })"
        if ($inAA -and $allowedNames.Count -gt 0 -and -not $inRR -and $n -like 'msedge*') {
            $findings += "RestrictRun omits $n"
        }
    }
}

# ------------------------------------------------- 4. Edge registration for the user
Head '4. Edge registration for the kiosk account'
Note 'The desktopAppId MSEdge pin resolves through the per-user class registration. That lives'
Note 'in a SEPARATE hive from NTUSER.DAT: HKCU\Software\Classes maps to UsrClass.dat, mounted as'
Note 'HKU\<SID>_Classes. Reading NTUSER.DAT alone cannot see it, and an earlier build of this'
Note 'script reported the registration absent when it had looked in the wrong file.'
$edgeKey = "$root\Software\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe"
Item 'Per-user App Paths entry' $(if (Test-Path $edgeKey) { 'present' } else { 'absent' })

$classesRoot = $null
$loadedClasses = $false
if (Test-Path "HKU:\${sid}_Classes") {
    $classesRoot = "HKU:\${sid}_Classes"
    Item 'Classes hive' 'live, account is signed in'
} else {
    $ucd = "C:\Users\$AccountName\AppData\Local\Microsoft\Windows\UsrClass.dat"
    if (Test-Path $ucd) {
        $out2 = & reg load "HKU\${hiveTag}_Classes" $ucd 2>&1
        if ($LASTEXITCODE -eq 0) {
            $classesRoot = "HKU:\${hiveTag}_Classes"
            $loadedClasses = $true
            Item 'Classes hive' 'loaded from UsrClass.dat'
        } else {
            Item 'Classes hive' "could not load - $($out2 -join ' ')"
        }
    } else {
        Item 'Classes hive' 'UsrClass.dat not found'
    }
}

if (-not $classesRoot) {
    Warn 'Class registration could not be read, so nothing is concluded about it from this run.'
    Note 'Run again while the kiosk account is signed in.'
} else {
    $found = @()
    foreach ($k in 'MSEdgeHTM', 'MSEdgeMHT', 'MSEdgePDF') {
        if (Test-Path "$classesRoot\$k") { $found += $k }
    }
    Item 'Edge class registrations present' $(if ($found.Count -gt 0) { $found -join ', ' } else { 'NONE' })
    if ($found.Count -eq 0) {
        Bad 'Edge has no class registration for this account, so a desktopAppId MSEdge pin has nothing to resolve through.'
        $findings += 'Edge class registration missing for the kiosk user'
    } else {
        Good 'Edge is registered for this account.'
    }
}

$startCache = "C:\Users\$AccountName\AppData\Local\Packages\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy"
Item 'Start menu state folder' $(if (Test-Path $startCache) { 'present' } else { 'absent, Start has no saved state' })

# --------------------------------------------------- 5. Assigned Access event log
Head '5. Assigned Access events (last 3 days)'
foreach ($log in 'Microsoft-Windows-AssignedAccess/Admin', 'Microsoft-Windows-AssignedAccess/Operational') {
    try {
        $ev = @(Get-WinEvent -FilterHashtable @{ LogName = $log; StartTime = (Get-Date).AddDays(-3) } -MaxEvents 60 -ErrorAction Stop)
        Item $log "$($ev.Count) event(s)"
        $ev | Select-Object -First 8 | ForEach-Object {
            $msg = ("$($_.Message)" -replace '\s+', ' ')
            if ($msg.Length -gt 118) { $msg = $msg.Substring(0, 118) }
            Item "   $($_.TimeCreated.ToString('MM-dd HH:mm'))" "id $($_.Id) $($_.LevelDisplayName): $msg"
        }
        foreach ($e in $ev) { if ($e.LevelDisplayName -eq 'Error') { $findings += 'Assigned Access error logged' } }
    } catch {
        Item $log 'not readable or empty'
    }
}

# ----------------------------------------------------------------- unload, verdict
# No [gc]::Collect() here. It is a static method call on a type Constrained Language Mode
# does not allow, and an earlier build threw on that line. reg unload succeeds without it.
if ($loadedClasses) {
    & reg unload "HKU\${hiveTag}_Classes" 2>&1 | Out-Null
    Note "Unloaded HKU\${hiveTag}_Classes"
}
if ($loadedHive) {
    & reg unload "HKU\$hiveTag" 2>&1 | Out-Null
    Note "Unloaded HKU\$hiveTag"
}

Head '6. Verdict'
if ($findings.Count -eq 0) {
    Good 'No per-user restriction policy is blocking Edge on the evidence here.'
    Note 'RestrictRun is eliminated. The remaining candidates from research-edge-start-pin.md are'
    Note 'the Edge background updater re-registering the package, and the session purge making every'
    Note 'boot a first sign-in. Test the purge one by disabling it for a single boot cycle.'
} else {
    Write-Host ''
    Write-Host "   $($findings.Count) finding(s): $($findings -join '; ')" -ForegroundColor Yellow
    Write-Host ''
    if ($findings -contains 'allow-lists disagree' -or ($findings -join ' ') -match 'RestrictRun omits') {
        Write-Host '   Two allow-lists that do not agree' -ForegroundColor White
        Note 'RestrictRun and the Assigned Access allowed-app list are separate mechanisms, and an'
        Note 'executable has to satisfy both. RestrictRun matches on name only, so it cannot be fixed'
        Note 'with a path. Raise it with Microsoft support with this output: the supported fix is for'
        Note 'Assigned Access to populate RestrictRun from the same list it generates AppLocker rules'
        Note 'from, and it evidently is not doing so for these entries.'
        Note 'Do NOT set RestrictRun to 0 as a workaround on a production kiosk.'
    }
    if ($findings -contains 'Edge class registration missing for the kiosk user') {
        Write-Host '   Edge is not registered for this account' -ForegroundColor White
        Note 'The desktopAppId MSEdge pin resolves through the per-user class registration, so it cannot'
        Note 'appear until that exists. Consistent with the session purge deleting the profile: the'
        Note 'registration has to be rebuilt on every boot and races Start rendering.'
        Note 'Two things to do. Revert the Edge pin to the shortcut form, which does not depend on the'
        Note 'class registration (-EdgePinByShortcut on the test harness). And disable the purge for one'
        Note 'boot cycle: if the pin becomes reliable, the purge is the amplifier.'
    }
    if ($findings -contains 'RestrictRun disabled') {
        Write-Host '   RestrictRun is off' -ForegroundColor White
        Note 'Not the cause of a missing pin, but note it: a public kiosk with RestrictRun at 0 and'
        Note 'AppLocker in AuditOnly has no execution control at all.'
    }
}
Write-Host ''
