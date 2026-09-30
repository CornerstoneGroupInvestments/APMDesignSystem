# Edge Start pin instability in a multi-app kiosk

Research note, 24 August 2026. Written against the reported symptom: the Microsoft Edge pin appears on the first sign-in and disappears on some later reboots, not all.

**Intermittent is the diagnosis.** A rule that is wrong fails every time. A pin that appears and then sometimes does not is a race or a value being rewritten, and there are three documented mechanisms on this device that behave that way. One of them is made worse by a decision in this design.

---

## 1. The pin depends on a file, and it does not need to

### RESOLVED 25 August 2026: the pin must name the AppID Start actually reports

Measured on the reference device with `Get-StartApps`:

```
Microsoft Edge    {7C5A40EF-A0FB-4BFC-874A-C0F2E0B9FA8E}\Microsoft\Edge\Application\msedge.exe
```

Start surfaces Edge as a **classic desktop app with a path-based AppID**, where the GUID is the Known Folder ID for Program Files (x86). It does **not** surface Edge under its packaged AUMID, even though the package is registered (`PackageFullName Microsoft.MicrosoftEdge.Stable_151.0.4129.107_neutral__8wekyb3d8bbwe`, status Ok, and provisioned for new profiles).

So the correct pin is:

```json
{"desktopAppId":"{7C5A40EF-A0FB-4BFC-874A-C0F2E0B9FA8E}\\Microsoft\\Edge\\Application\\msedge.exe"}
```

| Form | Tried | Result |
|---|---|---|
| `desktopAppLink` to `Microsoft Edge.lnk` | yes | Appears after a CSP write, gone after restart |
| `desktopAppId` = `MSEdge` | yes | Never resolved. The form was right; the value was invented, not measured |
| `packagedAppId` = the AUMID | yes | Never resolved. Start does not surface Edge under its packaged identity on this build |
| `desktopAppId` = the AppID from `Get-StartApps` | pending | The only form whose value has been measured rather than guessed |

**The lesson worth keeping: the pin value is a measurement, not a choice.** Two of the three failed attempts failed because the identifier was reasoned about instead of read off the device. `Get-StartApps` is the authority, and it takes one command.

Re-measure if Edge is ever installed into a different Program Files tree, because the Known Folder GUID changes with it.

The `AppUserModelId` entry in `AllowedApps` stays as it is: Microsoft documents it as required for Edge secondary tiles, and it is not what the pin resolves through.

### Two other things the same measurement established

**Edge updates itself on this device.** `edgeupdate` is set to Automatic, `MicrosoftEdgeUpdateTaskMachineCore` was running, and `MicrosoftEdgeUpdateTaskMachineUA` was ready. If the measured `desktopAppId` still drops, an update re-staging the package at restart is the remaining candidate, and suppressing the updater in favour of a controlled version is the fix.

**Edge ships no per-user Start shortcut and the all-users one is ours.** `C:\ProgramData\...\Microsoft Edge.lnk` carries a creation time matching the remediation run, not the Edge install. Harmless to keep, and worth keeping so the build is not missing a shortcut every other Windows device has, but nothing should depend on it.

The original analysis follows, unchanged.

---

### What the timing now points at

The pin works on the sign-in that directly follows a CSP write, and fails on every sign-in after that.

**The session purge is eliminated, and its elimination sharpens the finding.** `APM-PK-PurgeStartup` was never deployed to this device, so the kiosk profile has persisted across every restart of this investigation. Profile age, profile recreation and first-sign-in races are all therefore out: the pin is being lost from the **same persistent profile**.

What remains is that the working case had the configuration freshly written moments before, and every failing case applies it from stored state. Something between those two points drops Edge specifically, while the LibreOffice pins in the same list survive. The relevant difference between them is identity type: Edge on Windows 11 carries a packaged app identity and must be registered for the account to appear on Start, whereas a classic Win32 shortcut resolves by path. That is exactly the split observed, and it holds whichever of the three pin forms is used, because all three ultimately resolve through Edge's registration.

**So the question is whether Edge is provisioned and registered correctly for the kiosk account, and whether that registration survives a restart.** `Test-KioskEdgeProvisioning.ps1` measures it: the provisioned package for new users, the per-user registration for every account on the device, and whether the AUMID resolves as a Start app at all. If `Get-StartApps` does not list Edge for the kiosk account, no pin of any form can ever appear, and the fault is in Edge's deployment rather than in the Assigned Access configuration.

The original analysis follows, unchanged.

---


