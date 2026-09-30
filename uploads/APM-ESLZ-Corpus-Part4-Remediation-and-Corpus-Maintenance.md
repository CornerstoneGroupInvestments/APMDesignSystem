# APM ESLZ Reference Corpus — Part 4 of 4: Remediation and Corpus Maintenance

Verbatim extract from the `apm-eslz-reference` Claude skill. Part 4 contains 3 of 19 files. Classification: APM operates at RFFR PROTECTED.

Files in this part:

- `references/remediation-register.md`
- `references/curation-guide.md`
- `scripts/ingest.py`

---


# `references/remediation-register.md`

> Skill-internal copy of the remediation register. The corpus files marked
> `baseline: partner-delivered` intentionally preserve these defects as the handover
> record. Working copy for APM edits: `APM-ESLZ-Remediation-Register.md` in the
> ESLZ-PLATFORM-INFO project folder.

# APM ESLZ — Source Remediation Register & CAF Deviation Log

Compiled 21 July 2026 (A5 added 22 July 2026 from ingest of `Palo Alto Firewall
Deployment As-Built_V1.0.docx`) from ingest of `AzurePolicyAssignmentListRecord.xlsx`
(Stream03-17July2026) and `APM Azure Landing Zone (APAC) - DetailedDesign v 1.1.docx`,
cross-checked against `Azure ESLZ Naming Standards-17July2026.pdf` (previously ingested).

## Part A — Discrepancies to fix at source

### A1. Detailed Design v1.1 (document corrections)

| # | Location | Issue | Suggested fix |
|---|---|---|---|
| 1 | Table 27 (AUSE subnet plan) | Hub rows labelled `auea-vnet-connectivity-001` / `auea-snet-*` against 10.50.x CIDRs | Relabel `ause-` |
| 2 | Table 27 trailing block | Conflicting duplicate rows: `ause-snet-connectivity-001` 10.50.0.0/26 overlaps GatewaySubnet 10.50.0.0/27; `ause-snet-appgw-001` 10.50.0.64/26 overlaps public subnet 10.50.0.64/27 | Delete/reconcile the duplicate block against as-built |
| 3 | Tables 26/27 vs as-built | Planned `-pl-` subnets deployed as `-pe-` | Update plan tables to `-pe-` (matches naming standard) |
| 4 | Hub subnet tables | `snet-vmx-001` (10.40.0.160/27, 10.50.0.160/27) deployed but absent from design | Add to design with purpose statement |
| 5 | Table 25 (AUSE VNets) | `-01` instance suffixes vs `-001` deployed and standard | Normalise to `-001` |
| 6 | §6.x + Table 44 (tagging) | Appendix omits `enableupdate` and `update-stage`; §6.x duplicates `service-component-type` and mis-numbers rows | Single authoritative tag table carrying all 13 tags |
| 7 | Tagging — `backup` tag | Description names Basic/Standard/Enhanced tiers; value list has four values, none `Enhanced*`, yet `…-vmsqlbackup-enhanced-001` policies exist | Define the enhanced tag value or remove the tier from prose |
| 8 | Design decision register | Duplicate IDs/titles: DD14/15, DD18/19, DD26/27, DD47/48; DD87–95 exist only in DevOps Wiki | De-duplicate; either import DevOps DDs or reference the wiki formally |
| 9 | As-built MG placement table | aus-sub-acquisitions-001 path shows AUS-MG-SANDBOX; aus-sub-sandbox-001 and aus-sub-avd-controlled-001 show paths directly under APM | Correct paths (or move subs if the table reflects reality) |
| 10 | Subscription model (Table 35) | aus-sub-avd-controlled-001 (14th, as-built) absent from the 13-subscription design | Add AVD subscription to the model |
| 11 | UDR section | Next-hop documented as placeholder 1.1.1.1 | Update with the firewall ILB frontend IP |
| 12 | RG tables | Design `[r]-rg-dns-001` vs as-built `[r]-rg-connectivity-dns-001` | Align design to as-built |
| 13 | Network Watcher | Planned `[region]-nw-[env]-001` naming vs as-built Azure defaults (`NetworkWatcher_australiaeast` in `NetworkWatcherRG`) | Ratify the Azure-default exception in the design (naming PDF already does) |
| 14 | Budget register (Table 47) | Second budget named `BudgetAlertFor-aus-sub-management` is scoped to db53478c… (the security subscription); AUD 5,000 placeholder amounts; recipient mailbox flagged "pending update" | Rename to …-security; set real amounts and recipients |
| 15 | Alert appendix (Table 46) | prod-standard-001 present in Service Health list but missing from Resource Health list | Add the missing rule (or record why) |
| 16 | Storage as-built list | Numbered list skips No. 4 — `asstmopsdiaglog001` table absent though the account exists | Add the missing table |
| 17 | Resource names as deployed | `aquisitions` misspelling ("acquisitions") consistent in VNet/subnet names | Decide: ratify the spelling as-is in the standard, or plan renames — don't leave undocumented |

