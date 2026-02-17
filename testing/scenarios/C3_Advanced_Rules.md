# Cluster C3: Advanced Rules & Fuzzy Matching

Verify that the platform correctly applies dynamic business rules and handles vendor name variations using "Discrete RAG".

## C3-001: Fuzzy Vendor Recognition
- **Goal:** Confirm a rule for "Google" applies to an invoice from "Google Ireland Ltd".
- **Test Data:** 
    - Rule: Name="Search Engine Coverage", Value="Google", Action="auto_approve".
- **DB Requirements:** 
    - `validator_rules` entry with `vendor_name` / `equals` / `Google`.
- **PDF Requirements:** Invoice from "Google Ireland Ltd" with a $1.00 discrepancy.
- **Success Criteria:** 
    - Invoice status is `READY_TO_POST`.
    - `audit_trail` says: "Matched based on rule: Search Engine Coverage".

## C3-002: Advanced Condition (Threshold)
- **Goal:** Verify that a global "High Value" rule flags invoices for review.
- **Test Data:** Invoice total $7,500.
- **DB Requirements:** 
    - `validator_rules` entry: `total_amount` / `greater_than` / `5000` / `flag_review`.
- **PDF Requirements:** Any invoice with Total > $5,000.
- **Success Criteria:** 
    - Invoices status is `AWAITING_INFO` or `FLAGGED`.
    - `audit_trail` cites the high-value threshold rule.

## C3-003: Negative Match (Deactivated Rule)
- **Goal:** Ensure "OFF" rules are ignored by the AI.
- **Test Data:** Matching discrepancy that *would* be covered by a rule if it were active.
- **DB Requirements:** 
    - `validator_rules` entry with `is_active = false`.
- **PDF Requirements:** Discrepancy matching the inactive rule.
- **Success Criteria:** 
    - Invoice is `BLOCKED`.
    - `audit_trail` does NOT mention the inactive rule.