The configuration pins Edge by shortcut path: `desktopAppLink` to `%ALLUSERSPROFILE%\Microsoft\Windows\Start Menu\Programs\Microsoft Edge.lnk`. Microsoft's own Assigned Access example uses that form, so it is legal. It is also the only pin in the list whose target file this project creates: the remediation synthesises `Microsoft Edge.lnk` because the reference device shipped without one.

That makes the pin dependent on a file that Edge's own installer and updater also believe they own.

**`desktopAppId` is the alternative, and for Edge the value is `MSEdge`.** Microsoft's Start menu training material gives the pinned-list form directly: <cite index="69-2">`{ "desktopAppId": "MSEdge" }`</cite>, alongside `packagedAppId` for packaged apps. The same `MSEdge` identifier appears in independent field examples of `ConfigureStartPins`.

Pinning by identifier removes the file from the equation. Nothing to create, nothing for an Edge update to replace, and no path to go stale. **This is the change to make first**, and it lets the shortcut-creation block come out of the remediation.

Verify the identifier on the reference device before shipping it: sign in, pin Edge by hand, and run `Export-StartLayout` to read back the exact value Windows uses.

## 2. RestrictRun is a second allow-list, and it is not AppLocker

This is the mechanism most likely to explain intermittency, and it was not on the radar at all.

Assigned Access sets `RestrictRun` to 1 under `HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer`, with a subkey listing permitted executables. A Microsoft Q&A participant reading a kiosk device's own registry describes it exactly: <cite index="48-12,48-13,48-14">"the 'RestrictRun' DWORD is set to 1. The associated subkey of 'RestrictRun' lists the various applications, each in their own string value... listed under User > Settings > Policies > Administrative Templates > System > Run only specified Windows applications"</cite>.

Two properties of it matter here.

**It matches on the executable name, not the path.** <cite index="48-3">"The restrictedRun policy requires only the executable name (e.g., CrossDeviceResume.exe), not the full file path"</cite>. So every path correction made for LibreOffice is irrelevant to this layer, and a name absent from the list is blocked wherever it lives.

**It is rewritten whenever the kiosk profile refreshes.** <cite index="45-1">"It must be applied periodically since after the kiosk profile is refreshed, registry value is changed to '1' again"</cite>. A per-user value regenerated on a schedule is precisely the shape of a fault that comes and goes.

And it bites Edge specifically. Reporting a change in Windows 11 after the September 2025 updates: <cite index="45-3,45-4">"Prevents launching Edge via Start menu shortcut (.lnk) unless msedge.exe is allowed. Forces administrators to explicitly allow every executable used in the session"</cite>. The same report confirms the trio this design now carries is the documented answer for Start pinning: <cite index="38-16,38-17">"According to Microsoft documentation, we need to use secondary tiles. To enable Start menu pinning via secondary tiles, we must include: `<App AppUserModelId="Microsoft.MicrosoftEdge.Stable_8wekyb3d8bbwe!App" />` `<App DesktopAppPath="%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" />` `<App DesktopAppPath="%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge_proxy.exe" />`"</cite>.

**Measure it.** Load the kiosk account's hive and read `RestrictRun` and its subkey. If `msedge.exe` and `msedge_proxy.exe` are not both listed by name, that is the fault, and it explains why the pin behaviour varies with when the profile last refreshed.

The workaround circulating in the field is a scheduled task setting `RestrictRun` to 0 in the kiosk user's hive. Its own author is clear about what it is: <cite index="45-2">"It is not officially documented or supported as a long-term solution"</cite>. **Do not adopt it here.** Setting a kiosk's restriction policy to 0 removes an enforcement layer on a public device, and this design has already found its AppLocker collections sitting in AuditOnly. Two disabled layers is not a kiosk.

## 3. Edge updates itself, and an update can invalidate the rule

Hexnode's guidance on Edge being blocked after a reboot in a Windows multi-app kiosk: <cite index="35-6,35-7">"After a reboot, Windows re-evaluates the kiosk rules and Edge may also apply a pending update. If the executable path changes due to the update, the existing kiosk rule no longer matches and Edge is blocked"</cite>, with the remedy being <cite index="35-8">"update the Windows kiosk policy so that Edge is added using the static executable path instead of a version-specific path"</cite>.

This design already uses the static path (`Application\msedge.exe`, not a version folder), so the narrow form of that fault does not apply. The broader point does: **Edge updates itself in the background on its own schedule, and a reboot is when the pending update lands.** An update re-registers the Edge package, and the Start pin resolves through that registration. A pin that fails on the reboots where an update was pending, and works on the others, matches the reported symptom exactly.

