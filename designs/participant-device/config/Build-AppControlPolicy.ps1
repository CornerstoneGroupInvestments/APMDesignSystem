<#
  Build-AppControlPolicy.ps1
  APM Digital Workplace Transformation - Participant Kiosk (CDG)
  Implements Technical Configuration Document Appendix A.8 as one runnable sequence.

  Runs ONCE, on a reference device that has completed Phases 5 and 6 (A.8.1), in an elevated
  64-bit PowerShell session. Produces the three policy artefacts the build needs:

    CDG-W11-SEC-AppControl-Audit-T-1.0.xml      unsigned, audit mode  -> Endpoint security profile, pilot ring
    CDG-W11-SEC-AppControl-Enforced-P-1.0.xml   signed, enforced      -> custom OMA-URI, production
    CDG-W11-SEC-AppControl-Rollback-1.0.0.1.xml signed, audit mode    -> escrow with the certificate

  and the matching .cip binaries. Signing the .cip with signtool is the one manual step left
  (A.8.5); the script prints the exact command.

  Why the order of operations matters, and it is the part most often built wrong:
  Enabled:Unsigned System Integrity Policy (option 6) is removed LAST, after the code-signing
  certificate is in UpdatePolicySigners. Remove it earlier and the policy on a device can only
  be replaced by a signed policy that nothing has yet been able to produce - recoverable only
  by reimaging (DR-017).

  Must be signed with the APM code-signing certificate (SOE-02) before use: the fleet runs a
  signed-scripts-only execution policy.
#>

[CmdletBinding()]
param(
    # Working directory for the scan, the merged policy and the .cip output.
    [string]$WorkPath = 'C:\APM\PK\AppControl',

    # The hand-authored base: rule options, deny rules, policy identity.
    [Parameter(Mandatory)]
    [string]$BasePolicyPath,

    # APM code-signing certificate, public key (.cer). Goes into UpdatePolicySigners.
    [Parameter(Mandatory)]
    [string]$SigningCertPath,

    # Microsoft recommended block rules XML. Download from Microsoft Learn ("Microsoft
    # recommended block rules") and place alongside. Omit only with a recorded exception.
    [string]$BlockRulesPath,

    [string]$PolicyName = 'CDG-W11-SEC-AppControl Enforced-P-1.0',
    [string]$PolicyId   = 'CDG-W11-PK-1.0',
    [string]$Version    = '1.0.0.0',

    # Skip the scan and reuse an existing scan result (re-runs after an A.8.4 signer edit).
    [string]$ExistingScanPath
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Write-Step { param($n, $t) Write-Host ''; Write-Host "[$n] $t" -ForegroundColor Cyan }
function Write-Warn { param($t) Write-Host "    WARNING: $t" -ForegroundColor Yellow }
# Split-Path -LeafBase is PowerShell 6+. ConfigCI runs under Windows PowerShell 5.1.
function Get-BaseName { param($p) [System.IO.Path]::GetFileNameWithoutExtension($p) }

# --- Preconditions --------------------------------------------------------------------------
Write-Step 1 'Checking preconditions'

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
      ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Must run elevated.'
}
if ([IntPtr]::Size -ne 8) { throw 'Must run in a 64-bit PowerShell session. New-CIPolicy will miss binaries otherwise.' }
if (-not (Get-Module -ListAvailable -Name ConfigCI)) { throw 'ConfigCI module not available. Install RSAT or run on a Windows Enterprise device.' }
Import-Module ConfigCI -ErrorAction Stop

foreach ($p in @($BasePolicyPath, $SigningCertPath)) {
    if (-not (Test-Path -LiteralPath $p)) { throw "Not found: $p" }
}
if ($BlockRulesPath -and -not (Test-Path -LiteralPath $BlockRulesPath)) { throw "Not found: $BlockRulesPath" }
if (-not $BlockRulesPath) {
    Write-Warn 'No -BlockRulesPath given. The Microsoft recommended block rules will NOT be merged.'
    Write-Warn 'That leaves the known bypass binaries trusted by Inherit Default Policy. Record an exception if this is deliberate.'
}

