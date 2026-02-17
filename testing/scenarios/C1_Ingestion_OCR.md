# Cluster C1: Ingestion & OCR

Verify that the platform accurately discovers PDFs, converts them for processing, and extracts structured data using LLM extraction.

## C1-001: Platform Webhook Trigger
- **Goal:** Confirm n8n Workflow 1 triggers via Webhook from the App UI.
- **Test Data:** Any PDF invoice uploaded via the "Document Hub".
- **DB Requirements:** None.
- **PDF Requirements:** Standard text-based PDF.
- **Success Criteria:** 
    - n8n execution log shows "Workflow 1" starting from a Webhook call.
    - Record appears in `invoices` table with 'PROCESSING' status.

## C1-002: Tesseract OCR Accuracy (Complex Layout)
- **Goal:** Verify extraction of line items from a complex grid (varied fonts/layouts).
- **Test Data:** Generated PDF with intentionally difficult-to-read segments.
- **DB Requirements:** None.
- **PDF Requirements:** A PDF with multi-column layouts, mixed fonts (Serif/Sans), and a line-item table with thin borders.
- **Success Criteria:** `invoices` table contains correct `total_amount` and `vendor_name_extracted`.

## C1-003: Post-Processing File Movement
- **Goal:** Ensure the file is moved to the "PROCESSED INVOICES" folder in GDrive after completion.
- **Test Data:** New file upload.
- **DB Requirements:** None.
- **Success Criteria:** 
    - Original file is no longer in the Ingestion folder.
    - File is successfully found in the `PROCESSED_FOLDER_ID` specified in n8n.

## C1-004: Idempotency (Duplicate Upload Check)
- **Goal:** Ensure the system detects and rejects an invoice with a Google File ID that has already been processed.
- **Test Data:** Re-triggering the webhook with the SAME file ID from C1-001.
- **DB Requirements:** Existing record from C1-001 in `invoices` table.
- **Success Criteria:** 
    - n8n workflow detects the duplicate (via "Search" node).
    - No new record is created in Supabase.
    - Workflow terminates gracefully without error.
