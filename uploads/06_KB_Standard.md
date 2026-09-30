# APM Internal KB Article Standard (ServiceNow)

Source: APM internal KB article KB0011901 v5.0 — "How to Create Internal Knowledge Base Articles (IT Only)".
Scope: Internal (IT-only) KB articles in ServiceNow. Public (customer-facing) KBs follow a separate standard not covered here.

## Purpose of internal KBs
- Resolve incidents faster
- Provide consistent support outcomes
- Reduce reliance on tribal knowledge
- Improve first-contact resolution

Every article must be clear, concise, and complete — enough for a Service Desk agent to resolve or progress the issue without escalation guesswork.

## Responsibility
- Service Desk: document repeatable fixes as you find them
- Senior engineers / specialists: write KBs for simple repeatable resolutions the Service Desk can run
- Projects and Transitions: produce required KBs in ServiceNow and submit for review/approval before go-live

## Review and publication
Only ServiceNow Knowledge Admins can review and publish. Current admins:
- Jordan Grant
- Sara Tawfik
- the IT Service Lead
- Stacey Herbert
- the Head of Digital Operations

Any drafted article must be submitted for review before publication. Notify an admin once saved.

## Where to create
1. ServiceNow Knowledge Home: https://apmanz.service-now.com/now/nav/ui/classic/params/target/kb%3Fid%3Dkb_home
2. Actions → Internal IT Knowledge Base → Standard → Next
3. Set:
   - Knowledge Base: "IT Internal Knowledge Base"
   - Ownership Group: your ServiceNow team
   - Short Description: same as the article title
4. Write the body to the standards below
5. Meta Tags: individual search terms, comma-separated
   Example for "Service Desk - APM AU & NZ Mobile Phone Support Guide":
   `service,desk,mobile,phone,support,guide,steps,process,au,nz,sim,handset`
6. Save, then contact a Knowledge Admin to review and publish

## Formatting standards
- Font: Verdana
- Title: 24 pt bold
- Heading: 18 pt bold
- Sub-heading: 14 pt bold
- Body: 12 pt

## Mandatory structure
Every article must include Purpose and Summary. Headings and subheadings between them depend on article type.

```
Full Title

Purpose
Body

Heading 1
Body
Subheading
Body

Heading 2
Body
Subheading
Body

Summary
```

## Template A — Application Support KB

```
Support Overview – [Application Name]

Purpose
To provide Service Desk staff with information required to support [Application Name].

What Is This?
Brief description of the application.

Who Uses It?
Roles, teams, or user groups.

What Is It Used For?
Primary business purpose.

Access
- How access is requested
- How access is approved
- How access is provided

Deployment
- How the application is deployed
- Who is eligible for deployment

Escalation Path for Support
- Service Desk support scope:
- First escalation point:
- Second escalation point:

Known Issues
Issue 1
- How to identify the issue
- Fix / Resolution steps
Issue 2
- How to identify the issue
- Fix / Resolution steps

Summary
Short recap and any important reminders.
```

## Template B — Known Issue / Simple Fix KB

```
Known Issue – [Short Description]

Purpose
To document and provide resolution steps for a known issue.

Scenario
Description of how the issue presents and how to identify it.

Fix / Resolution Steps
1. Step one
2. Step two
3. Step three

Related Problem Record
Problem Record: PRBXXXXXX (if applicable)

Summary
Brief confirmation of outcome and escalation guidance if unresolved.
```

## Checklist before submitting for review
- Title matches Short Description
- Knowledge Base set to "IT Internal Knowledge Base"
- Ownership Group set to the correct ServiceNow team
- Purpose section present
- Summary section present
- Headings/subheadings sized correctly (24 / 18 / 14 / 12, Verdana, bold where required)
- Meta tags populated with comma-separated search terms
- Knowledge Admin notified