New-Item -ItemType Directory -Path $WorkPath -Force | Out-Null
$scanPolicy     = Join-Path $WorkPath 'scan-referencedevice.xml'
$enforcedPolicy = Join-Path $WorkPath 'CDG-W11-SEC-AppControl-Enforced-P-1.0.xml'
$auditPolicy    = Join-Path $WorkPath 'CDG-W11-SEC-AppControl-Audit-T-1.0.xml'
$rollbackPolicy = Join-Path $WorkPath 'CDG-W11-SEC-AppControl-Rollback-1.0.0.1.xml'
$signerReport   = Join-Path $WorkPath 'signer-review-A.8.4.txt'

Write-Host "    Work path: $WorkPath"

# --- A.8.2 Scan the reference device --------------------------------------------------------
Write-Step 2 'Scanning the reference device (A.8.2)'

if ($ExistingScanPath) {
    if (-not (Test-Path -LiteralPath $ExistingScanPath)) { throw "Not found: $ExistingScanPath" }
    Copy-Item -LiteralPath $ExistingScanPath -Destination $scanPolicy -Force
    Write-Host "    Reusing scan: $ExistingScanPath"
} else {
    Write-Host '    This takes 10-40 minutes. Every binary present on this device may end up trusted -'
    Write-Host '    confirm nothing beyond the fleet application set is installed (A.8.1).'
    New-CIPolicy -Level Publisher -Fallback Hash -FilePath $scanPolicy -UserPEs `
        -ScanPath 'C:\Program Files' -ScanPath 'C:\Program Files (x86)' -ScanPath 'C:\Windows' `
        -OmitPaths 'C:\Windows\Temp', 'C:\Users' -MultiplePolicyFormat -Verbose
}

# --- Merge ----------------------------------------------------------------------------------
Write-Step 3 'Merging base policy, scan and block rules'

$merge = @($BasePolicyPath, $scanPolicy)
if ($BlockRulesPath) { $merge += $BlockRulesPath }
Merge-CIPolicy -PolicyPaths $merge -OutputFilePath $enforcedPolicy | Out-Null
Write-Host ("    Merged {0} files -> {1}" -f $merge.Count, (Split-Path $enforcedPolicy -Leaf))

# --- A.8.3 Identity and version -------------------------------------------------------------
Write-Step 4 'Setting policy identity and version (A.8.3)'

$idInfo = Set-CIPolicyIdInfo -FilePath $enforcedPolicy -PolicyName $PolicyName -PolicyId $PolicyId -ResetPolicyID
Set-CIPolicyVersion -FilePath $enforcedPolicy -Version $Version

$policyGuid = ([string]$idInfo).Trim()
if ($policyGuid -match '(\{[0-9A-Fa-f\-]{36}\})') { $policyGuid = $Matches[1] }
else { $policyGuid = ([xml](Get-Content -LiteralPath $enforcedPolicy)).SiPolicy.PolicyID }
Write-Host "    PolicyID: $policyGuid"

# --- A.8.3 Rule options ---------------------------------------------------------------------
Write-Step 5 'Applying the rule option set (A.8.3, TCD 12.1.3)'

# Present. Option 6 is set here and removed at step 8, after the certificate is in place.
foreach ($opt in 0, 5, 8, 15, 10, 16, 6) {
    Set-RuleOption -FilePath $enforcedPolicy -Option $opt
}
# Absent. Deleting 11 is what turns script enforcement ON - tightening one of two.
Set-RuleOption -FilePath $enforcedPolicy -Option 11 -Delete
Set-RuleOption -FilePath $enforcedPolicy -Option 3  -Delete

# --- A.8.4 Signer review --------------------------------------------------------------------
Write-Step 6 'Signer review (A.8.4)'

