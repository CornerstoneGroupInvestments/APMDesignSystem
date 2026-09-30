# Emergency change records

Template and worked example for APM emergency changes. Use for any change raised outside the normal window: a Conditional Access enforcement test, a policy exclusion, a break-fix, a time-boxed configuration change made to unblock a design decision.

| File | What it is |
|---|---|
| `EMERGENCY-CHANGE-TEMPLATE.md` | The blank template with the writing rules. Copy, fill, delete the guidance lines, paste section by section into the ServiceNow change record |
| `example-planb-ca-usb-office-test.md` | Worked example: enforcing the eight Plan B kiosk Conditional Access policies to test USB to Office for the web, 21 Jul 2026. Includes the three defects found in the original record |

## What the template adds beyond APM's own form

APM's emergency change form carries Short description, Description, Justification, Implementation plan, Operational risks, Technical risks, Security risks, Backout plan, Test plan and planned dates. The template keeps all of those and adds five fields whose absence has already caused problems:

- **Why this is an emergency change.** What is blocked, and why it cannot wait. A change that could have waited is a normal change.
- **Rollback deadline.** The time the change is reverted whether or not testing finished. Without it a "temporary" exclusion becomes permanent.
- **Rollback trigger and who calls it.** A backout plan with no trigger is never invoked in time.
- **Verification, separate from the test plan.** What the implementer confirms before handing over for business testing. Mixing the two hides a failed implementation behind a failed test.
- **Out of scope.** Anything a reader might expect the change to prove but which it does not, and where it is proven instead.

## The writing rules

- One action per line. Imperative verb first: Enable, Add, Remove, Confirm, Capture, Validate.
- Name the exact object every time: the policy name, the group name, the device, the account. Never "the policies" or "the group".
- No narrative inside an action step. Reasons belong in Justification.
- **Every risk line states the risk and what bounds it.** A risk with no bound is an open issue, not a risk.
- Every test has a pass criterion that is objectively true or false.
- **The test plan tests this change only.** Anything it cannot prove goes in Out of scope.
- Australian English, no em dashes, roles never personal names.

## Three failure modes this template exists to prevent

Each was found in a real record.

1. **Test plan broader than the change.** Six of nine tests in the source record covered Teams, the address list, mail flow and Copilot, none of which the change enabled. A test that cannot pass or fail from the change under way is a false record of coverage.
2. **Ambiguous rollback wording.** "Remove user group from the CA policies" meant remove it from the *exclusion list*. Read literally it removes scoping from the new policies instead. Under pressure, the literal reading wins.
3. **An exclusion outliving the group it excluded.** A temporary exclusion added for a test must be removed in the same change record, and again when the group is deleted. Tracked as risk CR-05 in the Kiosk Decommissioning change request.

## Before submitting

- Every object named in the change resolves against `policies/APM_CA_Policy_Analysis.html` (for Conditional Access) or the relevant register. An invented policy or group name is the worst defect an emergency change can carry.
- Check the Conditional Access naming convention: `CA-nnn - audience - apps - condition - action`. The Intune Naming Schema does not govern the Conditional Access plane.
- Confirm the pre-change state of every object is recorded before step 1. The backout plan restores to it.
