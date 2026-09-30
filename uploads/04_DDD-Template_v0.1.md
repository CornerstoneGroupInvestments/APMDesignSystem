
# Detail Design Document

**Template V0.1**

| Project Name: |  |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture,  <br> Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: |  |
| Division/Unit: |  |
| Document Status: |  |
| Document Version: |  |
| Product ID: |  |
FOR INTERNAL USE ONLY
Commercial in confidence
© APM

**Document control**

**Version History**

| Version | Date | Author | Key changes |
| --- | --- | --- | --- |
| V0.1 |  |  |  |
|  |  |  |  |
Consultation

| Name | Position title | Date |
| --- | --- | --- |
|  |  |  |
|  |  |  |
References and Derivation

| Version # | Document Title | Reference Location |
| --- | --- | --- |
|  |  |  |
|  |  |  |
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
The purpose of this document is to provide a high-level logical architecture view of the implementation of initiative for << Project>> and related Integration Components and to define any Services required which will be implemented to allow satellite systems to integrate and coexist with inherent eco system. Services are also mapped to requirements (Business Use Cases) as part of this document.
This document will form the basis on which Technical Design document (TDD) for each distinct solution component can be prepared.
The aim of this document is to:
1.	Outline the business requirements currently identified
2.	Describe the logical architecture to meet those requirements
3.	Describe the physical architecture to meet those requirements
4.	Describe the solution decisions that have been made with the business requirements in mind and their implications. Though Functional requirements that are partially or fully enabled by solution design (vs tool capabilities) will be considered in this document, Non-functional requirements driven by service tiering and business will be addresses as well.
5.	Outline data and cyber security requirements and policies & controls to adhere and meet APM cyber security guidelines and standards

### 1.2 Audience
The primary audience for the use of this document are APM’s Digital delivery, Digital operations, Cyber security, Information architecture team and project teams responsible for development/build, integration development, support, and maintenance. However, in order to build a framework that will support the business needs of APM, it is critical that the business owners and business operations staff be involved in the development of the framework, especially from the perspective of identifying the business requirements that are driving the development of the framework.
This includes:
Business Sponsor,
Business Partners,
Project Management office,
Digital Transformation & Architecture,
Digital Operations
Digital Delivery
Cyber Security
And wider Digital teams.

## 2. Overview
<< Insert a description for the solution/product providing high level context and background for the using business friendly language and terms. >>

### 2.1 Scope
<<Insert a statement that explains the business scope including capabilities, process, people, that is impacted directly or indirectly by this initiative.
What part of the business will this solution/product impact at the high level?
Overlay of Business Capability Model to demonstrate impacted business areas, capabilities with heatmap
Clearly outline items that are our-of scope and remediation

### 2.2 Guiding Principles
The Guiding Principles are a set of key statements and ideas that drive how elements of the project will be designed, implemented, and operated. These principles are contextualised focusing on the project deliver aligning to the project/program success criteria

### 2.3 Assumptions
<<Outline key assumptions  across all the architecture domain(business, Technology, Information & Integration and Cyber) made while conceptualisation of the solution>>

