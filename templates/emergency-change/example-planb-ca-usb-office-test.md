# Emergency Change - Plan B kiosk Conditional Access, USB to Office for the web test

Worked example. Rewritten from the original record to the template's rules: dot points, one action per line, every object named, every risk bounded.

---

## Change summary

| Field | Value |
|---|---|
| Change number | *ServiceNow reference* |
| Short description | Enforce the eight Plan B kiosk Conditional Access policies and exclude the Plan B test group from two MFA policies, to prove a USB-held document opens and saves in Office for the web without an MFA prompt |
| Change type | Emergency |
| Risk / impact | Low. One test account, one controlled test device |
| Requester | Digital Transformation and Architecture |
| Implementer | Digital Delivery |
| Approver | APM Cyber Security |
| Planned start | 21/07/2026 14:00 |
| Planned end | 21/07/2026 17:00 |
| Rollback deadline | 21/07/2026 17:00, whether or not testing completes |

## Why this is an emergency change

- The Plan B business requirement cannot be designed further until it is known whether a USB-held document opens in Office for the web without an MFA prompt.
- The test needs Conditional Access enforcement, which cannot be simulated in report-only mode.

## Description

**Set to enforced, scoped to `SG-APM-Kiosk-PlanB-Users`:**

| # | Policy | Control layer | What it does |
|---|---|---|---|
| 1 | CA-APM-KioskPB-WebOnlyOffice | Application | Denies all cloud apps except Office for the web and SharePoint Online / OneDrive |
| 2 | CA-APM-KioskPB-RequireCompliantDevice | Device trust | Requires an Entra-joined, Intune-compliant kiosk device; session controls limit token lifetime |
| 3 | CA-APM-KioskPB-BlockNonKioskDevices | Device identity | Denies any device without the Plan B kiosk attribute, including unregistered devices |
| 4 | CA-APM-KioskPB-BlockNonWindows | Platform | Denies Android, iOS, macOS and Linux |
| 5 | CA-APM-KioskPB-BlockLegacyAuth | Protocol | Denies legacy authentication |
| 6 | CA-APM-KioskPB-BlockAuthFlows | Authentication flow | Denies device code flow and authentication transfer |
| 7 | CA-APM-KioskPB-BlockRiskySignIn | Sign-in risk | Blocks medium risk and above |

**Unchanged, relied on as the tenant baseline:** CA-104, which blocks high-risk sign-ins tenant-wide. No action required.

**Temporarily excluded, `SG-APM-Kiosk-PlanB-Users` added to the exclusion list:**

| # | Policy | Reason |
|---|---|---|
| 8 | AllUsers_AllAccess_MFAorDeviceRequired | Enforces MFA on the test account and would mask the result |
| 9 | AllUsers_Office365_DeviceRequired | As above, for Office 365 |

## Justification

- Proves whether a participant can edit a USB-held resume in Office for the web with no MFA prompt.
- Removes the last unknown blocking the Plan B design decision.

## Implementation plan

1. Set policies 1 to 7 from report-only to enforced, scope `SG-APM-Kiosk-PlanB-Users`.
2. Add `SG-APM-Kiosk-PlanB-Users` to the **exclusion** list of `AllUsers_AllAccess_MFAorDeviceRequired`.
3. Add `SG-APM-Kiosk-PlanB-Users` to the **exclusion** list of `AllUsers_Office365_DeviceRequired`.
4. Wait 30 minutes for Entra policy propagation.
5. Confirm the test device reports Compliant in Intune before testing.
6. Execute the test plan from the controlled test device only.
7. Capture a screenshot at every numbered test.
8. Remove `SG-APM-Kiosk-PlanB-Users` from the exclusion list of both policies in step 2 and step 3.
9. Return policies 1 to 7 to their pre-change state per the backout plan.

## Verification

- Entra sign-in log shows the test account evaluated by policies 1 to 7, result Success.
- Entra sign-in log shows `AllUsers_AllAccess_MFAorDeviceRequired` and `AllUsers_Office365_DeviceRequired` as Not Applied for the test account.
- No other account appears against the Plan B policies in the sign-in log for the change window.

## Test plan

