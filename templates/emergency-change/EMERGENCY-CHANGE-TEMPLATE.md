# Emergency Change - template

Copy this file, fill every field, delete the guidance lines in italics. Paste section by section into the ServiceNow emergency change record.

**The document contains facts, not commentary.** No sentence explaining why a value changed, no comparison of options, no narration of a prior draft. If the record is revised, add one row to Document Control below with a brief factual line - never a paragraph of reasoning in the body. That reasoning happens in chat when the change is being decided, not in the record.

## Document control

| Version | Date | Author | What changed |
|---|---|---|---|
| V1.0 | | | Initial record |

**Writing rules, non-negotiable.**

- One action per line. Imperative verb first: Enable, Add, Remove, Confirm, Capture, Validate.
- Name the exact object every time: the policy name, the group name, the device, the account. Never "the policies" or "the group".
- No narrative, no justification inside an action step. Reasons belong in Justification.
- Every risk line states the risk **and** what bounds it. A risk with no bound is an open issue, not a risk.
- Every test has a pass criterion that is objectively true or false.
- The test plan tests **this change only**. Anything it cannot prove today goes in Out of scope.
- Australian English. No em dashes. Roles, never personal names.

---

## Change summary

| Field | Value |
|---|---|
| Change number | *ServiceNow reference* |
| Short description | *One line: what is enabled or altered, and what it proves* |
| Change type | Emergency |
| Risk / impact | *Low / Medium / High, and the population affected* |
| Requester | *Role* |
| Implementer | *Role* |
| Approver | *Role holding emergency change authority* |
| Planned start | *DD/MM/YYYY HH:MM* |
| Planned end | *DD/MM/YYYY HH:MM* |
| Rollback deadline | *Time by which the change is reverted whether or not testing completes* |

## Why this is an emergency change

*One or two lines. State what is blocked and why it cannot wait for the normal change window. An emergency change that could have waited is a normal change.*

## Description

*What changes, as a table of objects. One row per object, with its current state and its target state.*

| # | Object | Type | Current state | Target state |
|---|---|---|---|---|
| 1 | | | | |

## Justification

- *Why the change is needed*
- *What decision or deliverable depends on the outcome*

## Implementation plan

*Numbered. One action per step. Include the wait states.*

1.
2.
3.

## Verification

*What the implementer checks before declaring the change in place, separate from the business test plan.*

- 

## Test plan

| # | Test | Expected result | Actual | Evidence |
|---|---|---|---|---|
| 1 | | | | |

## Out of scope

*Anything a reader might expect this change to prove but which it does not. Say where it is proven instead.*

- 

## Operational risks

- *Risk. Bound: what limits it.*

## Technical risks

- *Risk. Bound: what limits it.*

## Security risks

- *Risk. Bound: what limits it.*

## Backout plan

**Trigger:** *the condition that starts a rollback, and who calls it*
**Time to restore:** *how long the rollback takes, including propagation*

1.
2.
3.

## Evidence and close-out

- Screenshots captured at: *location*
- Sign-in and Conditional Access logs exported: *yes / no, where*
- Change record updated with outcome, rollback time and validation result
- Follow-up actions raised: *reference*
