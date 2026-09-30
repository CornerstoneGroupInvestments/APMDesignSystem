# Artifact 09 - KB Builder skill (project tooling)

## SKILL.md

```markdown
---
name: apm-kb-builder
description: Generate an APM Internal KB article as a .docx using APM's Word template exactly. Triggers on any request to build/create/draft a KB, knowledge base article, or knowledge article in the APM Detail Design project. Examples — "build me a KB on X", "create a KB for Y", "draft a knowledge article about Z", "write up a KB on the SOE access process". Output preserves the APM template's cover page, header/footer chrome, and built-in heading and body styles.
---

# APM KB Builder

## When to use
Run this when the AVD Solution Engineer asks for any KB / Knowledge Base / Knowledge Article in the APM Detail Design project. Default output format is .docx using `templates/APM-KB-Template.docx`.

## Inputs needed from the AVD Solution Engineer
Before drafting content, confirm with one `AskUserQuestion` call:

1. KB topic (becomes the cover subtitle/title)
2. Template type — Application Support KB, Known Issue / Simple Fix KB, or freeform (matches APM KB standard KB0011901 in `/Users/shaun/Documents/Claude/Projects/APM Detail Design/APM-KB-Article-Standard.md`)
3. Source material — does the AVD Solution Engineer have a doc to draft from, or should I produce a first-pass from project context (the Detail Design and AVD docs already in the folder)?

Defaults that do NOT need to be asked unless the AVD Solution Engineer overrides:
- `doc_type`: "Knowledge Base Article"
- `date`: today (DD Month YYYY)
- `status`: "Draft"
- `version`: "V0.1"
- `division`: "Digital Transformation & Architecture"
- `change_summary`: "Initial draft"
- `owner` / `owner_email` / `program` / `kb_id`: copy from the most recent KB or the current detail design doc, or ask if not derivable

## How it works
The generator is a Python script that:
1. Copies `templates/APM-KB-Template.docx` to the output path
2. Substitutes cover page fields (Title, Subtitle, Date, and the Project/Owner/Contact/Program/Division/Status/Version/Product ID rows of the cover table)
3. Updates the Version History table's first data row (Version / Date / Author / Key changes)
4. Strips the sample body content (`1. Introduction`, `1.1 Purpose`, `1.2 Audience`, `Heading 1–4` samples)
5. Inserts the new KB body using the template's own `Heading 1`, `Heading 2`, `Heading 3`, `Heading 4`, `Body Text`, and `List Paragraph` styles
6. Leaves Confidentiality & Disclaimer, APM Contact, Consultation / References / SDA Approval tables untouched — the AVD Solution Engineer fills these post-generation as needed

## Workflow
1. Read the APM KB standard at `/Users/shaun/Documents/Claude/Projects/APM Detail Design/APM-KB-Article-Standard.md` to confirm the right structure (Application Support vs Known Issue templates).
2. Draft the body content as sections — every KB MUST start with a `Purpose` section (Heading 1) and end with a `Summary` section (Heading 1). Apply the AVD Solution Engineer's writing rules from his global CLAUDE.md (simple, active voice, no clichés, no em dashes, no semicolons, etc.).
3. Write a spec JSON to `/Users/shaun/Documents/Claude/Projects/APM Detail Design/skills/kb-builder/specs/<slug>.json`. Use `spec.example.json` as the schema reference.
4. Run the generator:
   ```bash
   python3 "/sessions/tender-wizardly-heisenberg/mnt/APM Detail Design/skills/kb-builder/build_kb.py" \
     --spec "/sessions/tender-wizardly-heisenberg/mnt/APM Detail Design/skills/kb-builder/specs/<slug>.json" \
     --output "/sessions/tender-wizardly-heisenberg/mnt/APM Detail Design/KB-<slug>.docx"
   ```
   (Bash path mapping: the project folder `/Users/shaun/Documents/Claude/Projects/APM Detail Design/` is `/sessions/<session>/mnt/APM Detail Design/` in bash. Read the system prompt's Shell access block for the current session prefix.)
5. Present the resulting .docx with `mcp__cowork__present_files`.

## Spec schema
See `spec.example.json` for a working reference. Required fields:
- `title` — the KB topic, shown as the cover subtitle
- `sections` — ordered list of `{ "style": "...", "text": "..." }`. Style keys: `h1`, `h2`, `h3`, `h4`, `body`, `bullet`.

Optional fields use defaults listed above.

## Known limitations
- `bullet` items use the template's `List Paragraph` style but python-docx does not attach a numPr by default. If true bullet glyphs are required, the AVD Solution Engineer can apply the bullet button in Word after open — the styling is otherwise preserved. Or extend the script to set `numId` from `numbering.xml`.
- The Consultation, References, and SDA Approval tables on the cover are left as-is. For a KB they are typically not relevant — recommend the AVD Solution Engineer delete those tables in Word, or extend this skill to optionally remove them.
- The Detail Design Document template is heavy chrome for a KB. If the AVD Solution Engineer decides KBs should be ServiceNow-publish-ready instead (HTML in Verdana per the APM KB standard), this skill is the wrong tool — flag this on first run and offer to build a separate ServiceNow-paste version.

## Files
- `build_kb.py` — generator
- `spec.example.json` — schema example
- `specs/` — generated spec files for each KB built (create on demand)
- `../../templates/APM-KB-Template.docx` — canonical APM template
- `../../APM-KB-Article-Standard.md` — APM KB content standard (KB0011901)

```