### A2. Open design/compliance actions (source-level, not just editorial)

| # | Item | Issue |
|---|---|---|
| 18 | DD5 / NFR 1.9 | Privileged accounts still synchronised from AD DS to Entra; as-built notes this "could not be completed" — alternative pathway unresolved |
| 19 | DD10 / NFR 1.1 | JIT administration only partial (MFA + RBAC); PIM excluded this phase yet MG RBAC uses PIM-eligible assignments — clarify licence/ownership |
| 20 | RBAC expiry cliff | All MG-level role assignments are eligible, time-bound, expiring **Nov 2026** — renewal process needed before expiry |
| 21 | Security LAW retention | 30 days (handover baseline) vs NFR 9.9 180-day requirement; security team to set deliberately |
| 22 | Resource locks (DD67) | Policy created but assignment "pending post-deployment completion" — confirm now deployed |
| 23 | DR posture conflict | Corpus index references a ratified multi-zone single-region (AUEA) DR decision superseding AUSE; Detailed Design v1.1 actively builds AUSE as regional pair (VNets, GRS+CRR vaults, DCs). Which governs? Ingest the DR decision paper and align the design |
| 24 | VM Insights (DD34) | Dependency/Map agent deprecated (new onboarding blocked since Sep 2025, retiring 2028) — design still references it; formally shift to AMA-based tracking |

### A3. Policy register (`AzurePolicyAssignmentListRecord.xlsx`)

| # | Issue | Suggested fix |
|---|---|---|
| 25 | COMP04 assignment name contains a pipe (`… Authenticator Management \| Password-Based Authentication`) — breaks tabular exports/parsers | Rename without the pipe |
| 26 | Numbering gaps: APM010, APM023–024, APM026–027, APM032, APM034–037, MON006–007 | Record disposition (retired / reserved / never deployed) in the register |
| 27 | AUM05 (built-in, Stream01) and AUM05.1 (custom, Stream03) both assigned for the same control | Retire one or document the supersession |
| 28 | MON008.1 / MON008.2 have identical names with no region discriminator | Add AUEA/AUSE suffix per the DIAG/LOG convention |
| 29 | DIAG011/012 (load balancers → Storage) follow the LOG-family pattern but sit in DIAG | Renumber or note the taxonomy exception |
| 30 | Design plans APM011.2 (Acquisitions guardrails) and COMP03.1 at sandbox/acquisitions scopes; deployed record shows APM011.1 only and COMP03.1 at APM root | Reconcile design intent vs deployment; deploy APM011.2 or amend design |

### A4. Naming Standards PDF (carried from previous ingest — still open)

| # | Issue |
|---|---|
| 31 | Front Door Profile example uses `adf`, colliding with Data Factory; likely intended `afd` |
| 32 | Front Door v2 section marked `[INCORRECT]` in source — needs replacement content |
| 33 | RSV format string places region fifth; every example is region-first — ratify region-first |
| 34 | External LB: format `[lb]` vs registry/example `lbe` vs bare-`lb` example — needs a ruling |
| 35 | AppGW PIP examples (`ae-pip-p-appgw-001`) use shortform region+env, conflicting with the full-form Public IP pattern |
| 36 | `aapi` for Application Insights deviates from CAF `appi` — confirm intentional |
| 37 | Typos: `auea-rt-prod-crtl-001`, `allow-ob-azmoniror-to-law-https-01`, "User Assigneed" |

### A5. Palo Alto Firewall Deployment As-Built v1.0 (added 22 Jul 2026)

