# Participant Device - Session Account and Zscaler Enforcement Model (extract for APM Cyber Security)

Extract from Participant Kiosk DDD V1.2 for review against the Zscaler fix.

## Session account model (no user identity)

| Aspect | Design |
|---|---|
| Account creation | Created on the device by the signed remediation CDG-W11-REM-Kiosk Session Account-P-1.0, named Kiosk-[SERIAL] from the BIOS serial. No account is created in any directory |
| Account scope | Local to the device only. No meaning on any other device or service |
| Credential | 32 random characters generated on the device, held only in the Winlogon LSA secret. Not stored in Intune, Key Vault or any document, never displayed |
| Credential rotation | Regenerated whenever the remediation repairs the account, and on demand fleet-wide. No schedule or key material held by APM |
| Sign-in | Automatic at every boot, no credential prompt |
| Privilege | Standard user, not a member of Administrators |

## Decision register entries relevant to Zscaler

| ID | Decision | Status |
|---|---|---|
| DR-007 | Identity model for the fleet: no user identity, participant session runs as a local account created and managed by Assigned Access | Approved - APM Cyber Security, APM Digital lead |
| DR-011 | Session credential: no password known to any person, session account Kiosk-[SERIAL] created on the device by a signed remediation | Approved with amendment - APM Cyber Security confirmation required |
| DR-013 | Zscaler enforcement model without user identity: enforcement is device and location based. There are no users on this fleet | Model approved - APM Cyber Security; mechanism open |

## Naming convention (for Zscaler device/account matching)

Kiosk-[SERIAL], for example Kiosk-63TFTJ4 - one account per device, derived from the BIOS serial, capped at the 20-character account-name limit. Unique per device (resolves max-devices-per-user constraints raised against the prior naming model).

## Open item

DR-013 mechanism remains open pending the Zscaler provisioning workshop with a validated device. Zscaler tenant configuration is otherwise reproduced as supplied in section 5.3.4, with the identity plane (SAML, SCIM, IdP objects) removed rather than revalidated, since enforcement is device and location based throughout.
