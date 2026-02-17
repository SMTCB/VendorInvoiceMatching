# Cluster C4: Intelligence Feedback (Few-Shot Learning)

Verify that the AI can learn from historical human decisions and apply that knowledge to similar future cases.

## C4-001: Historical Approval (Few-Shot)
- **Goal:** Confirm AI approves a variance because a human previously approved a similar one for the same vendor.
- **Test Data:** 
    - Historical Case: Vendor "Amazon", Deviation "Service Fee mismatch", Approved by Human.
- **DB Requirements:** 
    - `ai_learning_examples` entry with `vendor_name` / `discrepancy_type` / `action:approved`.
- **PDF Requirements:** New Amazon invoice with a similar "Service Fee" discrepancy.
- **Success Criteria:** 
    - Invoice is `READY_TO_POST`.
    - `audit_trail` says: "Matched based on historical example #881".

## C4-002: Historical Rejection Persistence
- **Goal:** Confirm AI continues to block a discrepancy that was previously rejected by a human.
- **Test Data:** 
    - Historical Case: Vendor "Staples", Deviation "Double Billing", Rejected.
- **DB Requirements:** 
    - `ai_learning_examples` entry with `action:blocked`.
- **PDF Requirements:** New Staples invoice with the same double-billing symptom.
- **Success Criteria:** 
    - Invoice is `BLOCKED`.
    - `audit_trail` cites historical rejection.