## build_kb.py

```python
#!/usr/bin/env python3
"""
APM KB Builder
==============
Generates an APM Internal KB article as a .docx, using the APM Word Template.
Preserves cover page, headers/footers, styles, and document chrome exactly.
Replaces cover metadata and inserts KB body content using the template's
own heading and body styles.

Usage:
    python3 build_kb.py --spec spec.json --output out.docx [--template template.docx]

The spec file is JSON. See spec.example.json for the schema.
"""
import argparse
import json
import copy
import shutil
import sys
from datetime import date
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from copy import deepcopy

DEFAULT_TEMPLATE = Path(__file__).resolve().parent.parent.parent / "templates" / "APM-KB-Template.docx"


# -------------------- helpers --------------------

def replace_paragraph_text(paragraph, new_text):
    """Replace the entire text of a paragraph, preserving the paragraph's style
    and the formatting of its first run."""
    if not paragraph.runs:
        paragraph.add_run(new_text)
        return
    # Keep the first run, clear its text, set new text. Delete the others.
    first = paragraph.runs[0]
    first.text = new_text
    for r in paragraph.runs[1:]:
        r._element.getparent().remove(r._element)


def replace_cell_text(cell, new_text):
    """Replace the text of a table cell preserving formatting of the first paragraph."""
    # Drop all paragraphs except the first
    paragraphs = cell.paragraphs
    if not paragraphs:
        cell.add_paragraph(new_text)
        return
    first = paragraphs[0]
    replace_paragraph_text(first, new_text)
    for p in paragraphs[1:]:
        p._element.getparent().remove(p._element)


def find_paragraph_index(doc, predicate):
    """Return index of first paragraph matching predicate, else None."""
    for i, p in enumerate(doc.paragraphs):
        if predicate(p):
            return i
    return None


def delete_paragraph(paragraph):
    el = paragraph._element
    el.getparent().remove(el)


def insert_paragraph_after(paragraph, text="", style=None):
    """Insert a new paragraph immediately after the given paragraph."""
    new_p = copy.deepcopy(paragraph._element)
    # strip existing runs and properties that would clone formatting unexpectedly
    for child in list(new_p):
        if child.tag in (qn('w:r'), qn('w:hyperlink'), qn('w:bookmarkStart'), qn('w:bookmarkEnd')):
            new_p.remove(child)
    paragraph._element.addnext(new_p)
    from docx.text.paragraph import Paragraph
    new_para = Paragraph(new_p, paragraph._parent)
    if style is not None:
        try:
            new_para.style = paragraph.part.document.styles[style]
        except KeyError:
            # fallback: set styleId directly
            pPr = new_p.find(qn('w:pPr'))
            if pPr is None:
                from docx.oxml import OxmlElement
                pPr = OxmlElement('w:pPr')
                new_p.insert(0, pPr)
            pStyle = pPr.find(qn('w:pStyle'))
            if pStyle is None:
                from docx.oxml import OxmlElement
                pStyle = OxmlElement('w:pStyle')
                pPr.append(pStyle)
            pStyle.set(qn('w:val'), style.replace(' ', ''))
    if text:
        new_para.add_run(text)
    return new_para


# -------------------- cover substitutions --------------------

COVER_TABLE_LABELS = {
    "Project Name:": "project_name",
    "Document Owner:": "owner",
    "Contact Details:": "owner_email",
    "Program Name:": "program",
    "Division/Unit:": "division",
    "Document Status:": "status",
    "Document Version:": "version",
    "Product ID:": "kb_id",
}


def update_cover(doc, spec):
    # Title block — paragraphs near the start
    title_replaced = subtitle_replaced = date_replaced = False
    for p in doc.paragraphs[:25]:
        if not title_replaced and p.style.name == "Title":
            replace_paragraph_text(p, spec.get("doc_type", "Knowledge Base Article"))
            title_replaced = True
            continue
        if not subtitle_replaced and p.style.name == "Subtitle":
            replace_paragraph_text(p, spec["title"])
            subtitle_replaced = True
            continue
        if not date_replaced and p.text.strip() == "15 May 2026":
            replace_paragraph_text(p, spec.get("date", date.today().strftime("%d %B %Y")))
            date_replaced = True

    # Cover metadata table (Table 0)
    if doc.tables:
        t = doc.tables[0]
        for row in t.rows:
            if len(row.cells) < 2:
                continue
            label = row.cells[0].text.strip()
            if label in COVER_TABLE_LABELS:
                key = COVER_TABLE_LABELS[label]
                value = spec.get(key)
                if value is None:
                    # apply per-field defaults
                    if key == "status":
                        value = "Draft"
                    elif key == "version":
                        value = "V0.1"
                    elif key == "division":
                        value = "Digital Transformation & Architecture"
                    else:
                        continue
                replace_cell_text(row.cells[1], str(value))

    # Version History table (Table 1) — update first data row
    if len(doc.tables) >= 2:
        vh = doc.tables[1]
        if len(vh.rows) >= 2:
            row = vh.rows[1]
            if len(row.cells) >= 4:
                replace_cell_text(row.cells[0], spec.get("version", "V0.1"))
                replace_cell_text(row.cells[1], spec.get("date", date.today().strftime("%d %B %Y")))
                replace_cell_text(row.cells[2], spec.get("author", spec.get("owner", "")))
                replace_cell_text(row.cells[3], spec.get("change_summary", "Initial draft"))


# -------------------- body replacement --------------------

def strip_sample_body(doc):
    """Delete the sample 'Introduction / Purpose / Audience / Heading samples'
    paragraphs that ship in the template. Returns the paragraph immediately
    before the deleted block so we can insert new content after it."""
    paragraphs = list(doc.paragraphs)
    # find first body Heading 1 ("1. Introduction")
    start_idx = None
    for i, p in enumerate(paragraphs):
        if p.style.name == "Heading 1" and p.text.strip().lower().startswith("1."):
            start_idx = i
            break
    if start_idx is None:
        return None  # nothing to strip

    # find end: scan forward until we hit a paragraph with style "Heading 4" whose text == "Heading 4"
    end_idx = start_idx
    for j in range(start_idx, len(paragraphs)):
        if paragraphs[j].text.strip() == "Heading 4":
            end_idx = j
            break

    anchor = paragraphs[start_idx - 1] if start_idx > 0 else None
    for p in paragraphs[start_idx:end_idx + 1]:
        delete_paragraph(p)
    return anchor


def remove_inline_column_breaks(doc):
    """The APM template embeds two w:sectPr blocks inside body paragraphs that
    switch the page into a 2-column layout for the sample content. Strip those
    inline section breaks so inserted KB content flows full-width."""
    body = doc.element.body
    # collect inline sectPr blocks (those nested inside w:pPr), excluding the
    # final document-level sectPr which is a direct child of body.
    for sectPr in body.findall('.//' + qn('w:sectPr')):
        parent = sectPr.getparent()
        if parent is None:
            continue
        if parent.tag == qn('w:pPr'):
            parent.remove(sectPr)


STYLE_MAP = {
    "h1": "Heading 1",
    "h2": "Heading 2",
    "h3": "Heading 3",
    "h4": "Heading 4",
    "body": "Body Text",
    "p": "Body Text",
    "bullet": "List Paragraph",
    "li": "List Paragraph",
    "summary_h": "Heading 1",
}


def insert_table_after(paragraph, rows, header=None):
    """Insert a 2-column table after the given paragraph. Each row is (left, right).
    If header is provided, it is a (left_header, right_header) tuple rendered bold."""
    from docx.oxml import OxmlElement
    from docx.oxml.ns import nsmap

    tbl = OxmlElement('w:tbl')

    # table properties: bordered, table grid style
    tblPr = OxmlElement('w:tblPr')
    tblStyle = OxmlElement('w:tblStyle')
    tblStyle.set(qn('w:val'), 'TableGrid')
    tblPr.append(tblStyle)
    tblW = OxmlElement('w:tblW')
    tblW.set(qn('w:w'), '5000')
    tblW.set(qn('w:type'), 'pct')
    tblPr.append(tblW)
    tblLook = OxmlElement('w:tblLook')
    tblLook.set(qn('w:val'), '04A0')
    tblPr.append(tblLook)
    tbl.append(tblPr)

    # column grid (35/65 split — left labels, right explanations)
    tblGrid = OxmlElement('w:tblGrid')
    for w in (3200, 6000):
        gridCol = OxmlElement('w:gridCol')
        gridCol.set(qn('w:w'), str(w))
        tblGrid.append(gridCol)
    tbl.append(tblGrid)

    def make_row(left, right, bold=False):
        tr = OxmlElement('w:tr')
        for text, width in ((left, 3200), (right, 6000)):
            tc = OxmlElement('w:tc')
            tcPr = OxmlElement('w:tcPr')
            tcW = OxmlElement('w:tcW')
            tcW.set(qn('w:w'), str(width))
            tcW.set(qn('w:type'), 'dxa')
            tcPr.append(tcW)
            tc.append(tcPr)
            p = OxmlElement('w:p')
            pPr = OxmlElement('w:pPr')
            pStyle = OxmlElement('w:pStyle')
            pStyle.set(qn('w:val'), 'BodyText')
            pPr.append(pStyle)
            p.append(pPr)
            r = OxmlElement('w:r')
            if bold:
                rPr = OxmlElement('w:rPr')
                b = OxmlElement('w:b')
                rPr.append(b)
                r.append(rPr)
            t = OxmlElement('w:t')
            t.text = text
            t.set(qn('xml:space'), 'preserve')
            r.append(t)
            p.append(r)
            tc.append(p)
            tr.append(tc)
        return tr

    if header:
        tbl.append(make_row(header[0], header[1], bold=True))
    for row in rows:
        tbl.append(make_row(row[0], row[1]))

    paragraph._element.addnext(tbl)

    # return a fresh empty paragraph after the table so subsequent inserts have somewhere to anchor
    from docx.oxml import OxmlElement as _O
    spacer = _O('w:p')
    tbl.addnext(spacer)
    from docx.text.paragraph import Paragraph
    return Paragraph(spacer, paragraph._parent)


def insert_body(doc, anchor, sections):
    """Insert section blocks after anchor paragraph. Each section is a dict:
       { "style": "h1"|"h2"|"h3"|"h4"|"body"|"bullet", "text": "..." }
       OR for tables:
       { "style": "table", "rows": [["left","right"], ...], "header": ["L","R"] }
    """
    if anchor is None:
        # if no anchor, append at end of doc body
        from docx.text.paragraph import Paragraph
        last = doc.paragraphs[-1]
        anchor = last

    current = anchor
    for sect in sections:
        style_key = sect.get("style", "body").lower()
        if style_key == "table":
            rows = sect.get("rows", [])
            header = sect.get("header")
            current = insert_table_after(current, rows, header=tuple(header) if header else None)
            continue
        style_name = STYLE_MAP.get(style_key, style_key)
        text = sect.get("text", "")
        current = insert_paragraph_after(current, text=text, style=style_name)


# -------------------- main --------------------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec", required=True, help="Path to JSON spec file")
    ap.add_argument("--output", required=True, help="Output .docx path")
    ap.add_argument("--template", default=str(DEFAULT_TEMPLATE), help="Path to APM template")
    args = ap.parse_args()

    spec = json.loads(Path(args.spec).read_text(encoding="utf-8"))
    template = Path(args.template)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    shutil.copyfile(template, output)
    doc = Document(str(output))

    update_cover(doc, spec)
    anchor = strip_sample_body(doc)
    remove_inline_column_breaks(doc)
    insert_body(doc, anchor, spec.get("sections", []))

    doc.save(str(output))
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()

```

