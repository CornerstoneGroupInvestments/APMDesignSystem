# KB-AVD-Standard-User-SOE-Support-Overview


# Knowledge Base Article

**Support Overview – AVD Standard User SOE**
28 May 2026

| Project Name: | Standard User SOE on Azure Virtual Desktop |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.1 |
| Product ID: | KB-AVD-STD-001 |
FOR INTERNAL USE ONLY
Commercial in confidence
© APM

**Document control**

**Version History**

| Version | Date | Author | Key changes |
| --- | --- | --- | --- |
| V0.1 | 28 May 2026 | Digital Transformation & Architecture | Initial draft |
|  |  |  |  |
Consultation

| Name | Position title | Date |
| --- | --- | --- |
| Digital Operations | Operations Lead |  |
| Cyber Security | Cyber Security Lead |  |
References and Derivation

| Version # | Document Title | Reference Location |
| --- | --- | --- |
| V2.0 | Unified SOE Requirements | Digital Transformation & Architecture SharePoint |
| V0.3 | Job Seeker Kiosk Detail Design | Digital Transformation & Architecture SharePoint |
SDA Approval

| Name | Role/Group | Signature | Date |
| --- | --- | --- | --- |
|  |  |  |  |

## Confidentiality & Disclaimer
This document is provided by Advanced Personnel Management International Pty Ltd and / or its related entities (APM) on a confidential basis. This document is subject to approval of the APM Board and does not constitute an offer capable of acceptance. No agreement binding APM or its related companies in respect of this document is intended or proposed unless and until the terms and conditions between APM or its related entities are agreed in writing in a formal agreement with the named Company or Prospective Client.
APM will not be bound by any pricing or any other material contained in this response until the above has taken place.

### Photography
Photographs used in this document are for illustration only 
and should not be interpreted to mean that any person or organisation whose assets are shown in them endorses this document.

## Purpose
To provide Service Desk staff with information required to support the AVD Standard User SOE.

## What Is This?
AVD Standard User SOE is the Azure Virtual Desktop delivery channel of the APM Standard User SOE. Users access a Windows 11 Multi-Session host pool via the Windows App.

## Who Uses It?
Staff requiring a Windows desktop without a corporate laptop, including contractors, BYOD users, and roles where AVD is the assigned delivery channel.

## What Is It Used For?
Standard productivity workloads on the APM SOE delivered as a cloud desktop session.

## Access

### How access is requested
Manager raises a ServiceNow request for the user's role-based Entra ID group.

### How access is approved
Auto-approval where the user is in the AVD-eligible HR feed. Otherwise manager approval routes through Digital Operations.

### How access is provided
Entra ID group membership grants assignment to the AVD application group. Conditional Access policy enforces device compliance and MFA.

## Deployment
AVD session host pool is built and patched via Nerdio. Users do not have a deployment per se; they reach the desktop via the Windows App on any compliant device.

## Escalation Path for Support
Service Desk support scope: account access, profile sign-in issues, basic Windows App troubleshooting.
First escalation point: Digital Operations (AVD Operations team).
Second escalation point: Digital Transformation & Architecture (host pool / image owner).

## Known Issues

### Issue 1 – Windows App will not sign in
Identify: user reports the Windows App returns to the sign-in screen after entering credentials.
Fix: confirm device compliance state in Intune. If non-compliant, run remediation and re-sync.

### Issue 2 – Slow session start
Identify: user reports >2 minutes to reach desktop on first login of the day.
Fix: check FSLogix profile container status. If profile is on the failover share, escalate to Digital Operations.

## Summary
AVD Standard User SOE delivers the APM SOE as a cloud session. Service Desk owns access and basic Windows App support. Escalate session-host and profile issues to Digital Operations.