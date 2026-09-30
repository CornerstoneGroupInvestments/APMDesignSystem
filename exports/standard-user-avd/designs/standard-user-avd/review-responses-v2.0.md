# Review responses - Standard User SOE on AVD

Reviewer: Michael Webster. Reviewed build: V1.0, `history/APM_Detail_Design_Standard_User_AVD_V1.0_reviewed.docx`, 11 comments. Actioned in V2.0.

| # | Comment | Where it landed | Action taken in V2.0 |
|---|---|---|---|
| 1 | "This sounds very AI can we reword" | 1.1 Purpose | Purpose rewritten. The paragraph listing "four positions a reviewer is most likely to challenge" is removed. Section 7 states the position and the controls, with no framing of what a reviewer might argue |
| 2 | "25H2" | 2. Overview, benchmark sentence | Session host operating system is stated as Windows 11 Enterprise multi-session, current Enterprise release (25H2), in 5.1.1. The hardening standard's own benchmark inconsistency is raised as G-07 rather than picked |
| 3 | "Why is this out of scope?" | 2.1 Scope, mapped network drive | Mapped network drive access is now **in scope**. BR-06 is a Must requirement, 5.4.5 specifies the path for each of the three candidate back ends, and the back end itself is G-01 |
| 4 | "More AI language, can it be worded in APM language such as will be deployed in Stratus Landing zone" | 2.2 Guiding Principles | Principle reworded to "Deploy into the landing zone, do not fork it". The landing zone is named the **APM Azure landing zone** consistently throughout. Principle count reduced from eight to six |
| 5 | "Has the vnet and IP range already been reserved for user AVD" | 2.3 Assumptions, A-03 | No. Corrected. The design no longer asserts an existing range. A-03 is now an allocation dependency, G-02 is the open item, and the subnet plan in 5.3.2 is expressed as offsets inside whichever /23 is issued. Figures 1 and 3 re-cut |
| 6 | "What does this have to do with AVD?" | 2.3 Assumptions, laptop compliance policy | Assumption removed |
| 7 | "Why?" | 2.3 Assumptions, unmanaged endpoint impact | Sentence removed. The unmanaged endpoint position is stated once, in section 7, as configuration: two desktop application groups, one per redirection posture |
| 8 | "Instead of 7 call out the section by title" | 2.3 Assumptions, A-09 | Every cross-reference is now written as `[[n.n]]` in the source, which the builder resolves to the section number **and its name** as a live hyperlink. 58 cross-references, all resolved at build |
| 9 | "Is the current solution capable of printing to a home printer - I would of thought it was not" | 3.3 Requirements, printing | Home printing is out of scope. BR-07 and DR-013 are printing to APM site printers only, by client-side printer redirection. 5.4.6 states plainly that home printers are not APM-managed and no driver set is maintained for them |
| 10 | "We are not using Australia South East" | 3.3 Requirements, second region | Requirement removed. Every Australia South East reference removed. DR-007 records Australia East as the only region. 8.2 states that a regional failure is recovered by falling back to the laptop channel |
| 11 | "Why is this not confirmed" | 3.4, mapped drive back end | 3.4 is rewritten as an eight-item register with an action, a named owner and a date needed by against each. Nothing is left as an unexplained "not confirmed" |

## Other changes in V2.0

- Rebuilt on the APM Detail Design Document template exactly: 33 headings in the master's own order, including its numbering (3.2 with no 3.1, section 7 with no subsections, two 8.2s). Sections that do not apply keep their heading and state N/A: 5.2 and 6.3
- Decision Register and Test Environment moved to Appendix A and Appendix B, because the template carries neither as a numbered section
- Identity model changed to Entra ID join, cloud only, with no ADFS dependency (DR-003). The hybrid position of the current estate is G-03
- Hardening standard inheritance now states all 11 policies by Intune profile name with control counts from the standard, and the position of each on a session host
- Varied controls reduced from six to five and re-mapped to the real policies (SOE-01 to SOE-05)
- Assumptions reduced from 13 to 8. Requirements reduced from 13 to 12. Decisions reduced from 19 to 18
