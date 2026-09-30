<#
.SYNOPSIS
    Diagnostic: determines why the LibreOffice Start pins launch nothing on a Participant
    Kiosk. Read-only.

.DESCRIPTION
    Written to run under Constrained Language Mode. An unsigned script run ad hoc is put
    into CLM by App Control, and CLM blocks [pscustomobject], New-Object, Add-Type, the
    [xml] cast and static calls such as [Math]::Min. An earlier build of this script used
    [pscustomobject] and died on that line, leaving later sections measuring nothing and
    reporting a clean verdict. Nothing here uses a construct CLM blocks.

    LibreOffice on Windows launches in three hops: swriter.exe (a thin launcher) starts
    soffice.exe, which starts soffice.bin. soffice.bin is the process that draws the window.
    Only the first two are .exe files, and the Assigned Access allowed-app list names only
    .exe files, so the chain has one link that list cannot describe.

    Two engines can kill that third hop:

      AppLocker    Assigned Access generates its allow-list as AppLocker rules. The
                   executable rule collection covers .exe and .com only, so a .bin should
                   be out of scope. Section 3 tests that against the effective policy
                   rather than trusting it, and reports the enforcement mode, because a
                   collection set to AuditOnly is not restricting anything at all.

      App Control  Evaluates every portable executable regardless of extension, so it does
                   see soffice.bin. The kiosk policy trusts The Document Foundation as a
                   publisher, which covers the file only if the file carries that
                   signature. Sections 2 and 4 measure the signature and the block log.

    Sections 6 and 7 cover the causes that are not enforcement: a user profile that cannot
    be created, and an instance already running in another session.

.NOTES
    Run elevated on a device showing the fault. Reads only, apart from the launch test in
    section 8, which closes what it starts.
    Diagnostic tooling. Not an Intune object, not deployed, not assigned.
#>
[CmdletBinding()]
param(
    [string]$KioskUser
)

$ErrorActionPreference = 'Continue'
function Head($t) { Write-Host ''; Write-Host ('== ' + $t) -ForegroundColor Cyan }
function Item($k, $v) { Write-Host ('   {0,-44} {1}' -f $k, $v) }
function Good($t) { Write-Host ('   OK    ' + $t) -ForegroundColor Green }
function Bad($t)  { Write-Host ('   FAIL  ' + $t) -ForegroundColor Red }
function Warn($t) { Write-Host ('   WARN  ' + $t) -ForegroundColor Yellow }
function Note($t) { Write-Host ('         ' + $t) -ForegroundColor DarkGray }

# [Math]::Min is a static call on a type CLM does not allow.
function Trunc($s, $n) {
    if (-not $s) { return '' }
    $t = "$s" -replace '\s+', ' '
    if ($t.Length -le $n) { return $t }
    return $t.Substring(0, $n)
}

$findings = @()
$measured = @()   # sections that actually completed, so the verdict cannot claim OK on nothing

if (-not $KioskUser) {
    $serial = ((Get-CimInstance Win32_BIOS).SerialNumber -replace '[^A-Za-z0-9]', '').ToUpperInvariant()
    if ($serial.Length -gt 14) { $serial = $serial.Substring(0, 14) }
    $KioskUser = "Kiosk-$serial"
}

