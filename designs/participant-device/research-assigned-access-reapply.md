# Does repeated application of the Assigned Access configuration cause the fault?

Research note, 24 August 2026. Written to test a hypothesis raised while the Edge Start pin fault was open: the configuration has been applied many times on this device, and that may itself be the problem.

## DISPROVEN, 25 August 2026

**Repeated application is not the cause of the Edge pin fault.** Tested on a clean wipe with the configuration applied exactly once: the Edge pin appeared on first sign-in and was gone after the first restart. No accumulation had occurred, so accumulation cannot be the mechanism.

Two things in this note survive the disproof and are worth keeping:

- **The RestrictRun duplication is real** (20 entries for 17 applications, three appended). It is a defect in its own right, it will grow, and it is unrelated to the pin.
- **The recommendation in item 4 stands on its own merits.** The remediation re-applies daily a configuration that only takes effect at the next sign-in. That buys nothing and regenerates three pieces of derived state each time, whatever is dropping the pin.

The remaining candidates are in `research-edge-start-pin.md`: the Edge background updater re-registering the package, and the session purge making every boot a first sign-in. The clean-wipe result points hard at the second, because the purge is the only thing that differs between the first sign-in (worked) and every boot after it (failed).

The original analysis follows, unchanged.

---

**Short answer: plausibly yes, and there is direct measured evidence on the device. Not because writing the CSP is harmful in itself, but because Windows appends to at least one of its derived lists rather than rebuilding it, and nothing has ever cleared the accumulated state.**

---

## 1. The evidence already collected

`Test-KioskRestrictRun.ps1` read the kiosk hive and found **20 entries in RestrictRun for 17 allowed applications**, with three duplicates:

| Entry | Name | Duplicate of |
|---|---|---|
| `AssignedAccess_18` | `Narrator.exe` | `AssignedAccess_5` |
| `AssignedAccess_19` | `Magnify.exe` | `AssignedAccess_8` |
| `AssignedAccess_20` | `msedge_proxy.exe` | `AssignedAccess_3` |

Windows names these entries itself. Entries 19 and 20 sit after 18, so they were **appended on a later apply, not written as part of a rebuild.** Whatever logic populates RestrictRun added three names it already held.

That is measured, not inferred, and it establishes the general point: at least one piece of derived state accumulates across applies. If RestrictRun accumulates, the question becomes what else does.

## 2. Applying the configuration more often achieves nothing

The CSP reference is explicit about when a write takes effect: <cite index="73-2">"Once the CSP is executed, the next user login that is associated with the Assigned Access profile puts the device into the kiosk mode specified in the CSP configuration"</cite>.

So a write between logins changes nothing a participant sees. Every apply beyond the one that precedes a sign-in is churn: it regenerates the AppLocker rules, rewrites RestrictRun, and re-stamps the Start layout, for no gain.

The node itself is a normal read-write node: <cite index="73-13,73-14,73-15">"This node supports Add, Delete, Replace and Get methods. When there's no configuration, 'Get' and 'Delete' methods fail. When there's already a configuration for kiosk mode app, 'Add' method fails"</cite>. The remediation handles that correctly, creating the instance when absent and setting it when present. The problem is not the method, it is the frequency and the absence of any clean-up.

## 3. Microsoft's own guidance for an inconsistent kiosk is a full reset

This is the closest thing to a documented answer for the symptom, and it is not "re-apply harder".

<cite index="69-17,69-18">"When configuration state becomes inconsistent, the most reliable fix is a full reset of Assigned Access. This clears stored configuration and forces Windows to rebuild the kiosk environment from scratch"</cite>. And, on the same theme: <cite index="70-9">"If you have made several changes and kiosk mode still acts inconsistently, rebuild the setup cleanly"</cite>.

"Several changes" and "acts inconsistently" describe this device exactly. Since the fault was opened, the applied configuration has changed the path style, added `soffice.bin`, added three dependency files, added the Edge AUMID, and changed the Edge pin form twice. Each of those was a different document written over the last.