$xml     = [xml](Get-Content -LiteralPath $enforcedPolicy)
$signers = @($xml.SiPolicy.Signers.Signer)
$expected = 'Microsoft', 'Document Foundation', 'Zscaler', 'TeamViewer', 'Dell', 'Patch My PC'

$lines = @("Signer review - $PolicyName", "Generated $(Get-Date -Format 'yyyy-MM-dd HH:mm')", '')
$unexpected = @()
foreach ($s in $signers) {
    $name = [string]$s.Name
    $known = $expected | Where-Object { $name -like "*$_*" }
    if (-not $known) { $unexpected += $name }
    $lines += ('{0}  {1}' -f $(if ($known) { 'OK      ' } else { 'REVIEW  ' }), $name)
}
$hashRules = @($xml.SiPolicy.FileRules.Allow | Where-Object { $_.Hash })
$lines += '', ("Signers: {0}   Unexpected: {1}   Hash fallback allow rules: {2}" -f $signers.Count, $unexpected.Count, $hashRules.Count)
$lines | Set-Content -LiteralPath $signerReport -Encoding UTF8

Write-Host ("    {0} signers, {1} outside the six publishers, {2} hash fallback allow rules" -f $signers.Count, $unexpected.Count, $hashRules.Count)
Write-Host "    Report: $signerReport"
if ($unexpected.Count -gt 0) {
    Write-Warn 'Signers outside the six publishers in TCD 12.1.3 are present. Review and delete them before signing:'
    $unexpected | Select-Object -Unique | ForEach-Object { Write-Host "      $_" -ForegroundColor Yellow }
}
if ($hashRules.Count -gt 0) {
    Write-Warn "$($hashRules.Count) hash fallback rules from unsigned binaries. Review every one (A.8.2) - each is an unsigned file this policy would trust."
}

# --- A.8.6 Audit and rollback variants ------------------------------------------------------
Write-Step 7 'Producing the audit and rollback variants (A.8.3, A.8.6)'

# Audit: unsigned, so option 6 stays. Deployed by deleting the profile if it misbehaves.
Copy-Item -LiteralPath $enforcedPolicy -Destination $auditPolicy -Force
Set-RuleOption -FilePath $auditPolicy -Option 3
Set-CIPolicyIdInfo -FilePath $auditPolicy -PolicyName 'CDG-W11-SEC-AppControl Audit-T-1.0' | Out-Null

# Rollback: same PolicyID as enforced, audit mode, next version. Signed, per A.8.6.
Copy-Item -LiteralPath $enforcedPolicy -Destination $rollbackPolicy -Force
Set-RuleOption -FilePath $rollbackPolicy -Option 3
Set-CIPolicyVersion -FilePath $rollbackPolicy -Version '1.0.0.1'

# --- A.8.5 Certificate, then remove option 6 ------------------------------------------------
Write-Step 8 'Adding the signing certificate, then removing option 6 (A.8.5, DR-017)'

foreach ($p in @($enforcedPolicy, $rollbackPolicy)) {
    Add-SignerRule -FilePath $p -CertificatePath $SigningCertPath -Update -Supplemental:$false
    # Only now is a signed replacement possible, so unsigned policies can be refused.
    Set-RuleOption -FilePath $p -Option 6 -Delete
    $check = [xml](Get-Content -LiteralPath $p)
    if (-not $check.SiPolicy.UpdatePolicySigners.UpdatePolicySigner) {
        throw "UpdatePolicySigners is empty in $(Split-Path $p -Leaf) after Add-SignerRule. Stop: this policy would be unreplaceable on every device it reached."
    }
}
Write-Host '    Certificate present in UpdatePolicySigners on the enforced and rollback policies.'

# --- Convert --------------------------------------------------------------------------------
Write-Step 9 'Converting to binary'

