<#
.SYNOPSIS
    Participant Kiosk session purge. Deletes the participant profile and residual session
    data. Registered to run at shutdown and again at startup (layers 2 and 3 of the
    three-layer purge, Detailed Design 6.4).

.DESCRIPTION
    Deletes, in order:
      1. Every local profile whose account name starts with "Kiosk" via the Win32_UserProfile
         CIM class (the supported deletion path - removes the profile directory AND its
         registry hive and ProfileList entry, which rmdir alone does not). The pattern is
         "Kiosk*" and not "Kiosk-*": the session account is now the static KioskUser, and
         a Windows-managed autologon account is named kioskUser0. Neither has a hyphen,
         and a hyphenated pattern silently purges nothing.
      2. C:\Users\Public\Downloads contents.
      3. C:\Windows\Temp contents.
      4. The print spool directory contents (C:\Windows\System32\spool\PRINTERS).
    Then reasserts autologon (step 5), because an interactive administrator sign-in at the
    console rewrites DefaultUserName and stops the kiosk signing itself in.
    Never blocks shutdown: every step is wrapped, failures are logged and swallowed.
    Safe to run repeatedly and safe to run at startup, before the session account signs in.

.NOTES
    Runs as SYSTEM, 64-bit. Sign with the APM code-signing certificate (SOE-02).
    Policy: CDG-W11-REM-Profile Purge-P-1.0. Assignment: sg-dyn-dvc-cdg-participant-kiosk.
    Deploy twice: as a shutdown script and as a startup task. The ADMX setting "Delete user
    profiles older than a specified number of days on system restart" = 0 is the third layer.
    The shutdown pass is the one that matters for step 5: it restores the correct
    DefaultUserName before the next boot reads it.
#>
$ErrorActionPreference = 'Continue'
$log = 'C:\APM\PK\purge.log'
$logDir = Split-Path $log -Parent
if (-not (Test-Path $logDir)) { New-Item -Path $logDir -ItemType Directory -Force | Out-Null }
function Write-Log($msg) {
    $line = (Get-Date -Format o) + "  " + $msg
    Add-Content -Path $log -Value $line -ErrorAction SilentlyContinue
    Write-Output $msg
}

# ---- 1. participant profiles -------------------------------------------------
try {
    $profiles = Get-CimInstance -ClassName Win32_UserProfile -ErrorAction Stop |
        Where-Object { $_.LocalPath -and (Split-Path $_.LocalPath -Leaf) -like 'Kiosk*' -and -not $_.Special -and -not $_.Loaded }
    if (-not $profiles) { Write-Log 'No unloaded Kiosk-* profile present' }
    foreach ($p in $profiles) {
        try {
            Remove-CimInstance -InputObject $p -ErrorAction Stop
            Write-Log ("Deleted profile " + $p.LocalPath)
        } catch { Write-Log ("Profile delete failed for " + $p.LocalPath + " - " + $_.Exception.Message) }
    }
    $loaded = Get-CimInstance -ClassName Win32_UserProfile -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalPath -and (Split-Path $_.LocalPath -Leaf) -like 'Kiosk*' -and $_.Loaded }
    foreach ($p in $loaded) { Write-Log ("Profile still loaded, will be removed by the startup pass: " + $p.LocalPath) }
} catch { Write-Log ("Profile enumeration failed - " + $_.Exception.Message) }

# ---- 2-4. residual locations -------------------------------------------------
$targets = @(
    'C:\Users\Public\Downloads',
    'C:\Windows\Temp',
    'C:\Windows\System32\spool\PRINTERS'
)
foreach ($t in $targets) {
    try {
        if (Test-Path $t) {
            Get-ChildItem -Path $t -Force -ErrorAction SilentlyContinue |
                Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
            Write-Log ("Cleared " + $t)
        }
    } catch { Write-Log ("Clear failed for " + $t + " - " + $_.Exception.Message) }
}

# ---- 5. reassert autologon ----------------------------------------------------
# An interactive console sign-in rewrites DefaultUserName to the last account used, and
# AutoAdminLogon matches the stored credential against that name. So every break-glass or
# on-site administrator session leaves the kiosk unable to sign itself in, until the daily
# remediation repairs it: up to 24 hours of a device sitting at a sign-in screen. Doing it
# here, in the shutdown pass, closes the window to zero, because the correct name is
# restored before the next boot reads it.
#
# This does NOT touch the password. The LSA secret survives the administrator session, so
# reasserting the name is sufficient. Nothing here can create or rotate a credential.
#
# The account name derivation below is duplicated from Detect- and
# Remediate-KioskSessionAccount.ps1. All three must agree or the kiosk will not sign in;
# check-assigned-access.js enforces that they do.
try {
    $serial = ((Get-CimInstance Win32_BIOS -ErrorAction Stop).SerialNumber -replace '[^A-Za-z0-9]', '').ToUpperInvariant()
    if (-not $serial) { throw 'No BIOS serial number available' }
    if ($serial.Length -gt 14) { $serial = $serial.Substring(0, 14) }
    $user = "Kiosk-$serial"

    # Only ever point autologon at an account that exists. Pointing it at a missing account
    # would leave the device at a sign-in screen with no usable account, which is worse than
    # leaving the administrator's name in place for the remediation to correct.
    $acct = Get-LocalUser -Name $user -ErrorAction SilentlyContinue
    if (-not $acct) { Write-Log "Autologon not reasserted: local account $user does not exist" }
    elseif (-not $acct.Enabled) { Write-Log "Autologon not reasserted: local account $user is disabled" }
    else {
        $wl = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
        $before = (Get-ItemProperty $wl -Name DefaultUserName -ErrorAction SilentlyContinue).DefaultUserName
        Set-ItemProperty $wl -Name DefaultUserName -Value $user -Type String -ErrorAction Stop
        Set-ItemProperty $wl -Name AutoAdminLogon  -Value '1'   -Type String -ErrorAction Stop
        Remove-ItemProperty $wl -Name DefaultPassword   -ErrorAction SilentlyContinue  # never cleartext
        Remove-ItemProperty $wl -Name DefaultDomainName -ErrorAction SilentlyContinue  # not for a local account
        Remove-ItemProperty $wl -Name AutoLogonCount    -ErrorAction SilentlyContinue  # never expires
        if ($before -and $before -ne $user) { Write-Log "Autologon reasserted: DefaultUserName was '$before', now '$user'" }
        else { Write-Log "Autologon reasserted for $user" }
    }
} catch { Write-Log ("Autologon reassert failed - " + $_.Exception.Message) }

Write-Log 'Purge pass complete'
exit 0