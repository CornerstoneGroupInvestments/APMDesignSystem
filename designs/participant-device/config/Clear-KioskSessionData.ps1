<#
.SYNOPSIS
    Clears every location a participant can reach that may hold personal information. Runs at
    logon and at logoff.

.DESCRIPTION
    Written to run under Constrained Language Mode, so it can be tested unsigned before it is
    signed for deployment.

    WHAT A PARTICIPANT CAN LEAVE BEHIND, and why each entry is here:

      Downloads                    the only File Explorer namespace granted. Where a CV lands.
      Desktop, Documents,          not reachable through File Explorer, but every application
      Pictures, Videos, Music      save dialog can reach them, and LibreOffice defaults to
                                   Documents.
      LibreOffice user profile     %APPDATA%\LibreOffice holds the recent-documents list in
                                   registrymodifications.xcu AND real document copies under
                                   \backup from autorecovery. The whole tree goes: LibreOffice
                                   rebuilds it on next launch, and every setting this design
                                   cares about is delivered by policy, not by the profile.
      Edge user data               history, cookies, cache, autofill, form data, saved
                                   passwords and the download list. The whole tree goes; Edge
                                   rebuilds it.
      Recent items and jump lists  %APPDATA%\Microsoft\Windows\Recent, including
                                   AutomaticDestinations and CustomDestinations. These hold
                                   full paths and file names, which routinely contain a
                                   participant's name.
      Thumbnail cache              thumbcache_*.db holds rendered previews of documents.
      Temp                         LibreOffice and Edge both write working copies of open
                                   documents here.
      Clipboard and notifications  clipboard history and wpndatabase.db can hold typed text.
      Registry MRU keys            RecentDocs, TypedPaths, RunMRU and the two ComDlg32 MRU
                                   lists record file names and paths opened or saved.
      Print spool                  PRINTERS holds spool files containing the full content of
                                   anything printed. A participant printing a CV leaves it
                                   here. Machine-wide, so SYSTEM is required.
      Recycle Bin                  a deleted file is still a file.
      Public Downloads             writable by any account and outside the kiosk profile.

    WHAT IT DELIBERATELY DOES NOT TOUCH:

      Removable drives             the participant's own USB stick is their property.
      The kiosk profile itself     this clears content and leaves the profile intact. Deleting
                                   the profile also destroys Edge's per-user registration and
                                   the Start layout cache, which is a known cause of the Start
                                   pins failing to appear. See research-edge-start-pin.md.
      Windows Search index         filenames indexed from Documents and Downloads persist in
                                   the index. Out of scope here; needs a decision, recorded as
                                   an open item in the design.

    LOGGING IS DELIBERATELY BLIND TO FILE NAMES. A log that lists what it deleted from a
    participant's Downloads folder is itself a personal-information disclosure, and it would
    sit on disk long after the file it names was removed. This script logs directory paths,
    counts and outcomes only. Never add a file name to the log.

    DELETION IS NOT SANITISATION. On a BitLocker-encrypted volume with TRIM active, an
    overwrite pass cannot be guaranteed to reach the original blocks and is not attempted.
    At-rest protection comes from full-volume encryption; this script removes the data from the
    live file system so the next participant cannot reach it.

.PARAMETER Phase
    Logon, Logoff or Startup.

    Logon is the authoritative pass. The profile is loaded, the participant has done nothing,
    and nothing they own is locked, so everything in the list can actually be removed.

    Startup runs from the same task's boot trigger. It catches anything the logoff pass could
    not take because an application still held it, and it reasserts autologon before the first
    logon attempt of the boot, which is the only point at which that reassertion is any use.

    Logoff is best effort. Files a closing application still holds open cannot be deleted, and
    the script reports how many it could not take rather than failing. Its value is closing the
    window between one participant leaving and the next one arriving, not completeness.

.PARAMETER DryRun
    Reports what would be removed and removes nothing.

    A plain switch rather than the SupportsShouldProcess -WhatIf machinery, because
    $PSCmdlet.ShouldProcess() is a method call on an engine type and whether Constrained
    Language Mode permits it is not worth finding out on a device in the field. A switch cannot
    fail that way.