Write-Host ''
Write-Host 'Participant Kiosk - LibreOffice launch chain' -ForegroundColor White
Item 'Device' $env:COMPUTERNAME
Item 'Run at' (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Item 'Kiosk account' $KioskUser
Item 'Running as' "$env:USERDOMAIN\$env:USERNAME"
Item 'Language mode' $ExecutionContext.SessionState.LanguageMode

# ------------------------------------------------------------- 1. install
Head '1. Installation'
$root = $null
foreach ($r in "${env:ProgramFiles}\LibreOffice", "${env:ProgramFiles(x86)}\LibreOffice") {
    if (-not $root -and (Test-Path $r)) { $root = $r }
}
if (-not $root) {
    Bad 'LibreOffice is not installed in either Program Files tree.'
    $findings += 'not installed'
} else {
    Item 'Install root' $root
    if ($root -like '*(x86)*') {
        Bad 'This is the 32-bit build. The allowed-app list names %ProgramFiles%, which expands to the 64-bit tree, so every launcher path in that list points at a file that does not exist.'
        $findings += 'wrong architecture'
    } else {
        Good 'Matches %ProgramFiles% in the allowed-app list.'
    }
}

# Parallel string arrays, because CLM blocks [pscustomobject].
$chainNames = @()
$chainPaths = @()
if ($root) {
    foreach ($n in 'swriter.exe', 'scalc.exe', 'simpress.exe', 'soffice.exe', 'soffice.bin') {
        $p = Join-Path $root "program\$n"
        if (Test-Path $p) {
            $chainNames += $n
            $chainPaths += $p
            Item $n $p
        } else {
            Item $n 'MISSING'
            $findings += "missing $n"
        }
    }
    $measured += 'install'
    if ($chainNames -notcontains 'soffice.bin') {
        Bad 'soffice.bin is absent. Without it no LibreOffice application can draw a window.'
    }
}

# ------------------------------------------------------------ 2. signatures
Head '2. Signature on each binary in the launch chain'
Note 'App Control trusts The Document Foundation as a publisher. A binary not carrying that'
Note 'signature is not covered by the publisher rule, whatever its extension.'
if ($chainPaths.Count -eq 0) {
    Warn 'No binaries found to check. Section 1 found nothing, so this section measured nothing.'
} else {
    $sigGap = @()
    for ($i = 0; $i -lt $chainPaths.Count; $i++) {
        $subject = ''
        $status = 'unknown'
        try {
            $sig = Get-AuthenticodeSignature -LiteralPath $chainPaths[$i]
            $status = "$($sig.Status)"
            if ($sig.SignerCertificate) { $subject = "$($sig.SignerCertificate.Subject)" }
        } catch {
            $status = "error: $($_.Exception.Message)"
        }
        # Match the WHOLE subject. Taking the first comma-separated field returns whichever
        # relative name the issuer happened to put first, which for these binaries is the
        # email address, not CN. That reported every correctly signed file as a signature gap.
        $display = $subject
        if ($subject -match 'CN=([^,]+)') { $display = $Matches[1] }
        elseif ($subject -match 'O=([^,]+)') { $display = $Matches[1] }
        Item $chainNames[$i] "$status  $display"
        if ($status -ne 'Valid') {
            $sigGap += $chainNames[$i]
        } elseif ($subject -notmatch 'Document ?Foundation|documentfoundation') {
            $sigGap += "$($chainNames[$i]) signed by $display"
        }
    }
    $measured += 'signatures'
    if ($sigGap.Count -gt 0) {
        Bad "Not covered by the Document Foundation publisher rule: $($sigGap -join ', ')"
        Note 'App Control kills an uncovered portable executable at load. No window, no message.'
        $findings += 'signature gap'
    } else {
        Good 'Every binary in the chain carries a valid Document Foundation signature.'
        Note 'So the App Control publisher rule covers the whole chain, and App Control is unlikely to be the blocker.'
    }
}

# ------------------------------------------------------------- 3. AppLocker
Head '3. AppLocker effective policy'
$svc = Get-Service AppIDSvc -ErrorAction SilentlyContinue
Item 'AppIDSvc' $(if ($svc) { $svc.Status } else { 'not present' })
$apXml = $null
try {
    $apXml = Get-AppLockerPolicy -Effective -Xml -ErrorAction Stop
} catch {
    Item 'Effective policy' "could not be read - $($_.Exception.Message)"
}
if ($apXml) {
    # Regex rather than the [xml] cast, which CLM blocks.
    $exeMode = 'no Exe collection'
    if ($apXml -match '<RuleCollection[^>]*Type="Exe"[^>]*EnforcementMode="(\w+)"') { $exeMode = $Matches[1] }
    elseif ($apXml -match 'EnforcementMode="(\w+)"[^>]*Type="Exe"') { $exeMode = $Matches[1] }
    $dllMode = 'no Dll collection'
    if ($apXml -match '<RuleCollection[^>]*Type="Dll"[^>]*EnforcementMode="(\w+)"') { $dllMode = $Matches[1] }
    Item 'Exe collection enforcement' $exeMode
    Item 'Dll collection enforcement' $dllMode
    $ruleCount = ([regex]::Matches($apXml, '<File(Path|Publisher|Hash)Rule ')).Count
    Item 'Total rules in effective policy' $ruleCount
    $loCount = ([regex]::Matches($apXml, 'LibreOffice|soffice|swriter|scalc|simpress')).Count
    Item 'References to LibreOffice' $loCount
    $measured += 'applocker policy'

    if ($exeMode -eq 'AuditOnly') {
        Warn 'The executable collection is AuditOnly, so AppLocker is not blocking anything on this device.'
        Note 'That rules AppLocker out as the cause of the launch failure.'
        Note 'It is also a finding in its own right: the Assigned Access allowed-app list is enforced through'
        Note 'AppLocker, so in AuditOnly the participant is restricted by the Start menu alone, not by execution'
        Note 'control. Confirm whether a corporate AppLocker policy in audit mode is merging over the kiosk rules.'
        $findings += 'applocker auditonly'
    }
    if ($loCount -eq 0) {
        Warn 'No rule in the effective policy names LibreOffice.'
        Note 'Assigned Access implements its allowed-app list as AppLocker rules, so with the restricted session'
        Note 'active there should be rules naming every allowed application. Either the rules are held per user'
        Note 'and are not visible from this account, or the allowed-app list has not been applied.'
        $findings += 'no applocker rules for allowed apps'
    }

    if ($chainPaths.Count -gt 0) {
        Write-Host ''
        Item 'Test-AppLockerPolicy for' $KioskUser
        # -XmlPolicy takes a FILE PATH, not the XML itself. Passing the string made the
        # cmdlet treat the whole policy as a filename and every test returned unresolved.
        $polFile = Join-Path $env:TEMP 'apm-applocker-effective.xml'
        Set-Content -LiteralPath $polFile -Value $apXml -Encoding Unicode -Force
        for ($i = 0; $i -lt $chainPaths.Count; $i++) {
            try {
                $t = Test-AppLockerPolicy -XmlPolicy $polFile -Path $chainPaths[$i] -User $KioskUser -ErrorAction Stop
                Item "   $($chainNames[$i])" "$($t.PolicyDecision)  rule: $($t.MatchingRule)"
                if ("$($t.PolicyDecision)" -eq 'Denied') { $findings += "AppLocker denies $($chainNames[$i])" }
                # DeniedByDefault only matters where the collection is enforced. Recording it as a
                # finding regardless was wrong: under AuditOnly the same result blocks nothing, and
                # treating it as the cause sent a device to be wiped for no reason.
                if ("$($t.PolicyDecision)" -eq 'DeniedByDefault') {
                    if ($exeMode -eq 'Enabled') { $findings += 'denied by default, enforced' }
                    elseif ($findings -notcontains 'denied by default, in audit') { $findings += 'denied by default, in audit' }
                }
            } catch {
                Item "   $($chainNames[$i])" "not evaluated - $(Trunc $_.Exception.Message 70)"
            }
        }
        Remove-Item -LiteralPath $polFile -Force -ErrorAction SilentlyContinue
    }
}

# ------------------------------------------------- 3b. apply order
Head '3b. Was LibreOffice installed before the allowed-app list was applied?'
Note 'Assigned Access generates its allowed-app list as AppLocker path rules at the moment the'
Note 'configuration is applied. An application installed after that moment gets no rule, so the'
Note 'Start pin appears and the launch is denied by default for a standard user.'
if ($root) {
    $instTime = (Get-Item $root).CreationTime
    Item 'LibreOffice installed' $instTime.ToString('yyyy-MM-dd HH:mm')
    $aaTime = $null
    try {
        $aaEv = @(Get-WinEvent -FilterHashtable @{ LogName = 'Microsoft-Windows-AssignedAccess/Operational'; StartTime = (Get-Date).AddDays(-30) } -MaxEvents 200 -ErrorAction Stop)
        if ($aaEv.Count -gt 0) { $aaTime = $aaEv[0].TimeCreated }
    } catch { }
    if (-not $aaTime) {
        $ck = 'HKLM:\SOFTWARE\Microsoft\Windows\AssignedAccessConfiguration'
        if (Test-Path $ck) { Note 'No Assigned Access events. The configuration key exists but carries no timestamp.' }
    }
    if ($aaTime) {
        Item 'Assigned Access last applied' $aaTime.ToString('yyyy-MM-dd HH:mm')
        if ($instTime -gt $aaTime) {
            Bad 'LibreOffice was installed AFTER the allowed-app list was last applied, so no rule exists for it.'
            $findings += 'installed after allow-list applied'
        } else {
            Good 'LibreOffice predates the last apply, so the allowed-app list should name it.'
        }
    } else {
        Warn 'Could not establish when Assigned Access last applied. Compare the install time above by hand.'
    }
    $measured += 'apply order'
}

# ----------------------------------------------------------- 4. App Control
Head '4. App Control for Business'
try {
    $dg = Get-CimInstance -Namespace 'root\Microsoft\Windows\DeviceGuard' -ClassName Win32_DeviceGuard -ErrorAction Stop
    $modes = @{ 0 = 'not configured'; 1 = 'audit'; 2 = 'enforced' }
    Item 'Code integrity policy enforcement' $modes[[int]$dg.CodeIntegrityPolicyEnforcementStatus]
    Item 'Usermode policy enforcement' $modes[[int]$dg.UsermodeCodeIntegrityPolicyEnforcementStatus]
} catch {
    Item 'DeviceGuard WMI' "unavailable - $(Trunc $_.Exception.Message 70)"
}

# Every block in the window, not only ones naming LibreOffice. A WDAC block often names a
# dependent DLL rather than the executable that was launched, and filtering on the
# application name hides exactly that case.
$ci = 'Microsoft-Windows-CodeIntegrity/Operational'
try {
    $all = @(Get-WinEvent -FilterHashtable @{ LogName = $ci; StartTime = (Get-Date).AddDays(-7) } -MaxEvents 600 -ErrorAction Stop)
    $blocks = @($all | Where-Object { $_.Id -eq 3077 })
    $audits = @($all | Where-Object { $_.Id -eq 3076 })
    Item 'Events in log (7 days)' $all.Count
    Item 'Blocks (3077)' $blocks.Count
    Item 'Audit-only (3076)' $audits.Count
    $measured += 'code integrity log'
    if ($blocks.Count -gt 0) {
        Bad 'App Control is blocking executables on this device.'
        $blocks | Select-Object -First 10 | ForEach-Object {
            Item $_.TimeCreated.ToString('MM-dd HH:mm') (Trunc $_.Message 120)
        }
        $loBlocks = @($blocks | Where-Object { $_.Message -match 'soffice|swriter|scalc|simpress|LibreOffice' })
        if ($loBlocks.Count -gt 0) {
            Bad "$($loBlocks.Count) of those name LibreOffice."
            $findings += 'App Control block'
        } else {
            Note 'None name LibreOffice, so these blocks are something else.'
        }
    } else {
        Good 'No App Control blocks at all in the last 7 days.'
        Note 'With the policy enforced and nothing blocked, App Control is not stopping LibreOffice.'
    }
    if ($all.Count -eq 0) {
        Warn 'The log is empty. It may be disabled, in which case its silence proves nothing.'
        $findings += 'code integrity log empty'
    }
} catch {
    Item $ci "could not be read - $(Trunc $_.Exception.Message 70)"
    Warn 'The log could not be read, so App Control cannot be ruled out from this run.'
}

# ------------------------------------------------------ 5. AppLocker blocks
Head '5. AppLocker events (last 7 days)'
foreach ($log in 'Microsoft-Windows-AppLocker/EXE and DLL', 'Microsoft-Windows-AppLocker/MSI and Script') {
    try {
        # Filter by ID in the query. Taking the most recent N and filtering afterwards lets
        # audit noise crowd blocks out of the window: the DLL collection in AuditOnly emits
        # an 8003 for every library LibreOffice loads, hundreds per launch.
        $ev = @(Get-WinEvent -FilterHashtable @{ LogName = $log; StartTime = (Get-Date).AddDays(-7) } -MaxEvents 400 -ErrorAction Stop)
        $blocked = @(Get-WinEvent -FilterHashtable @{ LogName = $log; Id = 8004, 8007; StartTime = (Get-Date).AddDays(-7) } -MaxEvents 200 -ErrorAction SilentlyContinue)
        Item $log "$($ev.Count) recent event(s), $($blocked.Count) block(s) in 7 days"
        if ($blocked.Count -gt 0) {
            $blocked | Select-Object -First 8 | ForEach-Object {
                Item "   $($_.TimeCreated.ToString('MM-dd HH:mm'))" "id $($_.Id): $(Trunc $_.Message 110)"
            }
            $findings += 'AppLocker block'
        }
        $lo = @($ev | Where-Object { $_.Message -match 'soffice|swriter|scalc|simpress|LibreOffice' })
        if ($lo.Count -gt 0) {
            $lo | Select-Object -First 4 | ForEach-Object {
                Item "   $($_.TimeCreated.ToString('MM-dd HH:mm'))" "id $($_.Id): $(Trunc $_.Message 110)"
            }
            $audit = @($lo | Where-Object { $_.Id -eq 8003 })
            if ($audit.Count -gt 0) {
                Warn "$($audit.Count) LibreOffice component(s) would be blocked if the DLL collection were enforced."
                Note 'Not the current fault, since the collection is in audit. It becomes the fault the day'
                Note 'anyone enforces it, so the App Control and AppLocker posture needs to account for these.'
                $findings += 'dll audit hits'
            }
        }
        if ($measured -notcontains 'applocker log') { $measured += 'applocker log' }
    } catch {
        Item $log "not readable - $(Trunc $_.Exception.Message 60)"
    }
}

# --------------------------------------------------- 6. LibreOffice profile
Head '6. LibreOffice user profile'
Note 'LibreOffice creates a per-user profile on first run. If it cannot, the process starts'
Note 'and exits with no window and no error, which looks identical to a policy block.'
$kioskRoaming = "C:\Users\$KioskUser\AppData\Roaming"
$kioskProfile = "$kioskRoaming\LibreOffice"
Item 'Kiosk profile path' $kioskProfile
if (Test-Path $kioskProfile) {
    Good 'Exists, so first run has completed at least once.'
    $lock = @(Get-ChildItem $kioskProfile -Recurse -Filter '.lock' -Force -ErrorAction SilentlyContinue)
    if ($lock.Count -gt 0) {
        Bad "Lock file present: $($lock[0].FullName)"
        Note 'A lock left by a crashed or purged session stops the next launch.'
        $findings += 'profile lock'
    } else {
        Good 'No lock file.'
    }
} elseif (Test-Path $kioskRoaming) {
    Warn 'The account profile exists but LibreOffice has never completed a first run in it.'
    $findings += 'no libreoffice profile'
} else {
    Warn "No Windows profile at $kioskRoaming, so the kiosk account has never signed in on this device."
    Note 'Nothing here can be concluded about the participant experience until it has.'
    $findings += 'kiosk account never signed in'
}
$measured += 'profile'

$admx = 'HKLM:\SOFTWARE\Policies\LibreOffice'
if (Test-Path $admx) {
    Item 'LibreOffice ADMX policy' 'present'
    $props = @(Get-Item $admx | Select-Object -ExpandProperty Property -ErrorAction SilentlyContinue)
    foreach ($p in $props) { Note "  $p" }
    Note 'A locked configuration naming a path that does not exist stops startup. Object 16 in the register.'
} else {
    Item 'LibreOffice ADMX policy' 'none'
}

# --------------------------------------- 6b. access, and crash records
Head '6b. Standard-user access to the installation'
Note 'A launch that works as SYSTEM and fails for the participant is most often permissions.'
Note 'The kiosk account is a standard user; SYSTEM is not, so a directory that denies Users'
Note 'runs perfectly in every test run from an elevated session.'
if ($root) {
    # icacls rather than Get-Acl, because reading an ACE through the object model needs
    # method calls CLM blocks.
    $prog = Join-Path $root 'program'
    $ic = & icacls $prog 2>&1
    $icText = $ic -join "`n"
    $hasUsers = ($icText -match 'BUILTIN\\Users|\\Users:') 
    $hasKiosk = ($icText -match [regex]::Escape($KioskUser))
    Item 'Path' $prog
    Item 'Grants BUILTIN\Users' $(if ($hasUsers) { 'yes' } else { 'NO' })
    Item 'Names the kiosk account' $(if ($hasKiosk) { 'yes' } else { 'no (expected, Users covers it)' })
    foreach ($line in $ic) { if ("$line" -match 'Users|Everyone|Authenticated') { Note (Trunc $line 110) } }
    if (-not $hasUsers) {
        Bad 'The program directory does not grant BUILTIN\Users. A standard user cannot execute from it.'
        $findings += 'no standard-user access'
    } else {
        Good 'Standard users are granted access to the program directory.'
    }
    $measured += 'acl'
}

Head '6c. Application error records (last 7 days)'
try {
    $app = @(Get-WinEvent -FilterHashtable @{ LogName = 'Application'; StartTime = (Get-Date).AddDays(-7) } -MaxEvents 800 -ErrorAction Stop |
             Where-Object { $_.Message -match 'soffice|LibreOffice' })
    Item 'Records naming LibreOffice' $app.Count
    if ($app.Count -gt 0) {
        $app | Select-Object -First 8 | ForEach-Object {
            Item $_.TimeCreated.ToString('MM-dd HH:mm') "id $($_.Id) $($_.LevelDisplayName): $(Trunc $_.Message 110)"
        }
        if ($app | Where-Object { $_.Id -eq 1000 -or $_.Id -eq 1026 }) {
            Bad 'An application crash is recorded. LibreOffice is starting and dying, not being blocked.'
            $findings += 'application crash'
        }
    } else {
        Note 'None. If the participant has clicked a pin since the last restart, a crash would appear here.'
    }
    $measured += 'application log'
} catch {
    Item 'Application log' "could not be read - $(Trunc $_.Exception.Message 60)"
}

# ---------------------------------------------------- 7. running instances
Head '7. Running instances'
$procs = @(Get-Process -Name 'soffice*' -ErrorAction SilentlyContinue)
if ($procs.Count -gt 0) {
    Warn "$($procs.Count) soffice process(es) already running."
    try {
        Get-Process -Name 'soffice*' -IncludeUserName -ErrorAction Stop | ForEach-Object {
            Item "   pid $($_.Id) $($_.ProcessName)" $_.UserName
        }
    } catch {
        foreach ($p in $procs) { Item "   pid $($p.Id)" $p.ProcessName }
    }
    Note 'A launcher started while an instance is already running signals that instance and exits.'
    $findings += 'instance already running'
} else {
    Good 'No soffice process running.'
}
$measured += 'processes'

# --------------------------------------------------------- 8. launch test
Head '8. Launch test'
Item 'Testing as' "$env:USERDOMAIN\$env:USERNAME"
if ("$env:USERNAME" -like '*$') {
    Warn 'Running as the machine account. A launch from session 0 has no desktop, so a window cannot appear'
    Note 'and this test cannot distinguish a block from a missing desktop. Run this section from an'
    Note 'interactive administrator session, or read the Test-AppLockerPolicy results in section 3 instead.'
}
$w = $null
for ($i = 0; $i -lt $chainNames.Count; $i++) { if ($chainNames[$i] -eq 'swriter.exe') { $w = $chainPaths[$i] } }
if (-not $w) {
    Warn 'swriter.exe was not found in section 1, so there is nothing to launch.'
} else {
    $before = @(Get-Process -Name 'soffice*' -ErrorAction SilentlyContinue).Count
    try {
        Start-Process -FilePath $w -ErrorAction Stop
        Start-Sleep -Seconds 8
        $after = @(Get-Process -Name 'soffice*' -ErrorAction SilentlyContinue)
        Item 'soffice processes before / after' "$before / $($after.Count)"
        if ($after.Count -gt $before) {
            $names = ($after | Select-Object -ExpandProperty ProcessName) -join ', '
            Good "Launched: $names"
            foreach ($p in $after) { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue }
            Note 'Test instances closed.'
        } else {
            Bad 'The launcher exited leaving no process running.'
            $findings += 'launch produced no process'
        }
        $measured += 'launch'
    } catch {
        Bad "Start-Process failed: $(Trunc $_.Exception.Message 90)"
        $findings += 'launcher blocked for this account'
        $measured += 'launch'
    }
}

# --------------------------------------------------------- 8b. process trace
Head '8b. Process trace'
Note 'Polls the process table every 250ms for 20 seconds after a launch, so every process that'
Note 'appears is recorded with its parent and command line, and every process that vanishes is'
Note 'recorded with how long it lived. A process that appears and disappears within a second or'
Note 'two is the whole fault, and nothing else in this script can see it.'
if (-not $w) {
    Warn 'No launcher available to trace.'
} else {
    # Baseline: everything already running is ignored, so only new processes are reported.
    $known = @{}
    foreach ($p in @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)) { $known["$($p.ProcessId)"] = $true }

    $launcher = $null
    try { $launcher = Start-Process -FilePath $w -PassThru -ErrorAction Stop } catch {
        Bad "Launch failed: $(Trunc $_.Exception.Message 90)"
    }

    $order = @()
    $pName = @{}
    $pParent = @{}
    $pCmd = @{}
    $firstTick = @{}
    $lastTick = @{}
    # 80 iterations at 250ms is 20 seconds. A loop counter rather than DateTime arithmetic,
    # because operator overloads on DateTime are not dependable under CLM.
    for ($tick = 0; $tick -lt 80; $tick++) {
        foreach ($p in @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)) {
            $id = "$($p.ProcessId)"
            if ($known.ContainsKey($id)) { continue }
            if (-not $pName.ContainsKey($id)) {
                $order += $id
                $pName[$id] = "$($p.Name)"
                $pParent[$id] = "$($p.ParentProcessId)"
                $pCmd[$id] = "$($p.CommandLine)"
                $firstTick[$id] = $tick
            }
            $lastTick[$id] = $tick
        }
        Start-Sleep -Milliseconds 250
    }

    Item 'New processes observed' $order.Count
    if ($order.Count -eq 0) {
        Bad 'Nothing started at all. The launcher itself never ran.'
        $findings += 'no process created'
    }

    $vanished = @()
    $survived = @()
    foreach ($id in $order) {
        $still = @(Get-CimInstance Win32_Process -Filter "ProcessId = $id" -ErrorAction SilentlyContinue)
        $lifeTicks = ($lastTick[$id] - $firstTick[$id]) + 1
        $lifeMs = $lifeTicks * 250
        if ($still.Count -gt 0) {
            $survived += $id
            Item "  pid $id $($pName[$id])" "alive, parent $($pParent[$id])"
        } else {
            $vanished += $id
            Item "  pid $id $($pName[$id])" "exited after about $lifeMs ms, parent $($pParent[$id])"
        }
        if ($pCmd[$id]) { Note "      $(Trunc $pCmd[$id] 104)" }
    }

    Write-Host ''
    Item 'Survived' $survived.Count
    Item 'Exited during the trace' $vanished.Count

    # WerFault means Windows Error Reporting caught a crash. That is the single clearest
    # distinction between a crash and a policy block, and it needs no log reading.
    $wer = @()
    foreach ($id in $order) { if ($pName[$id] -match 'WerFault|WerMgr') { $wer += "$($pName[$id]) (pid $id)" } }
    if ($wer.Count -gt 0) {
        Bad "Windows Error Reporting started: $($wer -join ', '). LibreOffice crashed, it was not blocked."
        $findings += 'crash observed'
    }

    $sofficeSeen = @()
    foreach ($id in $order) { if ($pName[$id] -match 'soffice') { $sofficeSeen += $pName[$id] } }
    if ($sofficeSeen.Count -eq 0 -and $order.Count -gt 0) {
        Bad 'The launcher started but no soffice process ever appeared. The launcher is being stopped before it can spawn the application.'
        $findings += 'soffice never spawned'
    } elseif ($survived.Count -eq 0 -and $order.Count -gt 0) {
        Bad 'Every process started and then exited. LibreOffice is dying rather than being prevented from starting.'
        $findings += 'all processes exited'
    }

    if ($launcher) {
        try {
            $lp = @(Get-Process -Id $launcher.Id -ErrorAction SilentlyContinue)
            if ($lp.Count -eq 0) { Item 'Launcher exit code' "$($launcher.ExitCode)" }
            else { Item 'Launcher' 'still running' }
        } catch { }
    }

    foreach ($id in $survived) { Stop-Process -Id $id -Force -ErrorAction SilentlyContinue }
    if ($survived.Count -gt 0) { Note 'Surviving test processes closed.' }
    $measured += 'process trace'
}

