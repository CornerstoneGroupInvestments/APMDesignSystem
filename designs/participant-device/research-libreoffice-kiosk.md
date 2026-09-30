# LibreOffice in a multi-app kiosk: what others have hit

Research note, 24 August 2026. Written while the Participant Kiosk LibreOffice launch failure was still open, to establish whether the pattern is known and how other people resolved it.

**It is a well-documented pattern, it has a documented cause, and the fix reverses a call made in Pass 3 of the Assigned Access review.**

---

## 1. Microsoft documents the dependency rule explicitly

*Create an Assigned Access configuration file* states it twice: <cite index="27-6">"When the multi-app kiosk configuration is applied to a device, AppLocker rules are generated to allow the apps that are listed in the configuration"</cite> and <cite index="27-2">"If an app has a dependency on another app, both must be included in the allowed apps list"</cite>.

Third-party guides restate it in stronger terms. One Windows 11 multi-app kiosk guide: <cite index="20-4,20-5">"Any process not listed - including dependencies - will be blocked... if an app spawns a helper process or relies on a second executable, that process must also appear in AllowedApps"</cite>. Another: <cite index="32-15,32-16">"If an app spans helpers, include those executables too. If an app has a dependency on another app, you will need to include both the apps in `<AllowedApps>` tag"</cite>.

LibreOffice is the textbook case of this shape. `swriter.exe` is a launcher; the process that draws the window is `soffice.bin`.

## 2. Pass 3 of the review removed `soffice.bin` on reasoning that does not survive contact with the field

The Pass 3 argument was that AppLocker's executable rule collection covers `.exe` and `.com` only, so listing a `.bin` could not help and might make rule generation fail.

A field report on the Wilders Security Forums says the opposite about this exact file: <cite index="13-1">"it might actually block *.BIN extensions, at least in Openoffice (soffice.Bin)"</cite>.

The same file is a repeat offender under other Windows enforcement engines, which is corroborating rather than conclusive but points the same way. On the Apache OpenOffice forum, for Controlled Folder Access: <cite index="11-21,11-22">"Allowing the .exe files without allowing soffice.bin doesn't solve the problem. Allowing soffice.bin without allowing the .exe files does"</cite>.

**Action: put `soffice.bin` back in `AllowedApps`.** The documented rule requires dependencies to be listed, and there is a direct field report of AppLocker blocking this extension for this application. The Pass 3 reasoning was an inference from the rule-collection extension list; the documented instruction and the field report both outrank it.

## 3. A second candidate this design has not tested: the environment variable

An article on a closely analogous failure (`cleanmgr.exe` blocked in a Windows 10 multi-app kiosk) reports that <cite index="33-1,33-2">"environment-variable expansion and path handling can differ depending on how the app is invoked (Start tile vs. Run vs. a system trigger)"</cite> and recommends updating the configuration so the allowed item uses a literal path rather than a variable.

The Participant Kiosk `AllowedApps` uses `%ProgramFiles%` and `%ProgramFiles(x86)%` throughout. Those are documented as accepted, and section 1 of the diagnostic confirmed the paths resolve for an administrator. Whether they resolve identically for the kiosk account inside the restricted shell is not established, and this design has never tested it.

**Action: worth one test with literal `C:\Program Files\LibreOffice\program\...` paths** for the LibreOffice entries only, before doing anything more invasive. It is a cheap test of a documented cause of exactly this symptom.

## 4. The documented diagnostic procedure is the one already built

Hexnode's kiosk troubleshooting guidance, for an allowed app that will not launch: <cite index="21-1,21-2,21-3">"Launch Event Viewer and proceed to Applications and Services Logs > Microsoft > Windows > AppLocker > EXE and DLL. Select the 'Save All Events As' option... The blocked dependency packages, along with their locations, will be listed in this file"</cite>, then add each one to the allowed-app list.

`Test-KioskLibreOffice.ps1` section 5 reads that log directly. **This confirms the approach, and it means the 8003 events already captured are the answer sheet.** The run of 23 August named three LibreOffice components that would be prevented under enforcement: `LANGUAGETOOLLO.DLL`, `SELECT.PYD` and `_SOCKET.PYD`.

Note what those extensions are. AppLocker's DLL rule collection <cite index="14-5">"include[s] only the .dll and .ocx file formats"</cite>, and <cite index="14-9">"If you use DLL rules, a DLL allow rule has to be created for each DLL that is used by all of the allowed apps"</cite>. A `.pyd` is a Python extension module, which is a DLL by another name. So the audit events span two collections, and `AllowedApps` addresses only one of them.

## 5. The supplemental-policy route, and Microsoft's caution about it