## spec.example.json

```json
{
  "doc_type": "Knowledge Base Article",
  "title": "Support Overview – AVD Standard User SOE",
  "date": "28 May 2026",
  "project_name": "Standard User SOE on Azure Virtual Desktop",
  "owner": "the Head of Digital Transformation & Architecture",
  "owner_email": "[redacted]@apm.net.au",
  "program": "Digital Workplace Transformation",
  "division": "Digital Transformation & Architecture",
  "status": "Draft",
  "version": "V0.1",
  "kb_id": "KB-AVD-STD-001",
  "author": "Digital Transformation & Architecture",
  "change_summary": "Initial draft",
  "sections": [
    {"style": "h1", "text": "Purpose"},
    {"style": "body", "text": "To provide Service Desk staff with information required to support the AVD Standard User SOE."},

    {"style": "h1", "text": "What Is This?"},
    {"style": "body", "text": "AVD Standard User SOE is the Azure Virtual Desktop delivery channel of the APM Standard User SOE. Users access a Windows 11 Multi-Session host pool via the Windows App."},

    {"style": "h1", "text": "Who Uses It?"},
    {"style": "body", "text": "Staff requiring a Windows desktop without a corporate laptop, including contractors, BYOD users, and roles where AVD is the assigned delivery channel."},

    {"style": "h1", "text": "What Is It Used For?"},
    {"style": "body", "text": "Standard productivity workloads on the APM SOE delivered as a cloud desktop session."},

    {"style": "h1", "text": "Access"},
    {"style": "h2", "text": "How access is requested"},
    {"style": "body", "text": "Manager raises a ServiceNow request for the user's role-based Entra ID group."},
    {"style": "h2", "text": "How access is approved"},
    {"style": "body", "text": "Auto-approval where the user is in the AVD-eligible HR feed. Otherwise manager approval routes through Digital Operations."},
    {"style": "h2", "text": "How access is provided"},
    {"style": "body", "text": "Entra ID group membership grants assignment to the AVD application group. Conditional Access policy enforces device compliance and MFA."},

    {"style": "h1", "text": "Deployment"},
    {"style": "body", "text": "AVD session host pool is built and patched via Nerdio. Users do not have a deployment per se; they reach the desktop via the Windows App on any compliant device."},

    {"style": "h1", "text": "Escalation Path for Support"},
    {"style": "bullet", "text": "Service Desk support scope: account access, profile sign-in issues, basic Windows App troubleshooting."},
    {"style": "bullet", "text": "First escalation point: Digital Operations (AVD Operations team)."},
    {"style": "bullet", "text": "Second escalation point: Digital Transformation & Architecture (host pool / image owner)."},

    {"style": "h1", "text": "Known Issues"},
    {"style": "h2", "text": "Issue 1 – Windows App will not sign in"},
    {"style": "bullet", "text": "Identify: user reports the Windows App returns to the sign-in screen after entering credentials."},
    {"style": "bullet", "text": "Fix: confirm device compliance state in Intune. If non-compliant, run remediation and re-sync."},
    {"style": "h2", "text": "Issue 2 – Slow session start"},
    {"style": "bullet", "text": "Identify: user reports >2 minutes to reach desktop on first login of the day."},
    {"style": "bullet", "text": "Fix: check FSLogix profile container status. If profile is on the failover share, escalate to Digital Operations."},

    {"style": "h1", "text": "Summary"},
    {"style": "body", "text": "AVD Standard User SOE delivers the APM SOE as a cloud session. Service Desk owns access and basic Windows App support. Escalate session-host and profile issues to Digital Operations."}
  ]
}

```
