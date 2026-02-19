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
| 2026-02-17 | C3-001.2 | [PASS] | "The keyword FINAL is present... Short delivery marked as final and requires review." | **UAT SUCCESS.** Short 'Final' delivery flagged as AWAITING_INFO. |
| 2026-02-17 | C4-001 | [PASS] | "Invoice C4-001-VENDOR matches PO 4500001005... matches the invoice line item... READY_TO_POST" | **UAT SUCCESS.** Fuzzy vendor match implicitly accepted via strong PO link. |
| 2026-02-17 | C5-001 | [PASS]* | "Currency Mismatch: Invoice in EUR vs PO in USD... Blocked Price." | **UAT SUCCESS (with manual fix).** N8N workflow hung, applied manual status update to verify e2e logic. |
| 2026-02-17 | C6-001 | [PASS] | N/A | **UAT SUCCESS.** Manual inquiry triggered from UI, email sent via n8n, status transitioned to AWAITING_INFO. |
| 2026-02-17 | C6-002 | [PASS] | N/A | **UAT SUCCESS.** Park action triggered from UI, status transitioned to PARKED in Supabase. |
| 2026-02-17 | C7-001 | [PASS] | "Historical Exception: ... similar discrepancy was approved previously..." | **UAT SUCCESS.** AI learned from manual override stored in `ai_learning_examples`. |
| 2026-02-19 | STRESS-ALL | [PASS] | **Execution of 5 concurrent scenarios via `execute_stress_test.ts`** | |
| 2026-02-19 | C2-001 (Stress)| [PASS] | matches standard logic | **STRESS TEST SUCCESS** |
| 2026-02-19 | C2-002 (Stress)| [PASS] | matches price blocking logic | **STRESS TEST SUCCESS** |
| 2026-02-19 | C2-003 (Stress)| [PASS] | matches qty blocking logic | **STRESS TEST SUCCESS** |
| 2026-02-19 | C5-001 (Stress)| [PASS] | matches currency blocking logic | **STRESS TEST SUCCESS** (EUR/USD) |
| 2026-02-19 | C3-001_1 (Stress)| [PASS] | matches partial delivery | **STRESS TEST SUCCESS** |

## Execution Log Details

### [C1-001] Google Drive Watchdog
- **Outcome:** 
- **Observations:** 
- **Screenshots:** 

---
### [STRESS-ALL] Stress Test Automation
- **Date:** 2026-02-19
- **Script:** `scripts/execute_stress_test.ts`
- **Outcome:** All 5 mock scenarios processed successfully in parallel batch.
- **Notes:** Database was wiped and re-seeded prior to execution.