| # | Location | Issue | Suggested fix |
|---|---|---|---|
| 38 | Instance table vs interface/template/device-group sections | Device names inconsistent: `aefwppalo00x`/`asfwppalo00x` vs `aefwpalo00x`/`asfwpalo00x` (single "p") | Verify deployed names in Azure; correct document to match |
| 39 | Template structure | TS-NS-AU-Southeast lists member `aefwpalo001` (an AUEA N-S device) | Correct to `asfwpalo001` |
| 40 | Table 8 (interface config) | Malformed mgmt IPs `10.40.38`, `10.40.37`, `10.50.39`, `10.50.35` (missing octet); `aefwpalo004` mgmt duplicates `aefwpalo002`'s 10.40.0.37 | Correct to full, unique addresses from snet-mgmt |
| 41 | NAT policy section | Prose: NAT rules "only … for the East/West firewall"; tables titled for both N-S and E-W; egress narrative (Zscaler tunnel.1 on N-S) implies N-S NAT | Reconcile prose/tables against live config |
| 42 | Scope (AUSE) | 4 load balancers listed for the 2-firewall region (copy of AUEA count?) | Confirm actual AUSE LB count |
| 43 | Document control | Status truncated ("Ready to"); consultation table has no sign-off dates; v1.0 marked "Ready for APM to Review & Endorse" — ratification unconfirmed | Record endorsement outcome and finalise status |
| 44 | Services settings | Primary/secondary DNS and NTP servers TBC at handover | Ratify values and update firewall config + document |
| 45 | DR scope | AS04 (DR = firewalls/related resources) conflicts with AS16 (DR = production and identity resources) | Align assumption set |

## Part B — CAF/ALZ deviations complicating codification

These are not errors — they are ratified choices that diverge from CAF/ALZ reference
patterns. Each imposes cost when codifying the corpus into IaC (Terraform/Bicep ALZ
modules, policy-as-code, subscription vending):

1. **Region-first naming grammar.** CAF ordering is resource-type-first (`rg-`, `vnet-`);
   APM is `[region]-[type]-…`. Standard CAF naming providers (`azurecaf_name`, ALZ Bicep
   naming modules) can't emit this — a custom naming module/function is required for
   every resource type.
2. **Dual grammar (hyphenated + compact concatenated).** VMs, storage, firewalls, LBs use
   concatenated shortform with single-letter env/domain codes (`p`, `c`, `x`); everything
   else is hyphenated long-form. Codification needs two generators plus a
   shortform↔longform token map, and the compact form is lossy (single letters collide as
   the estate grows).
3. **APM security domain as a first-class token** (controlled/standard/platform) — absent
   from CAF entirely, and encoded three different ways: full word (subscriptions),
   `ctrl`/`std` (resources), `c`/`s` (compact). Every module needs the extra variable and
   the three encodings.
4. **Platform subscriptions drop the domain token** and overload the environment slot
   with a platform function (connectivity/identity/management/security) — naming logic
   becomes conditional on subscription archetype.
5. **Environment-based Level 4 management groups**
   (AUS-MG-{PROD|DEV|SIT|UAT}-{CONTROLLED|STANDARD}). ALZ guidance explicitly recommends
   archetype-based MGs (Corp/Online) and discourages environment MGs; ALZ policy
   assignment defaults, archetype definitions, and subscription-vending modules all
   assume the reference hierarchy. Adopting ALZ accelerator code means re-mapping every
   archetype, and the "no RBAC at CONTROLLED/STANDARD MGs" rule must be enforced by
   convention since tooling won't know it.
6. **Portal-managed policies (DD69), not policy-as-code.** The single largest
   codification blocker: any IaC representation immediately drifts. Compounded by
   inconsistent custom definition IDs (readable slugs like `apm001-private-link-dns`
   mixed with opaque hex like `756e53b7bea14a39965a429a`) and assignment names that are
   random hex for some assignments and readable for others — a full import/mapping
   exercise is needed before policy-as-code is viable.
7. **Non-CAF abbreviations** in the registry: `aapi` (CAF `appi`), `pdz` (CAF `pdnsz`),
   `pep` (CAF `pe`), `law` (CAF `log`), `rsvp` (no CAF equivalent), `snet` matches CAF
   but subnets deliberately omit env/domain tokens. A bespoke abbreviation registry must
   ship with any naming module — CAF defaults cannot be assumed anywhere.