Where the allowed-app list cannot express what is needed, practitioners fall back to a separate AppLocker policy delivered by OMA-URI. A comment on Peter van der Woude's multi-app kiosk article gives the node: <cite index="30-14,30-15">"you will have to create an applocker whitelisting policy to get it sorted. you can use this URI to perform whitelisting `./Vendor/MSFT/AppLocker/ApplicationLaunchRestrictions/Grouping/EXE/Policy`"</cite>.

Against that, a Microsoft Q&A participant records the standing warning: <cite index="31-9">"Avoid creating AppLocker rules that conflict with AppLocker rules"</cite> generated by Assigned Access. Treat a supplemental policy as the last option, not the first.

Related, and useful to know before writing one: adding a blocked Microsoft component to `AllowedApps` does not always work. On `backgroundTaskHost.exe`, <cite index="29-10,29-11">"The error occurs because backgroundTaskHost.exe is blocked, but this process is required for Microsoft Store apps to run. Adding it to AllowedApps alone won't work - you need an AppLocker packaged app rule that allows all Microsoft-signed packaged apps"</cite>. So `AllowedApps` is not a universal escape hatch, and a fix that works for one collection can fail for another.

## 6. Two adjacent facts worth carrying into the design

**Conditional Access is a documented cause of kiosk logon failure.** Microsoft's own troubleshooting article for users unable to sign in to a Windows multi-app kiosk gives the cause as <cite index="23-6,23-7,23-8">"the users are targeted by conditional access policies that require user interaction. For example, multi-factor authentication (MFA), or Terms of Use (TOU)... exclude the kiosk users from any conditional access policies that require user interaction"</cite>. This is item 2.4 of the Assigned Access review, still unverified.

**The restricted user experience is for standard users only**, per Microsoft: <cite index="27-10">"Apply the restricted user experience to standard users only"</cite>. The design is compliant, and it also explains why nothing measured from an administrator account describes the participant.

**Also worth knowing:** on Windows 11, Edge and File Explorer can be reachable without appearing in `AllowedApps`, because Assigned Access carries predefined AppLocker rules for desktop. A commenter on the same article reports <cite index="30-16,30-17,30-18">"Even though file explorer is not put in the AllowedApps section, it can still be opened and interacted with. Microsoft Edge is another example of an application somehow being allowed while not being included in the AllowedApps section of the XML. This was not the case in Windows 10"</cite>. That is loosening rather than tightening, but it means an application appearing to work is not evidence that its rule exists.

## 7. Not the cause here, but worth a line in the design

Defender's Controlled Folder Access blocks `soffice.bin` as a matter of routine, and it presents as LibreOffice failing to open or save rather than failing to start. The Apache OpenOffice forum thread on it: <cite index="11-1,11-2">"Soffice.bin has been blocked by Controlled Folder Access. You need to change the Virus & threat protection settings to allow soffice.bin through Controlled Folder Access"</cite>, and a second thread records the same block preventing writes to Documents.

This design carries Defender for Endpoint P2, and a participant's whole purpose is writing a CV and saving it. **Whether Controlled Folder Access or any attack surface reduction rule is enabled on these devices needs establishing, and `soffice.bin` needs an exclusion if so.** Not today's fault, but it is the next thing that breaks after the launch is fixed.

---

## What to do, in order

1. **Add `soffice.bin` to `AllowedApps`** in both the canonical XML and the remediation here-string, then run `check-assigned-access.js`. Reverses Pass 3, defect 10. Cheapest and best-supported.
2. **If that does not fix it, replace the `%ProgramFiles%` variables with literal paths** for the LibreOffice entries and re-apply. Documented cause of this exact symptom.
3. **Re-run `Test-KioskLibreOffice.ps1` inside the kiosk session** and read section 5 for 8004 blocks. That is the documented procedure and it names the file rather than inferring it.
4. **Only then consider a supplemental AppLocker policy** via `./Vendor/MSFT/AppLocker/ApplicationLaunchRestrictions/Grouping/EXE/Policy`, and record it as a decision, because it works against a Microsoft caution.
5. **Separately, establish the Controlled Folder Access and attack surface reduction posture** on these devices and exclude `soffice.bin` if needed.

## What this changes in the review

- **Defect 10 is reversed.** `soffice.bin` goes back. The `check-assigned-access.js` rule that fails a non-`.exe` path in `AllowedApps` has to go with it, since it now enforces the wrong thing.
- **Item 3.8 is resolved against its own conclusion.** The reasoning was sound and the answer was wrong, which is worth keeping visible rather than quietly correcting.
- **A new verification item:** confirm that `%ProgramFiles%` expands as expected inside the restricted shell for the kiosk account.