**Suppress Edge's own updater on these devices and manage the version deliberately.** The App Control policy already trusts Patch My PC as a publisher and the TCD pins TeamViewer to a major version for the same reason: an update that changes what the policy trusts should be a controlled change, not a background one.

## 4. Feature updates break kiosk Start layouts, as a class

Not the current fault, but it will be one day. A Microsoft Q&A report: <cite index="37-1,37-2">"We recently started updating our computers to 24H2 and in the process it appears to have broken our assigned access configuration by hiding all of our pinned apps on the start menu. Prior to this, all of our allowed applications were pinned and visible on the start menu with no issue"</cite>, with re-applying the XML making no difference and nothing in the event log.

Worth carrying into the update-ring design: a Windows feature update on this fleet needs a pilot device and an explicit Start menu check, because the failure is silent and re-applying the configuration does not clear it.

## 5. The design decision that was assumed to make all of this worse

**ELIMINATED 25 August 2026: the session purge was never deployed to this device.** `APM-PK-PurgeStartup` does not exist on it, so nothing in this section describes what has actually been happening. The kiosk profile has persisted across every restart, which is why the section below is wrong and is kept only so the reasoning is not repeated.

It remains a real interaction to design around once the purge IS deployed, and the original text is left for that reason. It is not evidence about the current fault.

**The session purge deletes the kiosk profile on restart.** That is the control that guarantees no participant data survives, and it is not in question. But it means every boot is a first sign-in for that account: the Start menu cache is rebuilt from nothing, `RestrictRun` is written fresh, and Edge's per-user registration runs again.

A race that would normally only be visible on a genuinely new profile therefore runs on **every single boot** of every kiosk in the fleet. That is the most plausible reason the fault is intermittent rather than constant, and it is specific to this design rather than to Assigned Access generally.

This is inference, not a cited fact, and it is testable: disable the purge for one boot cycle so the profile survives, and see whether the pin becomes reliable. If it does, the purge is the amplifier and the fix has to be a pin form that does not depend on per-boot state, which is finding 1.

A closely matching field report, on a multi-app kiosk with Win32 apps and autologon: <cite index="40-4,40-5">"there was a brief moment when I saw the pinned apps and could access them. Since then after restarting, they have never come back"</cite>.

## 6. One thing that is already right

The Start pins JSON is minified. That matters: applying `ConfigureStartPins` with a formatted JSON payload produces error 65000. <cite index="66-6,66-7">"I went back to the JSON file I used and REMOVED all the line feeds, carriage returns and spaces that I had added to make the file more readable and reuploaded the JSON file to Intune. After a policy update all the devices that had errors with the Configuration Profile were showing as successful"</cite>. Keep it on one line, and do not reformat it for readability.

---

## What to do, in order

1. **Pin Edge by the `desktopAppId` value measured with `Get-StartApps`**, currently `{7C5A40EF-A0FB-4BFC-874A-C0F2E0B9FA8E}\Microsoft\Edge\Application\msedge.exe`. Not the packaged AUMID, which Start does not surface Edge under on this build, and not an invented `desktopAppId` value.
2. **Read `RestrictRun` and its subkey from the kiosk account's hive.** ELIMINATED 24 August 2026: all 20 entries read, with `msedge.exe` and `msedge_proxy.exe` both present by name. Not the cause. The read did find three appended duplicates, which is a separate defect.
3. **Suppress Edge's own updater** and manage the version through the same controlled path as the other applications.
4. **Edge provisioning is confirmed sound.** `Test-KioskEdgeProvisioning.ps1` found the package registered, status Ok, and provisioned for new profiles. Note that the first version of that script printed the .NET type name instead of each SID and therefore falsely reported the kiosk account as unregistered; the corrected version resolves each SID to a name and prints the kiosk SID for comparison.
5. **Do not set `RestrictRun` to 0.** It is undocumented, it is reverted at every profile refresh, and it removes an enforcement layer from a public device that already has its AppLocker collections in audit.
6. **Add a Start menu check to the Windows feature update pilot.** Feature updates break kiosk Start layouts silently and re-applying the configuration does not fix it.

## Open, and worth stating plainly

Nothing here has been measured on the device yet. Item 2 is the measurement that discriminates between causes, and it costs one registry read. Item 1 is worth doing regardless of what item 2 finds, because a pin that depends on a synthesised shortcut is fragile whether or not it is today's fault.
