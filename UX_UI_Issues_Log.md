# UX/UI Issues Log

This document tracks the identified UI/UX issues for the Vendor Invoice Matching Platform, their current status, and correction roadmap.

## Issue Tracking Table

| Section | Issue Description | Status | Correction/Notes |
| :--- | :--- | :--- | :--- |
| **CONTROLLER** | Some statuses have identical color codes (e.g., Parked and Blocked Duplicate). | ⏳ Pending | Assign unique colors to all status codes. |
| **CONTROLLER** | Add help tooltips next to each status with explanations. | ⏳ Pending | Implement icon (?) with hover explanation. |
| **CONTROLLER** | Fix pipeline statistics alignment and replace "Liquidity Impact" with "Others". | ⏳ Pending | Ensure all invoices are accounted for in the metrics. |
| **INVOICE DETAILS** | Invoice preview is not working. | ⏳ Pending | |
| **INVOICE DETAILS** | AI Insight window (agent decision) lacks plain English explanation. | ⏳ Pending | Review prompts/presentation for clarity. |
| **INVOICE DETAILS** | AI Insight & Policy Check needs plain English review. | ⏳ Pending | |
| **INVOICE DETAILS** | UI missing 3-way match data used by the agent. | ⏳ Pending | Show Invoice vs PO vs GR data clearly for validation. |
| **INVOICE DETAILS** | "Send Vendor Inquiry" returns an error. | ⏳ Pending | Debug and fix the email sending feature. |
| **INVOICE DETAILS** | "Train AI on this match" does not update the table. | ⏳ Pending | |
| **INVOICE DETAILS** | Tab "AI Insight Agent" should be a chat interface. | ⏳ Pending | Implement LLM chat for invoice-specific queries. |
| **INVOICE DETAILS** | Remove redundant buttons (Variance Report, Vendor Risk, etc.). | ⏳ Pending | |
| **INVOICE DETAILS** | "Park" button should toggle to "Release" when parked. | ⏳ Pending | |
| **INVOICE DETAILS** | Remove "Send Inquiry" button (redundant). | ⏳ Pending | |
| **INVOICE DETAILS** | Status should change when sending email; add manual revert button. | ⏳ Pending | |
| **ANALYSIS** | Remove "Processing volume trend" graph. | ⏳ Pending | |
| **ANALYSIS** | Remove "Total liquidity managed" metric. | ⏳ Pending | |
| **ANALYSIS** | Add "Manual Overwrites" (User vs AI Decision) metric. | ⏳ Pending | |
| **ANALYSIS** | Add "Classified by special AI rules" count. | ⏳ Pending | |
| **ANALYSIS** | Add "Number of learning examples" count. | ⏳ Pending | |
| **ANALYSIS** | Add "Vendors with most discrepancies" overview. | ⏳ Pending | |

## Correction Roadmap

### Phase 1: Controller & Analysis Cleanup
- Fix status colors and tooltips.
- Reorganize dashboard metrics.
- Remove unwanted Analysis graphs and metrics.

### Phase 2: Invoice Detail View - Functional Fixes
- Fix Invoice Preview.
- Fix Email sending feature.
- Implement Park/Release toggle.
- Fix "Train AI" and table updates.

### Phase 3: Invoice Detail View - Information & AI
- Rewrite AI Insight window to plain English.
- Add 3-way match data visibility.
- Transform "AI Insight Agent" into a chat interface.

### Phase 4: Analysis - New Metrics
- Implement logic to track and display new platform-centric metrics.

## Test Tracking

*Tests will be recorded here or in a separate file (e.g., `UX_UI_Test_Log.md`).*