$cips = @{}
foreach ($p in @($enforcedPolicy, $auditPolicy, $rollbackPolicy)) {
    $leaf = Get-BaseName $p
    $bin = Join-Path $WorkPath ($leaf + '.cip')
    ConvertFrom-CIPolicy -XmlFilePath $p -BinaryFilePath $bin | Out-Null
    $cips[$leaf] = $bin
    Write-Host ('    {0}' -f (Split-Path $bin -Leaf))
}
# The deployed enforced binary must be named for the PolicyID.
$deployCip = Join-Path $WorkPath ($policyGuid + '.cip')
Copy-Item -LiteralPath $cips['CDG-W11-SEC-AppControl-Enforced-P-1.0'] -Destination $deployCip -Force

# --- Verify ---------------------------------------------------------------------------------
Write-Step 10 'Verifying the option set'

$want = @{
    'CDG-W11-SEC-AppControl-Enforced-P-1.0'   = @{ present = @('Enabled:UMCI', 'Enabled:Inherit Default Policy', 'Required:Enforce Store Applications', 'Enabled:Revoked Expired As Unsigned', 'Enabled:Boot Audit On Failure', 'Enabled:Update Policy No Reboot'); absent = @('Disabled:Script Enforcement', 'Enabled:Unsigned System Integrity Policy', 'Enabled:Audit Mode') }
    'CDG-W11-SEC-AppControl-Audit-T-1.0'      = @{ present = @('Enabled:UMCI', 'Enabled:Audit Mode', 'Enabled:Unsigned System Integrity Policy'); absent = @('Disabled:Script Enforcement') }
    'CDG-W11-SEC-AppControl-Rollback-1.0.0.1' = @{ present = @('Enabled:Audit Mode'); absent = @('Enabled:Unsigned System Integrity Policy') }
}
$fail = 0
foreach ($p in @($enforcedPolicy, $auditPolicy, $rollbackPolicy)) {
    $leaf = Get-BaseName $p
    $opts = @(([xml](Get-Content -LiteralPath $p)).SiPolicy.Rules.Rule.Option)
    foreach ($o in $want[$leaf].present) { if ($opts -notcontains $o) { Write-Warn "$leaf is missing '$o'"; $fail++ } }
    foreach ($o in $want[$leaf].absent)  { if ($opts -contains  $o) { Write-Warn "$leaf still carries '$o'"; $fail++ } }
}
if ($fail -eq 0) { Write-Host '    Option set correct on all three policies.' -ForegroundColor Green }
else { throw "$fail option-set problems. Do not sign or deploy these files." }

# --- Next steps -----------------------------------------------------------------------------
Write-Step 11 'Remaining manual steps'

@"
Sign the enforced and rollback binaries with the APM code-signing certificate (SOE-02):

  signtool sign /v /n "<APM code-signing certificate subject>" /p7 "$WorkPath" /p7co 1.3.6.1.4.1.311.79.1 /fd sha256 "$deployCip"
  signtool sign /v /n "<APM code-signing certificate subject>" /p7 "$WorkPath" /p7co 1.3.6.1.4.1.311.79.1 /fd sha256 "$($cips['CDG-W11-SEC-AppControl-Rollback-1.0.0.1'])"

signtool writes <name>.cip.p7; rename each back to .cip before upload.

Deploy (A.8.7):
  Audit     Endpoint security > App Control for Business, upload the UNSIGNED audit XML
            $auditPolicy
            Assign: sg-stc-dvc-cdg-participant-kiosk-Autopatch-Test

  Enforced  Devices > Configuration profiles > Custom, OMA-URI
            ./Vendor/MSFT/ApplicationControl/Policies/$policyGuid/Policy
            Data type: Base64 (file). Upload the SIGNED $([System.IO.Path]::GetFileName($deployCip))
            Assign: sg-dyn-dvc-cdg-participant-kiosk, only after pilot validation (Phase 9)

  Rollback  Hold the signed rollback .cip in escrow with the certificate BEFORE the enforced
            policy is assigned anywhere. Prove it under T-21 first.

Record the PolicyID in TCD 12.1.3: $policyGuid
"@ | Write-Host

Write-Host ''
Write-Host 'Done.' -ForegroundColor Green