Head '8c. Windows Error Reporting records'
$werHit = @()
foreach ($wp in "$env:ProgramData\Microsoft\Windows\WER\ReportQueue", "$env:ProgramData\Microsoft\Windows\WER\ReportArchive", "$env:LOCALAPPDATA\Microsoft\Windows\WER\ReportQueue") {
    if (-not (Test-Path $wp)) { continue }
    $hits = @(Get-ChildItem $wp -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'soffice|swriter|scalc|simpress' })
    foreach ($h in $hits) { $werHit += "$($h.Name)  $($h.LastWriteTime.ToString('MM-dd HH:mm'))" }
}
Item 'WER reports naming LibreOffice' $werHit.Count
foreach ($h in $werHit) { Note "  $h" }
if ($werHit.Count -gt 0) {
    Bad 'A Windows Error Reporting record exists. LibreOffice is crashing.'
    Note 'Open the Report.wer inside the folder above: it names the faulting module, which is the answer.'
    $findings += 'crash observed'
}
$measured += 'wer'

# ------------------------------------------------------------- 9. verdict
Head '9. Verdict'
Item 'Sections that completed' ($measured -join ', ')
$exempt = 'unknown'
if ("$env:USERNAME" -like '*$') {
    $exempt = 'yes, machine account'
} else {
    try {
        $grp = & whoami /groups 2>&1
        if (("$grp") -match 'S-1-5-32-544') { $exempt = 'yes, member of Administrators' } else { $exempt = 'no, standard user' }
    } catch { }
}
Item 'Account exempt from AppLocker' $exempt
if ($exempt -like 'yes*') {
    Warn 'AppLocker does not apply to the account this ran as, so no application-control result here'
    Note 'describes what the participant experiences. Sections 1, 2, 6b and 6c are still valid.'
}
if ($measured.Count -lt 5) {
    Warn 'Too few sections completed for a verdict. Fix the errors above and run again.'
} elseif ($findings.Count -eq 0) {
    Good 'No blocker found for the account tested.'
    Note 'If the participant still sees nothing, run this inside the kiosk session.'
} else {
    Write-Host ''
    Write-Host "   $($findings.Count) finding(s): $($findings -join '; ')" -ForegroundColor Yellow
    Write-Host ''
    if ($findings -contains 'signature gap' -or $findings -contains 'App Control block' -or $findings -contains 'soffice.bin does not start') {
        Write-Host '   App Control' -ForegroundColor White
        Note 'Adding soffice.bin to the Assigned Access allowed-app list does NOT fix this. That list'
        Note 'generates AppLocker rules and AppLocker does not evaluate a .bin. The fix belongs in'
        Note 'CDG-W11-PK-1.0: confirm the Document Foundation publisher rule covers soffice.bin, and if'
        Note 'the file is unsigned add a file hash rule, then re-sign and redeploy the policy.'
    }
    if ($findings -contains 'AppLocker block') {
        Write-Host '   AppLocker' -ForegroundColor White
        Note 'Event 8004 names the file. Add that exact path to AllowedApps in both the canonical XML and'
        Note 'the remediation here-string, then run check-assigned-access.js.'
    }
    if ($findings -contains 'applocker auditonly' -or $findings -contains 'no applocker rules for allowed apps') {
        Write-Host '   Assigned Access allow-list may not be enforced' -ForegroundColor White
        Note 'This does not block LibreOffice, it permits too much. The restricted session is being held by'
        Note 'the Start menu alone. Establish whether a corporate AppLocker policy in AuditOnly is merging'
        Note 'over the rules Assigned Access generates, and raise it against the design if so.'
    }
    if ($findings -contains 'denied by default, enforced' -or $findings -contains 'installed after allow-list applied') {
        Write-Host '   No allow rule for LibreOffice, and the collection is enforced' -ForegroundColor White
        Note 'The launch is blocked for the kiosk account. SYSTEM and members of Administrators are exempt'
        Note 'from AppLocker, which is why it works for them and not for the participant.'
        Note 'Assigned Access writes its rules when the configuration is applied, so an application'
        Note 'installed afterwards never gets one. Re-run CDG-W11-REM-Kiosk Session Account-P-1.0, then'
        Note 'test as the kiosk account. Build object 6, the Enrolment Status Page, to stop it recurring.'
    }
    if ($findings -contains 'denied by default, in audit') {
        Write-Host '   No allow rule, but this policy is in audit, so this policy is not the cause' -ForegroundColor White
        Note 'No rule permits these files, yet the collection is AuditOnly, so nothing here blocks anything.'
        Note 'The machine-merged policy read from an administrator is not the policy the kiosk session runs'
        Note 'under: Assigned Access applies its own per-user policy at logon, and that one is enforced.'
        Note 'Nothing measured from an exempt account can settle this.'
        Note ''
        Note 'Two experiments, in this order:'
        Note '  1. Create a throwaway LOCAL STANDARD user, sign in, launch LibreOffice. No scripting, and'
        Note '     it separates "standard user" from "Assigned Access". If it fails there too, Assigned'
        Note '     Access is not involved and the cause is the machine policy or the application itself.'
        Note '  2. Run this script inside the kiosk session, so section 3 reads the enforced policy. Add'
        Note '     powershell.exe to AllowedApps on the test device, apply, then remove it afterwards.'
    }
    if ($findings -contains 'crash observed' -or $findings -contains 'all processes exited' -or $findings -contains 'application crash') {
        Write-Host '   Crash, not a block' -ForegroundColor White
        Note 'The processes start and then die. No enforcement engine produces that pattern: a block stops'
        Note 'the process at load, so it never appears in the trace at all. Read the faulting module in the'
        Note 'WER Report.wer named in 8c, or the Application log record in 6c.'
        Note 'A first-run crash with no user profile written usually means LibreOffice could not create its'
        Note 'profile under the account AppData path.'
    }
    if ($findings -contains 'soffice never spawned') {
        Write-Host '   The launcher is stopped before it spawns' -ForegroundColor White
        Note 'swriter.exe ran and no soffice process followed. Check 8b for what exited and its exit code.'
    }
    if ($findings -contains 'dll audit hits') {
        Write-Host '   Latent: LibreOffice components fail the DLL rules' -ForegroundColor White
        Note 'The DLL collection is in audit, so these are warnings today. Enforcing it without adding'
        Note 'rules for the LibreOffice program directory would break the application outright.'
    }
    if ($findings -contains 'no standard-user access') {
        Write-Host '   Permissions' -ForegroundColor White
        Note 'The program directory denies BUILTIN\Users, so the participant cannot execute LibreOffice'
        Note 'even though SYSTEM can. Correct the ACL in the packaging, not on the device.'
    }
    if ($findings -contains 'application crash') {
        Write-Host '   Crash, not a block' -ForegroundColor White
        Note 'The Application log holds a crash record. Read the faulting module named in it. A first-run'
        Note 'crash with no user profile written usually means LibreOffice could not create its profile.'
    }
    if ($findings -contains 'kiosk account never signed in' -or $findings -contains 'no libreoffice profile') {
        Write-Host '   Not yet reproducible from this account' -ForegroundColor White
        Note 'The measurements above describe the account this script ran as. Sign in as the kiosk account,'
        Note 'reproduce the fault, then run this again so sections 4 and 5 have events to read.'
    }
    if ($findings -contains 'profile lock' -or $findings -contains 'instance already running') {
        Write-Host '   Not enforcement' -ForegroundColor White
        Note 'A stale lock file or a live instance in another session. The session purge must remove the'
        Note 'LibreOffice profile directory, not only the browser data.'
    }
    if ($findings -contains 'wrong architecture') {
        Write-Host '   Wrong build installed' -ForegroundColor White
        Note 'Deploy the 64-bit MSI, or change every %ProgramFiles% LibreOffice path in the allowed-app'
        Note 'list to %ProgramFiles(x86)%. Deploying 64-bit is the smaller change.'
    }
}
Write-Host ''
