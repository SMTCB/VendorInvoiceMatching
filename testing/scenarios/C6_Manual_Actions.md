# Cluster C6: Manual Controller Actions

Verify that human-triggered actions (Email, Park) from the UI correctly execute their respective automation flows.

## C6-001: Trigger Inquiry Email
- **Goal:** Verify that clicking "Send Inquiry" in the UI triggers the n8n email loop.
- **Test Data:** Any flagged invoice.
- **Dependencies:** `handleSendInquiry` function in the UI.
- **Success Criteria:** 
    - n8n execution log shows the "Email Inquiry" workflow triggered.
    - Payload contains correct `invoice_id`, `vendor`, and `exception_reason`.

## C6-002: Trigger Park Invoice
- **Goal:** Confirm that "Park" updates the invoice status in the DB.
- **Test Data:** Any invoice.
- **Success Criteria:** 
    - `invoices.status` changes to `PARKED` in the database.
    - Audit log (if implemented) records the action.