| # | Test | Expected result | Actual | Evidence |
|---|---|---|---|---|
| 1 | Sign in to Microsoft 365 from the test device as the Plan B account | Signs in. No MFA prompt | | Screenshot |
| 2 | Open a `.docx` from USB in Word for the web | Opens and renders | | Screenshot |
| 3 | Edit and save that document back to USB | Saves. Reopens with the edit intact | | Screenshot |
| 4 | Repeat tests 2 and 3 with `.xlsx` in Excel for the web | Same result | | Screenshot |
| 5 | Repeat tests 2 and 3 with `.pptx` in PowerPoint for the web | Same result | | Screenshot |
| 6 | Browse to a corporate SharePoint site as the Plan B account | Access denied due to organisational policies | | Screenshot |
| 7 | Attempt sign-in from a non-Windows device | Blocked by CA-APM-KioskPB-BlockNonWindows | | Sign-in log |
| 8 | Attempt sign-in from a device without the Plan B kiosk attribute | Blocked by CA-APM-KioskPB-BlockNonKioskDevices | | Sign-in log |

## Out of scope

The following cannot be proven by this change and must not be recorded as passed:

- Teams search, chat and call restriction between kiosk and corporate users.
- Outlook global address list visibility.
- Mail flow rejection between kiosk and corporate users.
- Search and Copilot suppression of corporate content.
- SharePoint site inheritance for sites created after the test.

All five depend on information barriers or mail flow rules that are not part of this change. Test them when those controls are in place.

## Operational risks

- Business testing may be delayed by policy propagation. Bound: 30-minute wait built into step 4, and a fixed rollback deadline.
- Cached browser sign-in tokens may mask the true result. Bound: test from a fresh private browser session on the controlled device.
- Evidence may be incomplete if screenshots are missed. Bound: one screenshot per numbered test, checked before rollback begins.

## Technical risks

- Overlapping Conditional Access policies may produce an unexpected allow or block. Bound: the Entra sign-in log names every policy applied, so any unexpected outcome is attributable before rollback.
- The exclusion may not apply immediately. Bound: step 4 wait, then the verification step confirms Not Applied before testing starts.
- The test device compliance state may be stale and block the device incorrectly. Bound: step 5 confirms Compliant before testing.
- Office for the web may behave differently across Word, Excel and PowerPoint. Bound: tests 2 to 5 cover all three file types separately.

## Security risks

- One account carries an MFA exclusion. Bound: `SG-APM-Kiosk-PlanB-Users` contains one test account, credentials held only by the implementer, exclusion removed at step 8.
- Testing from an uncontrolled device would widen exposure. Bound: the controlled test device is the only device carrying the Plan B kiosk attribute, and CA-APM-KioskPB-BlockNonKioskDevices denies the rest.
- Legacy authentication, device code flow, authentication transfer, non-Windows platforms and risky sign-ins stay blocked throughout. Bound: policies 4 to 7 remain enforced for the whole window.
- SharePoint and OneDrive scoping is not proven here. Bound: recorded in Out of scope; revalidate once information barriers are in place.

## Backout plan

**Trigger:** any test result that cannot be attributed from the sign-in log, any unexpected allow for the test account, or the rollback deadline of 17:00, whichever comes first. Called by the implementer.
**Time to restore:** 30 minutes, propagation included.

1. Set policies 1 to 7 back to report-only or disabled, matching the pre-change state recorded before step 1.
2. Remove `SG-APM-Kiosk-PlanB-Users` from the exclusion list of `AllUsers_AllAccess_MFAorDeviceRequired`.
3. Remove `SG-APM-Kiosk-PlanB-Users` from the exclusion list of `AllUsers_Office365_DeviceRequired`.
4. Wait 30 minutes.
5. Sign in as the test account from the controlled device and confirm the MFA prompt returns.
6. Confirm the Entra sign-in log shows both MFA policies applied to the test account again.
7. Record the rollback reason, time, validation outcome and evidence in the change record.

## Evidence and close-out

- Screenshots captured at: *SharePoint change evidence folder*
- Entra sign-in log and Conditional Access results exported for the change window
- Change record updated with outcome, rollback time and validation result
- Follow-up: retest the Out of scope items once information barriers are in place

---

## Notes carried forward

Three things this record exposed, worth tracking beyond the change itself.

- **The original test plan was broader than the change.** Six of its nine tests covered Teams, the address list, mail flow and Copilot, none of which this change enables. A test that cannot pass or fail from the change under way is a false record of coverage. They are now in Out of scope.
- **Step 7 of the original plan said "remove user group from the CA policies".** It meant remove the group from the *exclusion list*. Read literally it would have removed scoping from the Plan B policies instead. Ambiguous rollback wording is how a change gets reverted wrongly under pressure.
- **The exclusion outliving the group is a known risk.** `SG-APM-Kiosk-PlanB-Users` is retired under the Kiosk Decommissioning change request, which carries risk CR-05 for exactly this: an exclusion that outlives the group it excluded silently weakens the policy. Removing the exclusion belongs in the same change record as deleting the group.
