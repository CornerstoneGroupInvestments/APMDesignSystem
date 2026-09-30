# Time zone and time synchronisation

Both are set by policy, not by script. Two new configuration profiles, and one firewall change that has to happen or neither works.

This supersedes Technical Configuration Document 12.5, which records NTP as "N/A" on the basis that the standard Windows time service against Microsoft's default source needs no fleet configuration. That is not correct on this fleet, for the reason in section 3.

---

## 1. Time zone: the mechanism

**Intune admin centre > Devices > Configuration > Create > New policy > Windows 10 and later > Settings catalog.**

Category **Time Language Settings**, setting **Configure Time Zone**. Value is the Windows time zone ID as a string.

The equivalent custom OMA-URI, if the settings catalog entry is unavailable on the tenant's Intune version:

| Field | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/TimeLanguageSettings/ConfigureTimeZone` |
| Data type | String |
| Value | the time zone ID, for example `AUS Eastern Standard Time` |

Setting this locks the time zone: the Date and Time control panel shows it greyed out, and a standard user cannot change it. On a kiosk that is the wanted behaviour. It also overrides the Auto Time Zone Updater service, so there is nothing further to disable.

## 2. Time zone: one profile is not enough

**The fleet spans states, and Australia has eight Windows time zone IDs with daylight saving observed in some states and not others.** A single tenant-wide value is wrong for most sites for part of the year, and wrong by an hour, which on a device a participant uses to check an appointment time is a service defect rather than a cosmetic one.

| Windows time zone ID | Covers | UTC offset | Daylight saving |
|---|---|---|---|
| `AUS Eastern Standard Time` | Sydney, Melbourne, Canberra | +10:00 | Yes |
| `E. Australia Standard Time` | Brisbane | +10:00 | No |
| `Tasmania Standard Time` | Hobart | +10:00 | Yes |
| `Cen. Australia Standard Time` | Adelaide | +09:30 | Yes |
| `AUS Central Standard Time` | Darwin | +09:30 | No |
| `W. Australia Standard Time` | Perth | +08:00 | No |
| `Aus Central W. Standard Time` | Eucla | +08:45 | No |
| `Lord Howe Standard Time` | Lord Howe Island | +10:30 | Yes |

Note the two pairs that share an offset and differ only on daylight saving: Sydney against Brisbane, and Adelaide against Darwin. Choosing the wrong one of a pair is correct in winter and an hour out all summer, which is the hardest version of this fault to notice and the most likely to be reported as intermittent.

### The blocker: nothing on the device identifies its state

The kiosk dynamic group keys on device name, and the naming convention is `APM-PK-<SERIAL>`. A serial number carries no site or state, so **no dynamic group can currently select the devices in one state**, and therefore no per-state profile can be targeted.

Three ways to fix it, in order of preference:

**Autopilot Group Tag per state.** The hardware hash import CSV carries a Group Tag, and the design already uses `PARTICIPANT`. Extend it to `PARTICIPANT-NSW`, `PARTICIPANT-QLD` and so on, and build one dynamic group per tag:

```
(device.devicePhysicalIds -any (_ -eq "[OrderID]:PARTICIPANT-NSW"))
```

CompNow sets the tag at import, it survives a wipe and rebuild, and it needs no change to the device name. This is the recommended option and it should be settled before the next hardware batch is imported, because retagging an already-imported device means editing the Autopilot record by hand.

**Extend the device name template.** Autopilot name templates support `%SERIAL%` and `%RAND%` only, so a state code cannot be injected without a separate Autopilot profile per state. That means one deployment profile per state instead of one Group Tag per state, for the same result and more objects.

**Set it at build time.** CompNow sets the time zone during device prep. Rejected: it is not policy-enforced, it does not survive a rebuild, and there is no reporting on whether it is right.

### Until the tagging decision is made

Deploy one profile with the time zone of the pilot site only, assigned to `sg-dyn-dvc-cdg-participant-kiosk`, and record that fleet-wide rollout is blocked on the Group Tag decision. Deploying a single value fleet-wide is worse than deploying nothing, because a wrong clock that looks authoritative is trusted.

## 3. Time synchronisation, and why NTP is not "N/A"

Windows synchronises against `time.windows.com` by default. Two properties of this fleet break that assumption.

**NTP is UDP 123, and it is not web traffic.** The design egresses through a default-deny Meraki edge and a default-deny Palo Alto pair, with web traffic tunnelled to Zscaler ZIA. A web proxy does not carry UDP 123, so unless an explicit outbound rule exists the time service fails silently and the clock free-runs on the hardware RTC.

**A drifted clock breaks device management, not just the displayed time.** TLS certificate validation fails once the offset is large enough, and Entra ID rejects a Kerberos or token exchange outside its clock skew tolerance. A device that has drifted far enough stops checking in to Intune, which means it also stops receiving the policy that would have fixed it. This is the argument for treating it as a build dependency rather than a nicety.

**The default poll interval is seven days.** `SpecialPollInterval` defaults to 604800 seconds. On a device that is restarted daily by the idle watchdog this is survivable, but seven days of RTC drift on cheap hardware is minutes, not seconds, and a kiosk showing an appointment time should not be minutes out.

### Configuration

**Settings catalog**, category **Administrative Templates > System > Windows Time Service > Time Providers**:

| Setting | Value | Rationale |
|---|---|---|
| Enable Windows NTP Client | Enabled | The client is on by default; setting it explicitly stops a baseline change turning it off |
| Configure Windows NTP Client | Enabled | Container for the values below |
| NtpServer | `time.windows.com,0x9` | `0x9` is SpecialInterval plus Client, so the interval below is honoured |
| Type | `NTP` | Not `NT5DS`. The device is Entra joined with no domain, so there is no domain hierarchy to follow |
| SpecialPollInterval | `3600` | One hour. Replaces the seven-day default |
| ResolvePeerBackoffMinutes | `15` | |
| ResolvePeerBackoffMaxTimes | `7` | |
| CrossSiteSyncFlags | `2` | |
| EventLogFlags | `2` | Logs a time-change event, so drift is visible in the event log rather than only in symptoms |

`Type` set to `NT5DS` is the single most common error here. It tells the device to find a domain time hierarchy, and on an Entra-joined device with no domain there is none, so synchronisation never happens and the service reports success.

### The firewall change, which is a prerequisite

**Outbound UDP 123 to `time.windows.com` must be permitted** at the Meraki edge and on the Palo Alto pair, from the kiosk address range. Raise with APM Network Management, and confirm with Stratus whether the Zscaler IPSEC tunnel carries UDP 123 or whether the rule has to be a direct egress exception.

If direct UDP 123 egress is refused, the alternatives in order:

1. An internal NTP source APM already operates, reachable from the kiosk range. Preferred if one exists, because it needs no new internet egress.
2. `time.cloudflare.com` or another provider on the approved list, if the objection is to Microsoft's endpoint specifically rather than to the protocol.
3. Accept the drift and document it as a risk with the management-failure consequence stated. Not recommended.

## 4. New Intune objects

| Name | Type | Assignment |
|---|---|---|
| `CDG-W11-CFG-Time Zone AUS Eastern-P-1.0` | Settings catalog, Configure Time Zone | Pilot site group, pending the Group Tag decision. One profile per state once tagging exists |
| `CDG-W11-CFG-Time Sync-P-1.0` | Settings catalog, Windows Time Service | `sg-dyn-dvc-cdg-participant-kiosk` |

## 5. Verification

`Test-KioskTimeConfig.ps1` reports the applied time zone, whether policy set it or a user did, the NTP configuration actually in force, the last successful sync, the current offset against the configured source, and whether UDP 123 reaches it. Run it on a pilot device after both profiles land.

A profile reporting "succeeded" in Intune only proves the value was written. It does not prove the device can reach a time source, and this is exactly the class of dependency that reports success and fails in practice.

## 6. Open

| Item | Owner |
|---|---|
| Autopilot Group Tag per state, so per-state time zone profiles can be targeted. Blocks fleet-wide rollout, and retagging imported devices is manual | Digital Transformation and Architecture |
| Outbound UDP 123 from the kiosk range, and whether the Zscaler tunnel carries it | APM Network Management, with Stratus |
| Whether an internal NTP source exists that the kiosk range can reach | APM Network Management |
| Technical Configuration Document 12.5 to be rewritten: NTP is not "N/A" on a default-deny egress | Shaun Struik |
