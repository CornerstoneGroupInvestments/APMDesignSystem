# 07 - App Control for Business (WDAC)

Two files, and neither is uploaded as-is. They produce the three policy artefacts on a reference device.

| File | What it is |
|---|---|
| `AppControl-ParticipantKiosk-Base.xml` | The hand-authored half of the policy: rule options, deny rules, policy identity. No allow rules |
| `Build-AppControlPolicy.ps1` | Runs Appendix A.8 end to end on the reference device and emits the enforced, audit and rollback policies plus their `.cip` binaries |

## Why the policy is not shipped complete

Publisher allow rules are keyed on the signing certificate of each binary as installed, so they can only be produced by scanning a device that already carries the fleet application set at the exact versions the fleet will run. That scan is step 2 of the build script.

Everything that does **not** depend on the scan is in the base XML, because it is the part most often built wrong: the rule option set, and the order the options are applied in.

## Run it

On a reference device that has completed Phases 5 and 6 (A.8.1), elevated, 64-bit PowerShell:

```powershell
.\Build-AppControlPolicy.ps1 `
    -BasePolicyPath   .\AppControl-ParticipantKiosk-Base.xml `
    -SigningCertPath  C:\APM\PK\apm-codesigning.cer `
    -BlockRulesPath   C:\APM\PK\MicrosoftRecommendedBlockRules.xml
```

Output in `C:\APM\PK\AppControl\`:

| File | Deploys as |
|---|---|
| `CDG-W11-SEC-AppControl-Audit-T-1.0.xml` | Unsigned XML, Endpoint security > App Control for Business, pilot ring |
| `{PolicyGUID}.cip` | Signed binary, custom OMA-URI `./Vendor/MSFT/ApplicationControl/Policies/{PolicyGUID}/Policy`, Data type Base64 (file), production |
| `CDG-W11-SEC-AppControl-Rollback-1.0.0.1.cip` | Signed binary, held in escrow with the certificate |
| `signer-review-A.8.4.txt` | The signer list to check against the six publishers in TCD 12.1.3 |

Signing the two `.cip` files with signtool is the one manual step; the script prints the exact command with the paths filled in.

## Three things the script will not let you get wrong

**Option 6 is removed last.** `Enabled:Unsigned System Integrity Policy` comes out only after the code-signing certificate is in `UpdatePolicySigners`, and the script throws if that element is empty. Removing it earlier produces a policy that no future policy can replace, recoverable only by reimaging (DR-017).

**Deleting option 11 is what turns script enforcement ON.** It reads backwards. `Disabled:Script Enforcement` being absent is the enforcement, and it is the first of the two tightenings in TCD 12.1.3.

**The option set is verified before you can sign anything.** Step 10 checks all three policies against the expected present/absent sets and throws rather than letting a wrong policy reach signtool.

## What is deliberately not denied, and why

A WDAC deny rule applies in every context, including SYSTEM. These are **not** in the deny list:

| Binary | Depends on it |
|---|---|
| `powershell.exe` | The session-account remediation, the idle watchdog, both purge passes, every Win32 install command |
| `cmd.exe` | Win32 application install commands and vendor wrapper scripts |
| `msiexec.exe` | The LibreOffice MSI and every Patch My PC update |
| `reg.exe` | Vendor installers |

Participant access to them is prevented by Assigned Access rather than by App Control: there is no shell route to launch them. UMCI enforcement additionally places PowerShell in Constrained Language Mode on every device the enforced policy reaches, and script enforcement requires every script to carry a valid signature. Adding any of these four to the deny list will break the build; T-03 is satisfied without them.

## Before signing, do the A.8.4 review

The script reports signers outside the six publishers and counts the hash fallback rules the scan produced. Both need a human decision:

- **Signers outside the six** (Microsoft, The Document Foundation, Zscaler Inc., TeamViewer, Dell, Patch My PC LLC) are removed from the XML, then re-run with `-ExistingScanPath` to skip the scan.
- **Hash fallback rules** each represent an unsigned binary found on the reference device that the policy would trust by hash. Review every one rather than accepting them silently.
- **TeamViewer stays at the version-bounded rule the scan generated.** Widening it turns a TeamViewer upgrade into a background change instead of a controlled policy change (TCD 12.1.3).
