# Artifact 08 - APM KB Template (boilerplate)


# Detail Design Document

**Standard User SOE on AVD**
15 May 2026

| Project Name: | Standard User SOE on Azure Virtual Desktop |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.1 |
| Product ID: | DDD-AVD-STD-001 |
FOR INTERNAL USE ONLY
Commercial in confidence
© APM

**Document control**

**Version History**

| Version | Date | Author | Key changes |
| --- | --- | --- | --- |
| V0.1 | 15 May 2026 | Digital Transformation & Architecture | Initial draft |
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

## 1. Introduction

### 1.1 Purpose
This document provides the detailed technical design for the Standard User SOE delivered through Azure Virtual Desktop (AVD) as part of the APM digital workplace transformation programme. It defines the AVD host pool architecture, Windows 11 Multi-Session golden image, identity and access controls, Intune policy scope, application delivery model, security architecture, and service management approach.
This document extends the existing Entra-joined, Intune-managed laptop SOE into AVD. The intent is one SOE, two delivery channels: a physical laptop, or an AVD session reached via the Windows App. Staff choose the channel that suits the work.
This document builds on APM's existing Standard Laptop SOE policy stack and the AVD foundation already operating for the Job Seeker Kiosk solution. It maps each requirement to its technical resolution and is implementation-ready for the build, pilot, and rollout phases.
The aim of this document is to:
Define the AVD architecture across all architecture domains (business, application, technology, information, and cyber)
Trace business requirements to their detailed technical implementation
Specify the Intune profile scope, Entra ID groups, Conditional Access policies, Nerdio host pool configuration, and FSLogix profile design at build-ready depth
Document design decisions, assumptions, and open items requiring stakeholder sign-off
Outline the implementation sequence, service management model, and operational handover plan

### 1.2 Audience
The primary audience for this document is APM's Digital Delivery, Digital Operations, Cyber Security, and Information Architecture teams responsible for build, integration, support, and maintenance. Business owners and operations staff should be involved in reviewing the business requirements traceability and the user-impact decisions in the Decision Register.
This includes:
Business Sponsor,
Business Partners,
Project Management office,
Digital Transformation & Architecture,
Digital Operations
Digital Delivery
Cyber Security
And wider Digital teams.

## 2. Heading 1

### Heading 2

#### Heading 3

##### Heading 4