# n8n Ingestion Workflow: Manual Update Guide

Follow these steps to update your ingestion workflow for robust data extraction and duplication prevention.

## 1. Google Drive Trigger
- **Goal:** Ensure we track the file ID.
- **Action:** Open the node and confirm `folderId` is set to your "Inbox" folder.
- **Keep Output:** Ensure the node outputs the `id` of the file.

## 2. Gemini Parser (Prompt Update)
- **Goal:** Ensure JSON output is strictly formatted.
- **Prompt Update:** Replace your existing prompt with this:
```text
You are an expert AP Auditor.
EXTRACT the following fields from the raw OCR text below and return strictly valid JSON.

Fields:
- invoice_number (string)
- po_reference (string)
- vendor_name (string)
- total_amount (number)
- invoice_date (YYYY-MM-DD)
- currency (USD/EUR)

OCR TEXT:
{{ $json.stdout }}

IMPORTANT: RETURN ONLY THE JSON OBJECT. NO MARKDOWN BACKTICKS. NO DISCOUSE.
Example: {"invoice_number": "INV-123", ...}
```

## 3. Save to Supabase (Idempotency & Mapping)
- **Goal:** Use "Upsert" to prevent duplicates and link the File ID.
- **Action:**
  - **Operation:** Change from `Insert` to `Upsert`.
  - **On Conflict Column:** Set to `google_file_id`.
  - **Mapping:** Update the columns to:
    - `invoice_number`: `{{ $json.invoice_number }}`
    - `po_reference`: `{{ $json.po_reference }}`
    - `vendor_name_extracted`: `{{ $json.vendor_name }}`
    - `total_amount`: `{{ $json.total_amount }}`
    - `google_file_id`: `{{ $node["Google Drive Trigger"].json["id"] }}`
    - `status`: `PROCESSING`

## 4. NEW NODE: Move Processed File
- **Goal:** Clean up the inbox.
- **Action:** Add a **Google Drive** node after "Save to Supabase".
  - **Resource:** `File`
  - **Operation:** `Update`
  - **File ID:** `{{ $node["Google Drive Trigger"].json["id"] }}`
  - **Parent IDs:** Delete the inbox folder ID and add `10_Y_bu9Cz99MataERG6ylQEi6Zec7Ht-` (your Processed folder).
