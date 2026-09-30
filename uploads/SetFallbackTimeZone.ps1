<#
    CDG-W11-SCR-Fallback Time Zone-P-1.0

    Purpose  Give a device a sane starting time zone so it never begins life on a wildly
             wrong clock while location resolution is still pending.

    Context  Intune platform script. Devices > Manage devices > Scripts and remediations >
             Platform scripts. Runs once per device. SYSTEM, 64-bit host, no user.

    Safety   Acts ONLY when the device is still on an unconfigured default zone. It never
             overwrites a zone that has already been set, so a Perth kiosk that resolved
             W. Australia Standard Time is left alone.
             It never touches tzautoupdate. The zone and the automatic-zone switch are
             separate things, and automatic time zone is expected to override this value
             later. That is the point of it.

    Language Cmdlet-only. Set-TimeZone throws on a bad id rather than setting an exit code
             somebody forgets to check, and it is a cmdlet so it is Constrained Language
             Mode safe. tzutil is deliberately not used.
             Never append _dstoff to a zone id: it pins the zone with daylight saving off.
#>

# Windows standard time zone id. Change per fleet if most sites are not on the east coast.
$FallbackZone = 'AUS Eastern Standard Time'

# Zones that mean "nobody has set this yet". Anything else is left alone.
# A fresh Windows image commonly lands on Pacific Standard Time or UTC.
$UnsetZones = @('UTC', 'Pacific Standard Time', 'GMT Standard Time')

try {
    $currentZone = Get-TimeZone -ErrorAction Stop | Select-Object -ExpandProperty Id

    if ($currentZone -eq $FallbackZone) {
        Write-Output "Already on $FallbackZone. No change made."
        exit 0
    }

    if ($UnsetZones -notcontains $currentZone) {
        Write-Output "Time zone is $currentZone, which has already been set. Left alone."
        exit 0
    }

    Set-TimeZone -Id $FallbackZone -ErrorAction Stop
    $verify = Get-TimeZone -ErrorAction Stop | Select-Object -ExpandProperty Id

    if ($verify -ne $FallbackZone) {
        Write-Output "Set-TimeZone reported success but the zone is $verify, not $FallbackZone."
        exit 1
    }

    Write-Output "Fallback applied. Was $currentZone, now $verify. Automatic time zone will correct it once location resolves."
    exit 0

} catch {
    Write-Output "Fallback time zone failed: $($_.Exception.Message)"
    exit 1
}