8. **Two DNS zone conventions coexist**: the naming standard defines `[region]-pdz-…`
   resources while deployed private DNS zones necessarily use service FQDNs
   (`privatelink.blob.core.windows.net`). Codification must special-case DNS zones
   (FQDN-named) vs the documented scheme.
9. **Azure-default names ratified as exceptions** (`NetworkWatcher_australiaeast`,
   `NetworkWatcherRG`, `AzureBackupRG_australiaeast_1`) — deny/naming policies and
   linting must allow-list these.
10. **Instance padding inconsistency**: `001` standard, but `01` for subscriptions, VM
    hosts, NSG rules, and Table 25 VNets — normalisation rule needed before generators
    can round-trip names.
11. **Tag scheme vs naming tokens mismatch.** Tag `environment` values (SECURITY, MGMT,
    IDY, CONN, TEST, SBX, PROD…) don't match naming environment tokens
    (security/mgmt/identity/conn/sandbox); `TEST` has no subscription; tag names mix
    hyphenation styles (`apm-security-domain`, `application-id` vs `technicalcontact`,
    `operationalteam`). Mapping tables required between tag values, naming tokens, and MG
    archetypes.
12. **Behaviour encoded in tag values** (`Backup`, `update-stage` drive policy
    enrolment) — tags are control-plane inputs, so tag policy-as-code must be treated as
    change-managed configuration, not metadata.
13. **No IPAM system** (accepted risk RS07): the address plan is document-borne. Nothing
    machine-readable exists to feed subscription vending or `azurerm` address-space
    validation; sandbox CIDRs may deliberately overlap, which breaks naive overlap
    checks.
14. **Region token set is bespoke**: `auea`/`ause` + shortforms `ae`/`as` + `global` +
    reserved `nz`/`sg` — no standard CAF region-code map matches; must be maintained
    in-house.
15. **PIM-eligible, time-bound MG role assignments** (1-year) — `azurerm` has no
    first-class support for eligible assignments (AzAPI/Graph needed), so the RBAC model
    resists plain Terraform; the Nov 2026 expiry compounds this (see A2 #20).
16. **CSP-managed subscriptions under MCA** — subscription vending automation (ALZ
    vending module) assumes EA/MCA programmatic subscription creation; CSP flow differs
    and the design keeps creation manual with the Infrastructure team.

## Suggested priority order

1. A2 #20 (RBAC expiry cliff — operational risk with a date), A2 #23 (DR posture
   conflict — architecture-level ambiguity), A2 #22 (locks pending).
2. A3 items (register hygiene) — cheap fixes that unblock reliable policy tooling.
3. A1 #1–5 (address-plan table errors) — these are the IPAM system of record until an
   IPAM exists; errors here propagate.
4. A1 tagging items (#6–7) — tags drive backup/patching automation.
5. Part B decisions — each needs an explicit "ratify deviation" or "converge to CAF"
   ruling before IaC codification starts; #5 and #6 dominate the effort estimate.

---


# `references/curation-guide.md`

# Curation guide — staged extraction → corpus content

Read this before performing Workflow B step 2. Curation is the judgment step the ingest
script deliberately does not attempt.

## What to keep

- **Ratified decisions** and their rationale (the "we chose X over Y because Z" material —
  rationale is what makes the corpus useful across projects, keep it tight but keep it).
- **Standards and rules**: naming grammars, tagging schemas, subnet sizing rules, policy
  assignment scopes, RBAC role definitions.
- **Tables**: control matrices, address plans, role mappings, policy lists. Verify PDF-
  extracted tables cell-by-cell against the source — `pdftotext` mangles merged cells.
- **Diagable structure**: describe topology in text/tables even where the source used a
  diagram; the corpus is text-first. Reproduce diagrams as Mermaid only where structure is
  genuinely load-bearing.
- **Constraints and known limitations** (e.g. PSK rotation limits, managed-VNet
  incompatibilities) — these prevent repeated rediscovery.

## What to drop

- Executive summaries, purpose/audience/scope preamble, background sections that restate
  the ESLZ generally.
- Document control, revision history, approvals, distribution — the script strips most of
  this from docx, but PDFs and stubborn layouts need a manual pass.
- Branding, headers/footers, page furniture, ToC artifacts.
- Anything already covered by another corpus file — link to it instead of duplicating.
  Duplication is how corpora rot: two copies, one updated.

## Sanitisation (RFFR PROTECTED)

The corpus holds **schemes, patterns, and ratified decisions**, not live operational
state. During curation:

- Address plan: the ratified plan is carried in full — allocation blocks, subnet
  allocations, sizing rules, and reservation policy are all in scope, because the plan
  document is APM's IPAM system of record. Strip personal contact details (owner names,
  emails) from allocation tables; keep the team/landing-zone attribution.