**Removal does not fully undo it either.** Microsoft states that deleting an Assigned Access configuration <cite index="40-14,40-15">"removes the policy settings associated with the users, but it can't revert all the changes. For example, in a multi-app kiosk scenario the Start menu configuration is maintained"</cite>. The Start menu configuration is precisely what is misbehaving, and it is precisely the part documented as surviving removal.

Also worth noting for the fleet, not just this device: <cite index="69-15,69-16">"check the AssignedAccess CSP and kiosk profiles for duplicate or conflicting assignments. Multiple kiosk profiles targeting the same device can prevent successful kiosk initialization"</cite>. Only the remediation writes this node in this design, but the retired `CDG-W11-CFG-Assigned Access XML-P-1.0` profile must be confirmed absent from the tenant, not merely unbuilt.

## 4. Every measurement so far has been taken with the log switched off

`Test-KioskRestrictRun.ps1` reported both Assigned Access logs as empty. That is not a device fault, it is the default: <cite index="71-4">"Additional logs about configuration and runtime issues can be obtained by enabling the Applications and Services Logs\Microsoft\Windows\AssignedAccess\Operational channel, which is disabled by default"</cite>, and independently <cite index="70-6,70-7">"The AssignedAccess Operational log may be disabled by default. Enable it, reproduce the problem, then check the newest events"</cite>.

**And the timing matters more than it looks.** <cite index="71-11,71-12,71-13">"We recommend that you enable logging for kiosk issues. For some failures, events are only captured once. If you enable logging after an issue occurs with your kiosk, the logs may not capture those one-time events"</cite>.

So the pin has been failing intermittently for several days with the only channel that would name the cause switched off, and a one-time event from the first bad boot is already gone. **Enabling it is a prerequisite for the next test, not an optional extra.**

## 5. What this does and does not explain

**It fits the symptom well.** Accumulated state explains why the fault is intermittent rather than constant, why it survived a wipe and reinstall (the reinstall was followed by the same sequence of repeated applies), and why a correct-looking configuration behaves differently from one boot to the next.

**It is not proven.** No source states that repeatedly writing this CSP corrupts the Start layout. The RestrictRun duplication is proof of accumulation, not proof that accumulation is what drops the pin. The honest position is that a clean reset is the cheapest way to find out, and Microsoft recommends it for exactly this presentation.

**Two other candidates from `research-edge-start-pin.md` remain open** and are not addressed by a reset: the Edge background updater re-registering the package on the boots where an update lands, and the session purge making every boot a first sign-in.

---

## What to do, in order

1. **Enable the AssignedAccess Operational log before anything else.** Every measurement taken so far has been blind, and some failures are logged once only.
   ```
   wevtutil sl Microsoft-Windows-AssignedAccess/Operational /e:true
   wevtutil sl Microsoft-Windows-AssignedAccess/Admin /e:true
   ```
2. **Full clean reset, in this order.** Delete the configuration from the CSP node, confirm `RestrictRun` and its subkey are gone from the kiosk hive, delete the kiosk profile through `Win32_UserProfile`, restart, then apply the configuration **once** and restart again. Do not apply it repeatedly to "make sure".
3. **Reboot five or six times and count.** The fault is intermittent, so the test is a run of clean boots, not one. Note for each boot whether an Edge update was pending.
4. **Make the remediation stop rewriting a configuration that has not changed.** Detection currently confirms the applied configuration names the right account. It does not compare the whole document, so any detection failure for an unrelated reason causes a full CSP rewrite. Comparing the applied document against the intended one turns the remediation into something that writes only on genuine drift.
5. **Confirm no other object writes this node.** `CDG-W11-CFG-Assigned Access XML-P-1.0` is retired; verify it does not exist in the tenant rather than assuming it was never created.
6. **Only after a clean reset holds** should the Edge updater and the profile purge be investigated, so that one variable moves at a time.

## Consequence for the design, whatever the outcome

The remediation is scheduled daily and re-applies a configuration that only takes effect at the next sign-in. Even if repeated application turns out not to be the cause here, **writing this node on a schedule buys nothing and regenerates three separate pieces of derived state each time.** Change it to write only when the applied configuration differs from the intended one. That is a smaller, safer object regardless of what is dropping the Edge pin.
