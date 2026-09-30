# Participant Kiosk V1.1 - review comment dispositions

Source: comments in `uploads/APM_DDD_Participant_Kiosk_V1.1.docx` (17 comments, 4 threads). One row per thread: what was asked, the proposed fix, and who confirms before it lands in V1.2.

## Thread 1 - File Explorer access to Downloads (Nick Dorbie, David Badger) - comments 9-11

**Ask.** Scope Desktop or Downloads into File Explorer so participants who download documents can find them; confirm local saves are purged each session.

**Proposed fix - accept, Downloads only.**
- Assigned Access `FileExplorerNamespaceRestrictions` supports exactly two namespaces: Downloads and removable drives. Add `<v3:AllowedNamespace Name="Downloads"/>` alongside `<v3:AllowRemovableDrives/>` in Appendix B; File Explorer then shows both.
- Point LibreOffice `WritePath` at `%USERPROFILE%\Downloads` (currently Documents) so Edge downloads and LibreOffice saves land in the one folder a participant can see. One folder, one story: "your files are in Downloads or on your USB".
- Desktop: recommend **no**. The restricted experience never shows the desktop, and the wallpaper copy already tells participants not to save there. Adding it would create a second place to lose files.
- The purge question is already answered by the design: Downloads sits inside the participant profile, which is destroyed on every restart (6.4 layers 2 and 3). No new script is required - state this explicitly in 4.3.1.1/6.4 so the next reviewer does not ask again.
- Update T-06/T-09 to save into Downloads and verify it is gone after restart.

**Confirms:** Business Owner (participant experience), then fold into 4.3.1, 4.3.6.2, 6.4, Appendix B.

## Thread 2 - Zscaler licensing and an identifiable account name (Nick, Phil De'ath, Shaun) - comments 29-34

**Ask.** Will every device presenting the same local account break or distort Zscaler licensing? Phil: the username needs to be identifiable - can the local account be named from the machine name? Notes: existing JS machines are user-based licence with device-based auth, and Zscaler rules currently bind to groups only.

**Proposed fix - APPLIED in V1.2, amended per Shaun's direction.** The session account is now named: `Kiosk-<SERIAL>`, created on-device by the signed remediation pair `CDG-W11-REM-Kiosk Session Account-P-1.0` (config/), with a 32-character random credential held only in the Winlogon LSA secret and the Assigned Access XML rendered per device through the WMI bridge. DR-011 amended accordingly - with APM Cyber Security for confirmation (the LSA secret is admin-extractable, LAPS-gated). The device name `APM-PK-[RRR][LLLL]` remains the identity for Zscaler machine-tunnel enrolment; the account name now also identifies the endpoint in Windows and Sentinel telemetry, which is what Phil asked for. Licensing per device still to be confirmed by Phil in the DR-013 workshop.
- The Assigned Access `AutoLogonAccount` is created and named by Windows; its name is not configurable, and replacing it with a script-created named account would reintroduce a stored credential - the thing Cyber removed. Do not rename the account.
- The identifiable name Phil needs already exists and is unique per device and site-coded: the hostname `APM-PK-[RRR][LLLL]`. In Client Connector machine-tunnel enrolment, the device identity Zscaler sees is the machine, not the Windows username. So the design position is: **Zscaler identification and licensing key on the device, matching the Intune device-licence model.**
- Add to 5.3.4 status table and DR-013: licensing to be confirmed as per-device (Phil expects no increase, possibly a reduction); rules currently group-bound must be rebound to device groups or locations.
- Add a sentence to 5.1.2: the local account name is an internal Windows artefact, never displayed, never used as an identity by any service; anything needing to identify the endpoint uses the device name.

**Confirms:** Phil De'ath with Zscaler (licensing SKU per device), in the DR-013 workshop.

## Thread 3 - PSK vs EAP-TLS Wi-Fi (Chris Katigbak, David Badger) - comments 61-63

**Ask.** Is there PSK lifecycle management? Could device certificates + EAP-TLS replace the PSK? David: network design is Chris's to lead.

**Proposed fix - raise as a new open decision (DR-019), network lead to determine.**
- Honest current state for the document: the PSK has **no lifecycle management defined** - it is deployed in the Intune Wi-Fi profile and rotates only by pushing a new profile and reconfiguring the SSID. Rotation trigger today would be compromise, not schedule. Say so.
- Option (a) PSK as designed: simple, no certificate infrastructure; weakness is a shared secret across the site fleet and manual rotation.
- Option (b) EAP-TLS with device certificates: per-device identity and revocation, no shared secret. Costs: a certificate authority (Intune Cloud PKI - note the kiosk design deliberately has none today) plus RADIUS the Meraki APs can reach (cloud RADIUS/RadSec; there is no AD DS/NPS in this architecture).
- Recommend the DDD records DR-019 with both options and "Open - network lead (Chris Katigbak) to determine", and note that EAP-TLS would slightly enlarge the device build (SCEP profile) but nothing else in the design depends on the choice.

**Confirms:** Chris Katigbak; APM Cyber Security for the certificate infrastructure if (b).

## Thread 4 - Zscaler local breakout vs site IPSEC via Azure Palos (Chris, Phil, David) - comments 70-74

**Ask.** Chris: hairpinning through the Azure VMX/Palo may bottleneck; local breakout may be better. Phil: **Client Connector on the kiosk tunnelling direct to Zscaler cloud is the standard roaming model and is acceptable** given local accounts + the CA block policy. David: **273 sites**.

**Proposed fix - flip the DR-013 working assumption.**
- The design's working assumption was location-based forwarding over the site IPSEC tunnel. The review points the other way: **Client Connector machine tunnel, direct to Zscaler cloud, local internet breakout** - endorsed by both the network and security leads in the thread.
- This also resolves thread 2 (machine-tunnel enrolment gives the per-device identity) and removes the per-site IPSEC tunnel dependency at 273 sites.
- Consequential edits when confirmed: 5.3.3 traffic flow and "Requirements" bullets (IPSEC tunnel no longer the primary path), 5.3.1.3 Meraki/Palo rules (allow Client Connector direct egress), INT-05 in the interface catalogue, Figures 5 and 7 notes, DR-013 resolution, and the 5.3.4 applicability table (forwarding profile moves from "tunnel" to "machine tunnel").
- Record **273 sites** in 5.3.1.1 alongside the 540 devices (the ~750 location groups cover all APM sites; this fleet deploys to 273 of them).
- Keep the fallback: site IPSEC remains the documented fallback path if client-tunnel performance or capability disappoints on the pilot.

**Confirms:** DR-013 workshop (Phil + Chris + Stratus) - then V1.2 applies the flip in one change.

## Suggested handling

Threads 1 and the 5.1.2 sentence from thread 2 are safe to apply now (V1.2 draft). Threads 3 and 4 are decisions that belong to Chris and Phil - the fix is to record them as DR-019 and a re-based DR-013 so the document carries the question honestly instead of a stale assumption.