- Network security: inspection *model* and traffic-flow *patterns* are in scope. Actual
  firewall rulebases, specific security policies, and object names are not.
- Identity: role model, identity classes, and PIM design are in scope. Actual principal
  names, group object IDs, and break-glass account details are not.
- Never carry credentials, keys, connection strings, or PSKs into the corpus, even
  redacted ones.
- When in doubt, generalise — except where a file is designated the system of record
  (the address plan): there, fidelity to the ratified document takes precedence, and
  sanitisation is limited to personal details and secrets. Confirm the engagement's
  data-handling terms govern what may be persisted here.

## Splitting across the taxonomy

Source deliverables are organised for a reader; the corpus is organised for retrieval.
One deliverable usually feeds several corpus files — e.g. a DR design paper contributes
to `architecture/resilience-dr.md` (the posture and decision), `policies/governance.md`
(any risk-acceptance governance), and possibly `standards/naming.md` (DR-site naming).
Place each piece where Workflow A's index would route a question about it, and add
cross-links (`see architecture/topology.md §Egress`) rather than copies.

## Frontmatter contract

Every corpus file starts with:

```yaml
---
status: active            # or: stub
source_document: <primary source filename(s)>
source_version: <version of the ratified deliverable>
ingested: <YYYY-MM-DD of last curation>
supersedes: <optional — earlier decisions this content replaces>
---
```

If a file draws on multiple deliverables, list them all; the version cited in answers
should be the one governing the specific claim.

## Updating an existing corpus file

Never blind-overwrite. Read the current file, merge the new content, and present the user
a per-file summary of changes (added / changed / removed decisions) before writing. If the
new deliverable *supersedes* a decision rather than extending it, record that in
`supersedes` — silent decision reversals are the most damaging corpus failure.

---


# `scripts/ingest.py`

