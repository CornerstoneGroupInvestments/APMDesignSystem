<#
.SYNOPSIS
    Reports the applied time zone and time synchronisation state on a Participant Kiosk, and
    whether the device can actually reach its configured time source. Read-only.

.DESCRIPTION
    Written to run under Constrained Language Mode, so it needs no signing.

    A configuration profile reporting "succeeded" in Intune proves the value was written. It
    does not prove the device can reach a time source. NTP is UDP 123 and this fleet egresses
    through a default-deny edge with web traffic tunnelled to a proxy, so the value can be
    correct and synchronisation can still never happen.

    Six sections:
      1. Current time, time zone, and whether policy set the zone or it was left to the user.
      2. Daylight saving, which is where the two same-offset Australian pairs go wrong.
      3. The NTP configuration actually in force, not the one intended.
      4. Last successful synchronisation and the current offset.
      5. Whether UDP 123 reaches the configured source.
      6. Verdict.

.NOTES
    Run elevated. Reads only; changes nothing.
    Diagnostic tooling. Not an Intune object, not deployed, not assigned.
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'
function Head($t) { Write-Host ''; Write-Host ('== ' + $t) -ForegroundColor Cyan }
function Item($k, $v) { Write-Host ('   {0,-40} {1}' -f $k, $v) }
function Good($t) { Write-Host ('   OK    ' + $t) -ForegroundColor Green }
function Bad($t)  { Write-Host ('   FAIL  ' + $t) -ForegroundColor Red }
function Warn($t) { Write-Host ('   WARN  ' + $t) -ForegroundColor Yellow }
function Note($t) { Write-Host ('         ' + $t) -ForegroundColor DarkGray }

# Native stderr becomes a terminating error under ErrorActionPreference Stop, and w32tm writes
# to stderr routinely. Every native call goes through here.
function Invoke-Native($exe, $arguments) {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $out = & $exe @arguments 2>&1
    $code = $LASTEXITCODE
    $ErrorActionPreference = $prev
    return @{ Output = @($out); Code = $code }
}

$findings = @()