.NOTES
    Runs as SYSTEM. Required for the print spool, the Recycle Bin of another account, and for
    reaching another user's profile at all.

    Sign with the APM code-signing certificate before deployment (SOE-02).
    Deployed by Install-KioskSessionCleanup.ps1 as two scheduled tasks.

    OVERLAP WITH Invoke-KioskSessionPurge.ps1: RESOLVED. This script supersedes it. The purge's
    steps 2 to 4 (Public Downloads, Windows Temp, print spool) are all covered here and more
    thoroughly, and its step 5 (autologon reassertion) is carried over below. Its step 1, the
    profile delete, is deliberately NOT carried over: deleting the profile destroys Edge's
    per-user registration and the Start layout cache on every restart, which is a known cause
    of the Start pins failing to appear, and it is not needed to remove participant data.
    CDG-W11-REM-Profile Purge-P-1.0 is retired.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('Logon', 'Logoff', 'Startup')]
    [string]$Phase,
    [switch]$DryRun,
    [string]$AccountName,
    [string]$LogDirectory = 'C:\APM\PK\logs'
)

$ErrorActionPreference = 'Continue'

# ---- logging: paths, counts and outcomes only. Never a file name. ------------
$script:LogPath = $null
function Write-Log($msg) {
    $line = '{0}  {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $msg
    Write-Output $line
    if ($script:LogPath) { Add-Content -LiteralPath $script:LogPath -Value $line -ErrorAction SilentlyContinue }
}

if (-not (Test-Path $LogDirectory)) {
    New-Item -ItemType Directory -Path $LogDirectory -Force -ErrorAction SilentlyContinue | Out-Null
}
if (Test-Path $LogDirectory) {
    $script:LogPath = Join-Path $LogDirectory ('session-clean-{0}.log' -f (Get-Date -Format 'yyyyMMdd'))
}

Write-Log "=== $Phase pass starting on $env:COMPUTERNAME ==="
Write-Log "Language mode: $($ExecutionContext.SessionState.LanguageMode)"

$who = (& whoami) -join ''
if ($who -notmatch 'nt authority\\system') {
    Write-Log "WARNING: running as $who, not SYSTEM. The print spool, the Recycle Bin and another account's profile will not be reachable."
}

# ---- resolve the kiosk account ----------------------------------------------
# Same derivation rule as the remediation, detection and purge scripts. If these ever disagree
# the wrong profile is cleaned, which on this device means cleaning nothing.
if (-not $AccountName) {
    $serial = ((Get-CimInstance Win32_BIOS -ErrorAction SilentlyContinue).SerialNumber -replace '[^A-Za-z0-9]', '').ToUpperInvariant()
    if (-not $serial) { Write-Log 'FAIL: no BIOS serial number available.'; exit 1 }
    if ($serial.Length -gt 14) { $serial = $serial.Substring(0, 14) }
    $AccountName = "Kiosk-$serial"
}
$acct = Get-LocalUser -Name $AccountName -ErrorAction SilentlyContinue
if (-not $acct) { Write-Log "FAIL: local account $AccountName does not exist."; exit 1 }
$sid = "$($acct.SID)"
$profileDir = "C:\Users\$AccountName"
if (-not (Test-Path $profileDir)) {
    Write-Log "Profile $profileDir does not exist. Nothing to clear for this account."
    $profileDir = $null
}
Write-Log "Account $AccountName, SID $sid"

$cleared = 0
$skipped = 0
$locked = 0

# ---- clear the CONTENTS of a directory, keeping the directory ----------------
# Keeping the folder matters: Downloads, Desktop and Documents are Known Folders, and deleting
# one leaves the shell without a target and the participant with a broken save dialog.
function Clear-Contents($path, $label) {
    if (-not $path) { return }
    if (-not (Test-Path -LiteralPath $path)) { $script:skipped++; return }
    $items = @(Get-ChildItem -LiteralPath $path -Force -ErrorAction SilentlyContinue)
    if ($items.Count -eq 0) { Write-Log "empty      $label"; return }
    if (-not $DryRun) {
        $fail = 0
        foreach ($i in $items) {
            Remove-Item -LiteralPath $i.FullName -Recurse -Force -ErrorAction SilentlyContinue
            if (Test-Path -LiteralPath $i.FullName) { $fail++ }
        }
        if ($fail -gt 0) {
            $script:locked += $fail
            Write-Log "PARTIAL    $label - $($items.Count) item(s), $fail could not be removed (in use)"
        } else {
            $script:cleared++
            Write-Log "cleared    $label ($($items.Count) item(s))"
        }
    } else {
        Write-Log "DRYRUN     $label ($($items.Count) item(s))"
    }
}

# ---- remove a whole tree, letting the application rebuild it ----------------
function Remove-Tree($path, $label) {
    if (-not $path) { return }
    if (-not (Test-Path -LiteralPath $path)) { $script:skipped++; return }
    if ($DryRun) { Write-Log "DRYRUN     $label"; return }
    Remove-Item -LiteralPath $path -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path -LiteralPath $path) {
        $script:locked++
        Write-Log "PARTIAL    $label - still present (in use)"
    } else {
        $script:cleared++
        Write-Log "removed    $label"
    }
}

