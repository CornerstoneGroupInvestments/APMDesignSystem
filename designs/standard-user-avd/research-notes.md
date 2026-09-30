# Research notes - Standard User SOE on AVD

Facts and verification tasks behind the design. Not part of the shipped document. Current with the design; the version, status and built document are in `designs/README.md`.

## Identity: device join type and user identity type are two different things

Stated by Shaun Struik, 23 Aug 2026.

| Thing | Today | In this design |
|---|---|---|
| Thick client devices | Hybrid joined to on-premises Active Directory, federated by ADFS | Unchanged. Remain hybrid joined |
| AVD session hosts | Do not exist | **Entra ID joined.** No hybrid join, no domain membership |
| User accounts | Hybrid identities: on-premises AD accounts synchronised to Entra ID | Unchanged by this design |
| ADFS | In use | Being decommissioned. No design dependency is taken on it |

Join type is one of four named divergences between the two channels. The others are SOE update by golden image replacement rather than in-place patching, the five varied controls in section 7, and the multi-session application requirements in 5.4. The design states join type as DR-003 and lists all four in section 2.

## Why the G-03 question is narrower than it first looks

G-03 turns on the **user identity type**, not the session host join type, and the two were being conflated.

- Microsoft Entra Kerberos for Azure Files is built for **hybrid identities** - an on-premises AD account synchronised to Entra ID. That is what APM staff accounts are.
- An **Entra ID joined session host** authenticating a **hybrid identity** user to an Azure Files share with Entra Kerberos is the supported scenario. No domain-joined session host is required.
- The path only breaks if staff accounts themselves become cloud only. Device join type moving to Entra ID does not change the authentication story.

**Carried into the design at V2.1.** A-09 records that staff accounts remain hybrid identities. DR-004 is no longer conditional on G-03. G-03 is now the two facts that are genuinely unproven: that accounts stay hybrid for the life of the design, and that the container mounts on an Entra ID joined host for a hybrid identity user.

**Verification task, still open.** Prove the mount on a fully hardened host under the production Conditional Access set, with `CloudKerberosTicketRetrievalEnabled` applied. That is T-15 in Appendix B, and it cannot be substituted by T-03 on a clean host.

**If staff accounts are later moved to cloud only,** re-open G-03. DR-004 records Azure NetApp Files as the alternative, and FSLogix Cloud Cache as rejected for a single-region design.

## Still open

- **G-02** no /23 allocated for AVD. Blocks every network object and is phase 1 of the implementation sequence
- **G-08** application deployment definitions not held. Six Intune exports needed from Digital Operations: Microsoft 365 Apps, Teams, OneDrive, Edge configuration, desktop and lock screen branding, and the line-of-business application list
- **G-01** mapped network drive back end unknown. An on-premises file server back end would put a domain dependency back onto an Entra ID joined host, which is the one option that fights the join model (5.4.8, R-09). Worth stating when the decision is taken
- **G-06** session host sizing not established. Fixed from pilot measurement, not a vendor estimate
