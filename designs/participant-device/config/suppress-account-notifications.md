# Suppressing the "Back up your PC to Microsoft account" prompt

Observed on the pilot device in the Start user tile: a red dot on the account icon, and opening it shows a yellow banner offering to back the PC up to a Microsoft account, with a Sign in link. On a participant kiosk this invites an action that cannot succeed and should not be offered.

Three layers, and the order matters because the obvious one does not work on this fleet.

---

## 1. The documented fix does not reliably apply here

Microsoft introduced a policy specifically for this behaviour:

| Field | Value |
|---|---|
| OMA-URI | `./User/Vendor/MSFT/Policy/Config/Notifications/DisableAccountNotifications` |
| Data type | Integer |
| Value | `1` |

It is ADMX-backed (`AccountNotifications.admx`) and not in the Settings catalog, so it needs a Custom profile.

**It is user-scoped only.** The Participant Kiosk session account is a local account that never authenticates to Entra ID, so there is no user object for a user-scoped policy to target. Published guidance on this exact scenario states the limitation plainly: the policy does not always apply to all users, and it works only where Entra accounts also sign in to the device and apply the configuration.

Deploy it anyway, because it costs nothing and covers a support engineer signing in with an Entra account. Do not rely on it for the participant session.

## 2. What actually fixes it: block Microsoft accounts at the device

**Settings catalog > Local Policies Security Options > Accounts Block Microsoft Accounts**, set to **Users can't add or log on with Microsoft accounts**.

Device-scoped, so the local-account problem does not arise. The prompt has nothing to offer once Microsoft accounts cannot be added, so the banner does not appear.

This is consistent with the design rather than a new position. The Participant Device design already blocks Microsoft 365 access outright at three layers, and the session account holds no participant identity. A device that cannot accept a Microsoft account is what the design already describes; this makes Windows behave that way.

Also set, as a second machine-wide control:

| Field | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Notifications/DisableAccountNotifications` |
| Data type | Integer |
| Value | `1` |

If the device-scoped node is rejected on the tenant's Intune version, the equivalent registry value is `HKLM\SOFTWARE\Policies\Microsoft\Windows\Explorer\HideAccountNotifications` set to `1`, which the session cleanup installer now writes.

## 3. The per-user setting, written by something that runs as the participant

The per-user value behind the Settings toggle is:

```
HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced
Start_AccountNotifications = 0   (REG_DWORD)
```

A user-scoped Intune policy cannot reach the local kiosk account, but `Clear-KioskUserLogon.bat` already runs **in the participant's own context** as a Group Policy user logon script, before the desktop appears. It writes this value on every logon, which closes the gap Intune cannot reach, and it re-writes it after any profile reset.

That is the reason this design has a per-user logon script at all, and it is worth remembering as a pattern: anything that has to reach a local account's own hive belongs there, not in an Intune user-scoped policy.

## 4. New and changed objects

| Object | Type | Purpose |
|---|---|---|
| `CDG-W11-CFG-Block Microsoft Accounts-P-1.0` | Settings catalog, Local Policies Security Options | Accounts Block Microsoft Accounts = Users can't add or log on with Microsoft accounts. The effective control |
| `CDG-W11-CFG-Account Notifications-P-1.0` | Custom, two OMA-URI rows | Device and user `Notifications/DisableAccountNotifications` = 1 |
| `CDG-W11-REM-Session Cleanup-P-1.0` | Existing Win32 app, version 1.3 | Installer writes `HideAccountNotifications`; user logon script writes `Start_AccountNotifications` |

## 5. Verification

Sign in as the kiosk account, open Start, click the user tile. No red dot and no banner.

To confirm each layer landed:

```
reg query "HKLM\SOFTWARE\Policies\Microsoft\Windows\Explorer" /v HideAccountNotifications
reg query "HKLM\SOFTWARE\Microsoft\PolicyManager\current\device\LocalPoliciesSecurityOptions" /v Accounts_BlockMicrosoftAccounts
```

And from inside the participant session:

```
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v Start_AccountNotifications
```

Explorer caches the account tile state, so a restart is the reliable test rather than a sign-out.

## 6. Related, and worth doing at the same time

The same Start tile carries other consumer prompts. The design already sets Do Not Show Feedback Notifications and disables consumer experiences; the account notification survived both, which is why it needed its own control. If further prompts appear in the tile, the account settings visibility policies are the next lever, and they are documented alongside the Start layout settings this design already uses.