Write-Host ''
Write-Host 'Participant Kiosk - time zone and synchronisation' -ForegroundColor White
Item 'Device' $env:COMPUTERNAME
Item 'Run at' (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')
Item 'Language mode' $ExecutionContext.SessionState.LanguageMode

# ------------------------------------------------------------- 1. time zone
Head '1. Time zone'
$tz = Get-TimeZone -ErrorAction SilentlyContinue
if ($tz) {
    Item 'Id' "$($tz.Id)"
    Item 'Display name' "$($tz.DisplayName)"
    Item 'Base UTC offset' "$($tz.BaseUtcOffset)"
    Item 'Supports daylight saving' "$($tz.SupportsDaylightSavingTime)"
} else {
    Bad 'Get-TimeZone returned nothing.'
    $findings += 'time zone unreadable'
}

# The policy value and the live value are separate. A device where a user set the zone before
# the profile landed reads correct here and reverts the moment policy reasserts, or the other
# way round, and only the policy key says which.
$polKey = 'HKLM:\SOFTWARE\Microsoft\PolicyManager\current\device\TimeLanguageSettings'
$polVal = $null
if (Test-Path $polKey) {
    $p = Get-ItemProperty $polKey -ErrorAction SilentlyContinue
    if ($null -ne $p.ConfigureTimeZone) { $polVal = "$($p.ConfigureTimeZone)" }
}
Item 'Set by policy' $(if ($polVal) { $polVal } else { 'NO, not policy-managed' })
if (-not $polVal) {
    Bad 'The time zone is not set by policy, so it is whatever the image or a user left behind.'
    Note 'Deploy CDG-W11-CFG-Time Zone <state>-P-1.0. See timezone-and-time-sync.md.'
    $findings += 'time zone not policy-managed'
} elseif ($tz -and $polVal -ne "$($tz.Id)") {
    Bad "Policy says '$polVal' but the live zone is '$($tz.Id)'. The device has not applied it yet, or something is overriding it."
    $findings += 'policy and live zone disagree'
} else {
    Good 'Live time zone matches the policy value.'
}

# ------------------------------------------------------- 2. daylight saving
Head '2. Daylight saving'
Note 'Two Australian pairs share an offset and differ only on daylight saving: Sydney against'
Note 'Brisbane, and Adelaide against Darwin. Picking the wrong one of a pair is correct in'
Note 'winter and an hour out all summer, which reads as an intermittent fault.'
if ($tz) {
    # (Get-Date).IsDaylightSavingTime() is a DateTime method, and DateTime is an allowed type
    # under Constrained Language Mode. TimeZoneInfo's own methods are not on the allowed list
    # that this project has verified on the device, so they are avoided rather than assumed.
    # The offset comes from a format string, which needs no method call at all.
    Item 'In daylight saving right now' "$((Get-Date).IsDaylightSavingTime())"
    Item 'Current UTC offset' (Get-Date -Format 'zzz')
    $pairs = @{
        'AUS Eastern Standard Time'    = 'Brisbane is E. Australia Standard Time and does NOT observe daylight saving'
        'E. Australia Standard Time'   = 'Sydney, Melbourne and Canberra are AUS Eastern Standard Time and DO observe daylight saving'
        'Cen. Australia Standard Time' = 'Darwin is AUS Central Standard Time and does NOT observe daylight saving'
        'AUS Central Standard Time'    = 'Adelaide is Cen. Australia Standard Time and DOES observe daylight saving'
    }
    if ($pairs.ContainsKey("$($tz.Id)")) {
        Note ('  Confirm the site is not in the paired zone: ' + $pairs["$($tz.Id)"])
    }
}

# ---------------------------------------------------------- 3. NTP settings
Head '3. NTP configuration in force'
$w32 = 'HKLM:\SYSTEM\CurrentControlSet\Services\W32Time'
$paramsKey = "$w32\Parameters"
$ntpKey = "$w32\TimeProviders\NtpClient"
$svc = Get-Service -Name W32Time -ErrorAction SilentlyContinue
Item 'W32Time service' $(if ($svc) { "$($svc.Status), startup $($svc.StartType)" } else { 'not present' })
if ($svc -and "$($svc.Status)" -ne 'Running') {
    Bad 'The time service is not running, so nothing is synchronising.'
    $findings += 'W32Time not running'
}

$prm = Get-ItemProperty $paramsKey -ErrorAction SilentlyContinue
$ntp = Get-ItemProperty $ntpKey -ErrorAction SilentlyContinue
$type = "$($prm.Type)"
$server = "$($prm.NtpServer)"
Item 'Type' $type
Item 'NtpServer' $server
Item 'NtpClient enabled' "$($ntp.Enabled)"
Item 'SpecialPollInterval' $(if ($null -ne $ntp.SpecialPollInterval) { "$($ntp.SpecialPollInterval) seconds" } else { 'not set' })

if ($type -eq 'NT5DS') {
    Bad 'Type is NT5DS, which tells the device to follow a domain time hierarchy.'
    Note 'This device is Entra joined with no domain, so there is no hierarchy to follow and'
    Note 'synchronisation never happens while the service reports success. Type must be NTP.'
    $findings += 'Type is NT5DS'
} elseif ($type -ne 'NTP') {
    Warn "Type is '$type', expected NTP."
    $findings += 'unexpected Type'
} else {
    Good 'Type is NTP, correct for an Entra-joined device with no domain.'
}

if ($null -ne $ntp.SpecialPollInterval -and [int]$ntp.SpecialPollInterval -ge 604800) {
    Warn "SpecialPollInterval is $($ntp.SpecialPollInterval) seconds, the seven-day default."
    Note 'Seven days of hardware clock drift on this class of device is minutes, not seconds.'
    $findings += 'poll interval is the seven-day default'
}
if ($server -and $server -notmatch '0x9|0x1') {
    Warn "NtpServer '$server' carries no flag. Without 0x9 the poll interval is ignored."
    $findings += 'NtpServer flag missing'
}

# ---------------------------------------------------- 4. last sync and offset
Head '4. Synchronisation state'
$st = Invoke-Native 'w32tm' @('/query', '/status')
if ($st.Code -ne 0) {
    Bad 'w32tm /query /status failed. The service may be stopped or unconfigured.'
    foreach ($l in $st.Output) { if ("$l".Trim()) { Note "  $l" } }
    $findings += 'status unavailable'
} else {
    foreach ($l in $st.Output) {
        if ("$l" -match '^(Leap Indicator|Stratum|Last Successful Sync Time|Source|Poll Interval)') { Item '' "$l" }
    }
    $sourceLine = ''
    foreach ($l in $st.Output) { if ("$l" -match '^Source:\s*(.+)$') { $sourceLine = $Matches[1].Trim() } }
    if ($sourceLine -match 'Local CMOS Clock|Free-running') {
        Bad "Source is '$sourceLine'. The device is running on its own hardware clock and is not synchronising with anything."
        Note 'This is what a blocked UDP 123 looks like. The profile can report success and this still be true.'
        $findings += 'free-running clock'
    }
    foreach ($l in $st.Output) {
        if ("$l" -match 'Last Successful Sync Time:\s*(.+)$') {
            $lst = $Matches[1].Trim()
            if ($lst -match 'unspecified') {
                Bad 'Last successful sync is unspecified. The device has never synchronised.'
                $findings += 'never synchronised'
            }
        }
    }
}

$strip = Invoke-Native 'w32tm' @('/stripchart', "/computer:$(if ($server) { ($server -split ',')[0] } else { 'time.windows.com' })", '/dataonly', '/samples:3')
Head '5. Can it actually reach the source?'
Item 'Target' $(if ($server) { ($server -split ',')[0] } else { 'time.windows.com' })
$reached = $false
foreach ($l in $strip.Output) {
    if ("$l".Trim()) { Note "  $l" }
    if ("$l" -match '[+-]\d+\.\d+s') { $reached = $true }
}
if ($reached) {
    Good 'The source responded. UDP 123 is reaching it and the offset is shown above.'
} else {
    Bad 'No response from the time source.'
    Note 'Outbound UDP 123 from the kiosk range is the prerequisite, and it is not web traffic,'
    Note 'so a web proxy does not carry it. Raise with APM Network Management, and confirm with'
    Note 'Stratus whether the Zscaler tunnel carries UDP 123. See timezone-and-time-sync.md.'
    $findings += 'time source unreachable'
}

# ------------------------------------------------------------- 6. verdict
Head '6. Verdict'
if ($findings.Count -eq 0) {
    Good 'Time zone is policy-managed and the device is synchronising against its configured source.'
} else {
    Write-Host ''
    Write-Host "   $($findings.Count) finding(s): $($findings -join '; ')" -ForegroundColor Yellow
    Write-Host ''
    if ($findings -contains 'time source unreachable' -or $findings -contains 'free-running clock' -or $findings -contains 'never synchronised') {
        Write-Host '   The clock is not synchronising' -ForegroundColor White
        Note 'This is not only a displayed-time problem. Once the offset is large enough TLS validation'
        Note 'fails and Entra rejects the token exchange, so the device stops checking in to Intune and'
        Note 'therefore stops receiving the policy that would fix it. Treat it as a build dependency.'
    }
    if ($findings -contains 'time zone not policy-managed') {
        Write-Host '   Time zone is not managed' -ForegroundColor White
        Note 'Whatever the image or a user left is what the participant sees. Fleet-wide rollout is'
        Note 'blocked on the Autopilot Group Tag decision, because no dynamic group can currently'
        Note 'select the devices in one state.'
    }
}
Write-Host ''