function Remove-Matching($dir, $pattern, $label) {
    if (-not $dir) { return }
    if (-not (Test-Path -LiteralPath $dir)) { $script:skipped++; return }
    $hits = @(Get-ChildItem -LiteralPath $dir -Filter $pattern -Force -ErrorAction SilentlyContinue)
    if ($hits.Count -eq 0) { Write-Log "none       $label"; return }
    if ($DryRun) { Write-Log "DRYRUN     $label ($($hits.Count))"; return }
    $fail = 0
    foreach ($h in $hits) {
        Remove-Item -LiteralPath $h.FullName -Force -ErrorAction SilentlyContinue
        if (Test-Path -LiteralPath $h.FullName) { $fail++ }
    }
    if ($fail -gt 0) { $script:locked += $fail; Write-Log "PARTIAL    $label - $fail of $($hits.Count) in use" }
    else { $script:cleared++; Write-Log "cleared    $label ($($hits.Count) file(s))" }
}

# ---- 1. participant-facing folders ------------------------------------------
Write-Log '--- participant folders'
if ($profileDir) {
    foreach ($f in 'Downloads', 'Desktop', 'Documents', 'Pictures', 'Videos', 'Music') {
        Clear-Contents "$profileDir\$f" "profile\$f"
    }
    # OneDrive is not configured for this account, but a stray folder would still hold files.
    Clear-Contents "$profileDir\OneDrive" 'profile\OneDrive'
}
Clear-Contents 'C:\Users\Public\Downloads' 'Public\Downloads'
Clear-Contents 'C:\Users\Public\Documents' 'Public\Documents'
Clear-Contents 'C:\Users\Public\Desktop' 'Public\Desktop'

# ---- 2. application state that holds document content or names --------------
Write-Log '--- application state'
if ($profileDir) {
    # LibreOffice: \backup holds real document copies from autorecovery, and
    # registrymodifications.xcu holds the recent-documents list. The tree is rebuilt on next
    # launch and all managed settings come from policy, so removing it costs nothing.
    Remove-Tree "$profileDir\AppData\Roaming\LibreOffice" 'LibreOffice user profile'

    # Edge: history, cookies, cache, autofill, form data, saved passwords, download list.
    Remove-Tree "$profileDir\AppData\Local\Microsoft\Edge\User Data" 'Edge user data'

    # Recent items and jump lists. Jump lists are the ones people forget: they persist full
    # paths and file names independently of the Recent folder.
    Clear-Contents "$profileDir\AppData\Roaming\Microsoft\Windows\Recent" 'Recent items'
    Clear-Contents "$profileDir\AppData\Roaming\Microsoft\Windows\Recent\AutomaticDestinations" 'Jump lists (automatic)'
    Clear-Contents "$profileDir\AppData\Roaming\Microsoft\Windows\Recent\CustomDestinations" 'Jump lists (custom)'

    # Rendered previews of documents.
    Remove-Matching "$profileDir\AppData\Local\Microsoft\Windows\Explorer" 'thumbcache_*.db' 'Thumbnail cache'
    Remove-Matching "$profileDir\AppData\Local\Microsoft\Windows\Explorer" 'iconcache_*.db' 'Icon cache'

    # Working copies of open documents.
    Clear-Contents "$profileDir\AppData\Local\Temp" 'profile Temp'
    Clear-Contents "$profileDir\AppData\Local\Microsoft\Windows\INetCache" 'INetCache'

    # Typed text can reach both of these.
    Remove-Tree "$profileDir\AppData\Local\Microsoft\Windows\Clipboard" 'Clipboard history'
    Remove-Matching "$profileDir\AppData\Local\Microsoft\Windows\Notifications" 'wpndatabase.db*' 'Notification database'
}

