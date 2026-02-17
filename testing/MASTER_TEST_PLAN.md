# Master Test Plan: AP + AI Intelligence Matching

This document serves as the central registry for all validation scenarios. It is designed to be compatible with future automated testing pipelines.

## Test Clusters

| Cluster ID | Name | Objective | Status |
|---|---|---|---|
| **C1** | Ingestion & OCR | Verify PDF retrieval and data extraction accuracy | [ ] |
| **C2** | Basic Matching | Verify unit price/qty comparison against SAP | [ ] |
| **C3** | Advanced Rules | Verify Fuzzy Vendor matching and Rule injections | [ ] |
| **C4** | AI Learning | Verify historical context (few-shot) application | [ ] |
| **C5** | UI & Traceability | Verify audit trail display and dashboard state | [ ] |

---

## Tracking Matrix

| ID | Goal | Depends On | Result | Date |
|---|---|---|---|---|
| **C1-001** | Platform Webhook Trigger | Webhook URL | | |
| **C1-002** | OCR Accuracy (Complex Layout) | Tesseract | | |
| **C1-003** | File Movement (Processed Folder) | GDrive API | | |
| **C1-004** | Idempotency: Duplicate Upload Check | GDrive ID | | |
| **C2-001** | Perfect Match (Price & Qty) | SAP Table | | |
| **C2-002** | Blocked: Price Variance | | | |
| **C2-003** | Blocked: Over-delivery | | | |
| **C2-004** | Blocked: Under-delivery | | | |
| **C3-001** | Rules: Fuzzy Vendor Match | | | |
| **C3-002** | Rules: Threshold Override | | | |
| **C4-001** | Learning: Approved Discrepancy | | | |
| **C5-001** | UI: Verify Audit Trail & Traceability | | | |
| **C6-001** | Action: Trigger Inquiry Email | Webhook | | |
| **C7-001** | Workflow: Feed Training Feedback | DB | | |

---

## Test Execution Guide

1. **Setup Data:** Ensure the `validator_rules` and `invoices` tables are prepared (Run SQL in [implementation_plan.md](file:///c:/Users/stcbr/.gemini/antigravity/brain/17279c8d-d293-43ab-8063-dafb4643dec9/implementation_plan.md)).
2. **Execution:** Move a PDF into the designated Google Drive folder.
3. **Observation:** Monitor n8n executions and the Intelligence Dashboard.
4. **Logging:** Record ID, Status, and AI Observation in [TEST_RESULTS.md](file:///c:/Users/stcbr/Documents/AI/VendorInvoiceMatching/testing/TEST_RESULTS.md).