## 3. Business Architecture
<<The solution/product is a response to target business outcomes. These business outcomes are defined as part of the business architecture (BA).
Explain how the solution/product supports the business architecture, calling out any objectives and target business outcomes — consistent use of business terms from an accepted glossary is advised. At minimum provide a description of the business capabilities impacted and how these and related BA models need to change to address target business outcomes. Provide a clear link from the BA required transformation to the solution/product.
However, the scope of your solution/product architecture will determine the scope of the BA to be documented.
For advice and guidance on BA and deliverables review Tool: Business Architecture Activities and Deliverables Close the Strategy-to-Execution Gap.
Ensure the BA documentation (diagrams, tables, inventories and, presented conforms to standard notations and formats. Where possible, reuse BA documentation that might reside in a central repository.

### 3.2 Business Reference architecture
<<Insert Business Reference architecture to articulate Business capabilities impacted, uplift expected, Values streams and business process enhanced or impacted as result of this initiative.>>
This is a reference from Design definition .This is a reference from Design definition
For advice and guidance on BA and deliverables review Tool: Business Architecture Activities and Deliverables Close the Strategy-to-Execution Gap.
Ensure the BA documentation (diagrams, tables, inventories and, presented conforms to standard notations and formats. Where possible, reuse BA documentation that might reside in a central repository.

### 3.3 Business Requirements
<<Include architectural significant business requirements and gap analysis with the scope and high-level requirement traceability (met/Not met). Provide the link to business requirements document as a reference
Separate Functional and non-functional requirements to traceability and analysis.

### 3.4 Gap treatment
<<Insert  the gap treatment agreed with business to address all the requirement which are not met with solution recommended>>

## 4. Application Architecture
<<Insert a description of the application architecture required for the solution/product. This description should include an explanation of the system and its components, including all applications and services that need to be integrated with the target solution/product. This section should describe the application architecture required to meet business and data transformation requirements, including data flows and interfaces to other applications and services.
The description should clearly identify new investments in solution/product components such as the purchase of new software and/or technology components. The rationale for investing in new software or services over the reuse of existing solutions should be included. See The Must-Have Components of Procurement Technology Business Cases.
Existing components that need to be changed should also be identified and the changes explained.
If the enterprise application policy is “buy vs build,” and the recommendation is to “build,” then the business case should be included in these sections via a high-level statement and a link to the complete business case document.
Include references to architecture documentation frameworks that are required by your enterprise. Examples can include:
4+1 View Model — uses five different views (Logical, Development, Process, Physical and Scenarios) to describe software architecture.
C4 Model — uses four levels of diagrams (System Context, Container, Component and Code) to describe software architecture.
Views and Beyond — is a comprehensive approach to architecture documentation that incorporates multiple types of information.>>
The scope of your solution/product will determine what application architecture documentation will be required.
At a minimum, the following sections should be documented:
For each of the sections, ensure:
Standard naming conventions, notations, formats and reference data are used.
Diagrams and inventories are reused from central repositories, and any changes are reflected in central repositories following change management processes.>>

### 4.1 System Context Diagram
<<A system context model diagram that shows how the current and target solution/product interacts with other systems and services. This diagram should be in logical format and at high-level and should not detail any solution/product/interface components. Roles and processes, internal and external can be included.>>

### 4.2 Solution/Product Component Inventory
<<An inventory of all solution/product components in scope. Where possible, this inventory should follow existing standards and document mandatory solution/product component reference data and IDs.
Clearly identify the components that are new and/or will require changes.>>
This should include solution version, licensing information.

### 4.3 Solution Interface Diagram
<<A diagram showing all solution/product components of type application and service, including all detailed interfaces. The diagram should follow accepted naming conventions for all objects, components and interfaces, referencing the correct master IDs and data in section 5.2 above.>>

### 4.4 Solution/Product Interface catalogue
<<Provide an inventory of all solution/product component interfaces in scope. This inventory should follow existing naming standards and document mandatory solution/product component interface reference data and IDs, including data flows, interface patterns (e.g., ETL, File Transfer etc.), interface technologies and services used, such as API Management by Vendor YYYY, ETL product by vendor YYYY.>>

## 5. Technology Architecture
<<Insert a description of the technology architecture required for the solution/product. This description should include an explanation of the technology reference model (TRM) and the components required to deploy the solution/product into production environment. A description of the DevOps environment can be included to help the reader understand how the solution/product assets will be developed and released into product, including Dev/Test environments. Figure 2 provides an example TRM . >>

### 5.1 Technology Component Standards
<< For the scope for the solution/product architecture, insert an inventory of the technology component standards naming the vendors’ products providing each technology component. The inventory should include all technology components for each of the applicable TRM domains using the enterprise standard naming conventions and notations. See Reference Architecture Implementation Guide.
Ensure the inventory of technology components references any central repositories and uses records within these repositories to document the inventory. The approved status of each technology component should be listed, making it clear what components are approved, under-review or new. Any classification status for approved that allows the limited use of a technology component under specified conditions should also be documented. For example, approved for region, country and use case YYYY.
•	Complete the technology component standards list for each for your organizations TRM domains. The below provides an example list.
•	List any policies, controls (NIST Control Framework for Security), standards and/or use case limits for each of the domains.>>

### 5.2 Integration standards and patterns
.
<< Insert details. See the following for guidance and examples:
Choosing Application Integration Platform Technology
Decision Point for Mediating API and Microservices Communication
>>

### 5.3 Network & Infrastructure Standards & Patterns
<< Insert details. See the following for guidance and examples:
How to Architect Your WAN for Hybrid Cloud and Multicloud
Optimize WAN Architectures for Workloads That Span the Hybrid Cloud and the Multicloud
What Are the Key Factors to Consider When Choosing a Cloud Data Management Architecture?
Infrastructure for Technical Professionals Primer for 2023
Number of environments and technology components available in those environments

### 5.4 Technology component Deployment Patterns
<< Insert a description of the technology component deployment pattern for the solution/product architecture. Indicate whether the pattern is approved and standard or to be updated as a result of this solution/product architecture. See the following for guidance and examples:
A Guidance Framework for Deploying Data and Analytics in the Cloud
Guidance Framework for Deploying Centralized Log Monitoring
Using ‘Policy as Code’ to Secure Application Deployments and Enforce Compliance
Designing and Operating DevOps Workflows to Deploy Containerized Applications With Kubernetes
Quick Answer: How Can I Optimize the Use of Programmable Platforms for Effective Software Delivery?
Solution Path for Cloud-Native Infrastructure With Kubernetes
>>

## 6. Information & Data Architecture

### 6.1 Information Model
<< Insert details of Conceptual Data model including reference to product specific data model if any available>>

### 6.2 Information Classification
<< Insert data classification for all the conceptual data elements identified aligning to APM data classification standards>>

### 6.3 Analytics and reporting Patterns
<< Insert details of Solution for Building Modern Analytics and BI Architectures to meet APM business requirements. >>

## 7. Cyber & Security Architecture
<< Insert details of policies, control and procedures adopted to meet the requirements as described in patterns in section above. Along with this if there is a gap to be addressed as part of current Cyber standard, outline the proposed controls, policies and procedures to be implemented.
Topics to be covered but not limited to Identity (User, application, integration)
Data and Network policies
User accessibility and controls
Device protection
Data Sovereignty
Encryption
>>

## 8. Service Availability and Disaster Recovery

### 8.1 Business Service Tiering
<< This should align and driven by  Non-functional requirement captured >>

### 8.2 Service Availability
<< This should align and driven by business Service tiering >>

### 8.2 Disaster recovery & Resilience
<< Insert details. See the following for guidance and examples:
Quick Answer: Build Network Resilience to Counter the Risks of Sabotage
Designing Availability and Resilience for Applications in Public Cloud IaaS and PaaS
IT Resilience — 7 Tips for Improving Reliability, Tolerability and Disaster Recovery
Fundamental Elements of Business Continuity Management: Third-Party Risk and Contingency Management
>>

## 9. Service Management

### 9.1 Service Management principles

### 9.2 Monitoring, Logging, Reporting and Alerting