# ---- 3. per-user registry MRU lists ----------------------------------------
# These record file names and paths, which on this device means participant names. The hive is
# live under HKU at logon; at logoff it may already be unloading, in which case this is skipped
# and the logon pass takes it.
Write-Log '--- registry MRU lists'
if (-not (Test-Path 'HKU:')) {
    New-PSDrive -Name HKU -PSProvider Registry -Root HKEY_USERS -Scope Script -ErrorAction SilentlyContinue | Out-Null
}
$hive = "HKU:\$sid"
if (-not (Test-Path $hive)) {
    Write-Log "hive not loaded, registry pass skipped (expected at $Phase if the profile has unloaded)"
    $skipped++
} else {
    $explorerKey = "$hive\Software\Microsoft\Windows\CurrentVersion\Explorer"
    foreach ($k in 'RecentDocs', 'TypedPaths', 'RunMRU', 'ComDlg32\OpenSavePidlMRU', 'ComDlg32\LastVisitedPidlMRU', 'ComDlg32\CIDSizeMRU', 'FileExts') {
        $full = "$explorerKey\$k"
        if (-not (Test-Path $full)) { $skipped++; continue }
        if (-not $DryRun) {
            Remove-Item -LiteralPath $full -Recurse -Force -ErrorAction SilentlyContinue
            if (Test-Path $full) { Write-Log "PARTIAL    registry $k" } else { $cleared++; Write-Log "removed    registry $k" }
        } else {
            Write-Log "DRYRUN     registry $k"
        }
    }
    # Edge keeps no document names here, but the shell's search history does.
    $searchKey = "$explorerKey\WordWheelQuery"
    if (Test-Path $searchKey) {
        if (-not $DryRun) {
            Remove-Item -LiteralPath $searchKey -Recurse -Force -ErrorAction SilentlyContinue
            $cleared++; Write-Log 'removed    registry WordWheelQuery (Explorer search history)'
        } else {
            Write-Log 'DRYRUN     registry WordWheelQuery'
        }
    }
}

# ---- 4. machine-wide residue ------------------------------------------------
Write-Log '--- machine-wide'
# Spool files contain the full content of anything printed. On a kiosk whose purpose includes
# printing a CV, this is the highest-value location in the whole list.
Clear-Contents 'C:\Windows\System32\spool\PRINTERS' 'Print spool'
Clear-Contents 'C:\Windows\Temp' 'Windows Temp'

# The Recycle Bin is per SID and lives outside the profile.
$recycle = ('C:\{0}Recycle.Bin\{1}' -f '$', $sid)
Clear-Contents $recycle 'Recycle Bin (kiosk SID)'

# ---- 5. autologon reassertion -----------------------------------------------
# Inherited from Invoke-KioskSessionPurge.ps1, which this script supersedes. It is not a
# privacy function and it is here because it has nowhere else to live: an interactive
# administrator sign-in at the console rewrites DefaultUserName, and the kiosk then stops
# signing itself in with nothing to explain why. The remediation sets it too, but only on its
# daily check-in, so a restart between an admin sign-in and that check-in leaves the device at
# the sign-in screen.
#
# Idempotent, and deliberately does not touch the LSA secret: the password is not read or
# rewritten here, only the account name and the flag.
Write-Log '--- autologon'
$wl = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
if (-not $DryRun) {
    $before = (Get-ItemProperty $wl -ErrorAction SilentlyContinue).DefaultUserName
    Set-ItemProperty $wl -Name DefaultUserName -Value $AccountName -Type String -ErrorAction SilentlyContinue
    Set-ItemProperty $wl -Name AutoAdminLogon  -Value '1'          -Type String -ErrorAction SilentlyContinue
    Remove-ItemProperty $wl -Name DefaultPassword   -ErrorAction SilentlyContinue  # never cleartext
    Remove-ItemProperty $wl -Name DefaultDomainName -ErrorAction SilentlyContinue  # not for a local account
    Remove-ItemProperty $wl -Name AutoLogonCount    -ErrorAction SilentlyContinue  # never expires
    if ($before -and $before -ne $AccountName) {
        Write-Log "autologon reasserted: DefaultUserName was '$before', now '$AccountName'"
    } else {
        Write-Log "autologon confirmed for $AccountName"
    }
} else {
    Write-Log 'DRYRUN     autologon reassertion'
}

# ---- summary ----------------------------------------------------------------
Write-Log '--- summary'
Write-Log "locations cleared: $cleared   not present: $skipped   items in use: $locked"
if ($locked -gt 0 -and $Phase -eq 'Logoff') {
    Write-Log 'Items in use at logoff are expected: a closing application still holds them. The startup and logon passes remove them before the next participant starts.'
}
if ($locked -gt 0 -and $Phase -ne 'Logoff') {
    Write-Log "WARNING: items in use during the $Phase pass. Something is holding participant data open before the session has started. Investigate."
}

# Log retention. The log records no file names, but it does record when the device was used,
# so it is not kept indefinitely.
$old = @(Get-ChildItem -LiteralPath $LogDirectory -Filter 'session-clean-*.log' -ErrorAction SilentlyContinue |
         Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) })
foreach ($o in $old) { Remove-Item -LiteralPath $o.FullName -Force -ErrorAction SilentlyContinue }
if ($old.Count -gt 0) { Write-Log "removed $($old.Count) log file(s) older than 30 days" }

Write-Log "=== $Phase pass complete ==="
exit 0
