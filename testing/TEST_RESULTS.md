# Test Results Registry

Use this file to track the outcome of the structured testing phase.

| Date | Scenario ID | Status | AI Audit Trail Observation | Notes |
|---|---|---|---|---|
| 2026-02-17 | C1-001 | [PASS] | N/A (Ingestion only) | Webhook triggered successfully. Record created in DB. |
| 2026-02-17 | C1-002 | [PASS] | N/A (Ingestion only) | OCR correctly extracted "TechGap Solutions" and "$500.00". |
| 2026-02-17 | C1-003 | [PASS] | N/A | File moved to PROCESSED folder successfully. |
| 2026-02-17 | C2-001 | [PASS] | "Invoice matches the PO data... READY_TO_POST" | **UAT SUCCESS.** End-to-end flow confirmed. |
| 2026-02-17 | C2-002 | [PASS] | "Invoice unit price is $55, while PO unit price is $50... BLOCKED_PRICE" | **UAT SUCCESS.** Price variance correctly detected and blocked. |
| 2026-02-17 | C2-003 | [PASS] | "Invoice quantity (15) exceeds PO quantity (10)... BLOCKED_QTY" | **UAT SUCCESS.** Qty variance correctly detected. |
| 2026-02-17 | C3-001.1 | [PASS] | "Invoice quantity is 5, while the PO ordered quantity is 10. Since 5 <= 10, it's a valid partial delivery." | **UAT SUCCESS.** Partial delivery accepted as READY_TO_POST. |
| | C3-002 | [ ] | | |
| | C4-001 | [ ] | | |
| | C5-001 | [ ] | | |

## Execution Log Details

### [C1-001] Google Drive Watchdog
- **Outcome:** 
- **Observations:** 
- **Screenshots:** 

---
*(Add new logs below)*