```python
#!/usr/bin/env python3
"""Ingest a deliverable (docx / pdf / xlsx) into staged raw markdown.

Deliberately does extraction only. Curation (deciding what is reference
material, sanitising classification-sensitive detail, splitting across the
corpus taxonomy) is a judgment task performed by Claude in Workflow B step 2.

Usage:
    python3 scripts/ingest.py <source-file> [--out staging/] [--keep-boilerplate]

Output:
    <out>/<slug>.md  — raw markdown with a YAML frontmatter provenance header.
"""

import argparse
import datetime
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

# ---------------------------------------------------------------- helpers

BOILERPLATE_HEADINGS = [
    # Headings whose entire section is dropped (case-insensitive match).
    r"document\s+control",
    r"revision\s+history",
    r"version\s+history",
    r"document\s+information",
    r"approval[s]?\b",
    r"sign[\s-]?off",
    r"distribution\s+list",
    r"copyright",
    r"disclaimer",
]

VERSION_PATTERNS = [
    r"\bv(?:ersion)?\s*([0-9]+\.[0-9]+(?:\.[0-9]+)?)\b",
    r"\b([0-9]+\.[0-9]+)\s*(?:draft|final)\b",
]


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-").lower()
    return text or "document"


def detect_version(text: str, filename: str) -> str:
    for source in (filename, text[:4000]):
        for pat in VERSION_PATTERNS:
            m = re.search(pat, source, re.IGNORECASE)
            if m:
                return m.group(1)
    return "unknown"


def strip_boilerplate(md: str) -> str:
    """Drop whole sections whose heading matches a boilerplate pattern.

    Works on ATX headings (#, ##, ...). A dropped section ends at the next
    heading of the same or higher level.
    """
    lines = md.splitlines()
    out, skip_level = [], None
    heading_re = re.compile(r"^(#{1,6})\s+(.*)$")
    for line in lines:
        m = heading_re.match(line)
        if m:
            level, title = len(m.group(1)), m.group(2)
            if skip_level is not None and level <= skip_level:
                skip_level = None
            if skip_level is None and any(
                re.search(p, title, re.IGNORECASE) for p in BOILERPLATE_HEADINGS
            ):
                skip_level = level
                continue
        if skip_level is None:
            out.append(line)
    md = "\n".join(out)
    return re.sub(r"\n{4,}", "\n\n\n", md)


# ------------------------------------------------------------- extractors

def extract_docx(path: Path) -> str:
    """pandoc gives the best structure (headings, tables) for docx."""
    result = subprocess.run(
        ["pandoc", str(path), "-f", "docx", "-t", "gfm", "--wrap=none"],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"pandoc failed: {result.stderr[:500]}")
    return result.stdout


def extract_pdf(path: Path) -> str:
    """pdftotext -layout; tables survive as fixed-width text for curation.

    PDF extraction is inherently lossy — the frontmatter flags it so the
    curation step knows to verify tables against the source.
    """
    result = subprocess.run(
        ["pdftotext", "-layout", str(path), "-"],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"pdftotext failed: {result.stderr[:500]}")
    text = result.stdout
    # Form-feed page breaks -> horizontal rules so page structure is visible.
    text = text.replace("\f", "\n\n---\n\n")
    return text


def extract_xlsx(path: Path) -> str:
    import openpyxl

    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    parts = []
    for ws in wb.worksheets:
        rows = [
            [("" if c is None else str(c).replace("|", "\\|").replace("\n", " "))
             for c in row]
            for row in ws.iter_rows(values_only=True)
        ]
        rows = [r for r in rows if any(cell.strip() for cell in r)]
        if not rows:
            continue
        width = max(len(r) for r in rows)
        rows = [r + [""] * (width - len(r)) for r in rows]
        parts.append(f"## Sheet: {ws.title}\n")
        parts.append("| " + " | ".join(rows[0]) + " |")
        parts.append("|" + "---|" * width)
        for r in rows[1:]:
            parts.append("| " + " | ".join(r) + " |")
        parts.append("")
    wb.close()
    return "\n".join(parts)


EXTRACTORS = {
    ".docx": ("pandoc docx->gfm", extract_docx),
    ".pdf": ("pdftotext -layout (lossy; verify tables)", extract_pdf),
    ".xlsx": ("openpyxl sheets->markdown tables", extract_xlsx),
    ".xlsm": ("openpyxl sheets->markdown tables", extract_xlsx),
}

# ------------------------------------------------------------------ main

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("source", type=Path)
    ap.add_argument("--out", type=Path, default=Path(__file__).parent.parent / "staging")
    ap.add_argument("--keep-boilerplate", action="store_true",
                    help="Skip the document-control/revision-history stripping pass")
    args = ap.parse_args()

    src = args.source
    if not src.exists():
        print(f"error: {src} not found", file=sys.stderr)
        return 1
    ext = src.suffix.lower()
    if ext not in EXTRACTORS:
        print(f"error: unsupported type {ext} (supported: {', '.join(EXTRACTORS)})",
              file=sys.stderr)
        return 1

    method, fn = EXTRACTORS[ext]
    print(f"extracting {src.name} via {method} ...")
    body = fn(src)

    if ext == ".docx" and not args.keep_boilerplate:
        body = strip_boilerplate(body)

    version = detect_version(body, src.name)
    args.out.mkdir(parents=True, exist_ok=True)
    dest = args.out / f"{slugify(src.stem)}.md"

    frontmatter = "\n".join([
        "---",
        "status: staged  # raw extraction — curate before moving into the corpus",
        f"source_document: {src.name}",
        f"source_version: {version}",
        f"extraction_method: {method}",
        f"ingested: {datetime.date.today().isoformat()}",
        "---",
        "",
    ])
    dest.write_text(frontmatter + body, encoding="utf-8")

    print(f"staged -> {dest}")
    print(f"detected version: {version}"
          + ("  (verify manually)" if version == "unknown" else ""))
    if ext == ".pdf":
        print("note: PDF extraction is lossy — verify tables against the source "
              "during curation.")
    print("next: curate per references/curation-guide.md (Workflow B step 2).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

---


*End of Part 4 of 4.*
