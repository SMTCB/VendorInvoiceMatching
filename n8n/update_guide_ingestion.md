# n8n Ingestion Workflow: Manual Update Guide

Follow these steps to update your ingestion workflow for robust data extraction and duplication prevention.

## 1. Google Drive Trigger
- **Goal:** Watch for new files and capture their unique ID.
- **Action:** No special setting needed for "Action" or "Output". n8n triggers automatically output the file `id` once they fire.
- **Reference:** We will use this `id` later in the **Save to Supabase** and **Move Processed File** nodes.

## 2. Download PDF (Regular Google Drive Node)
- **Goal:** Download the binary content for OCR.
- **Action:** Set `Resource` to `File` and `Operation` to `Download`.
- **File ID:** Use an expression: `{{ $json.id }}` (this pulls from the Trigger).

## 2. Basic LLM Chain (Prompt Update)
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

## 3. Save to Supabase (Idempotency Workaround)
- **Problem:** If your n8n version lacks the `Upsert` operation, we will use a "Get then Branch" logic.
- **Steps:**
  1. **Add a Supabase Node (Get):** Before saving, use `Operation: Get` to search table `invoices` where `google_file_id` equals `{{ $node["Google Drive Trigger"].json["id"] }}`.
  2. **Add an IF Node:** Check if the previous node returned any results (`{{ $node["Supabase Get"].json["id"] }}` is not empty).
  3. **True Branch (Update):** Connect to a Supabase node with `Operation: Update`.
     - **Table Name or ID:** `invoices`
     - **Select Type:** `Build Manually`
     - **Must Match:** `All Select Conditions`
     - **Select Conditions:** Click "Add Condition".
       - **Field Name or ID:** `id`
       - **Field Value:** Use an expression: `{{ $node["Supabase Get"].json["id"] }}`
     - **Data to Send:** `Define Below for Each Column`
     - **Fields to Send:** Click "Add Field" for each:
       - `invoice_number`: `{{ $json.invoice_number }}`
       - `vendor_name_extracted`: `{{ $json.vendor_name }}`
       - `po_reference`: `{{ $json.po_reference }}`
       - `total_amount`: `{{ $json.total_amount }}`
       - `updated_at`: `{{ new Date().toISOString() }}`
  4. **False Branch (Create):** Connect to your existing Supabase node with `Operation: Create`.

**Mapping for Create/Update:**
- `invoice_number`: `{{ $json.invoice_number }}`
- `po_reference`: `{{ $json.po_reference }}`
- `vendor_name_extracted`: `{{ $json.vendor_name }}`
- `total_amount`: `{{ $json.total_amount }}`
- `google_file_id`: `{{ $node["Google Drive Trigger"].json["id"] }}`
- `status`: `PROCESSING`

> [!TIP]
> Alternatively, if you have the **PostgreSQL** node installed, you can use a single node with this SQL command:
> `INSERT INTO invoices (invoice_number, po_reference, vendor_name_extracted, total_amount, google_file_id, status) VALUES ('{{ $json.invoice_number }}', '{{ $json.po_reference }}', '{{ $json.vendor_name }}', {{ $json.total_amount }}, '{{ $node["Google Drive Trigger"].json["id"] }}', 'PROCESSING') ON CONFLICT (google_file_id) DO UPDATE SET updated_at = NOW();`

## 4. NEW NODE: Move Processed File
- **Goal:** Clean up the inbox.
- **Action:** Add a **Google Drive** node at the very end.
  - **Resource:** `File`
  - **Operation:** `Update`
  - **File ID:** `{{ $node["Google Drive Trigger"].json["id"] }}`
  - **Parent IDs:** Set to `10_Y_bu9Cz99MataERG6ylQEi6Zec7Ht-` (your Processed folder).
