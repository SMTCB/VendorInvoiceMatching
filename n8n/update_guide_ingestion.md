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

## 3. Save to Supabase (THE BEST WAY: PostgreSQL Node)
- **Why:** Your n8n version lacks the "Upsert" operation. Using branching (IF nodes) is very error-prone with UUIDs. The **PostgreSQL** node is much faster and more robust.
- **Node:** Add a **PostgreSQL** node after the **Basic LLM Chain**.
- **Operation:** `Execute Query`
- **Query:** 
```sql
INSERT INTO invoices (
  invoice_number, 
  po_reference, 
  vendor_name_extracted, 
  total_amount, 
  google_file_id, 
  status
) VALUES (
  '{{ $json.invoice_number }}', 
  '{{ $json.po_reference }}', 
  '{{ $json.vendor_name }}', 
  {{ $json.total_amount || 0 }}, 
  '{{ $node["Google Drive Trigger"].json["id"] }}', 
  'PROCESSING'
) 
ON CONFLICT (google_file_id) 
DO UPDATE SET 
  invoice_number = EXCLUDED.invoice_number,
  vendor_name_extracted = EXCLUDED.vendor_name_extracted,
  total_amount = EXCLUDED.total_amount,
  updated_at = NOW();
```

---

## Alternative: Save to Supabase (Branching Way)
- **Critial Fix for "UUID undefined" Error:** This error happens if you manually execute the node OR if the IF node sends `undefined` to a UUID field.
- **Steps:**
  1. **Get a row Node:** Set "Always Output Data" to ON in Settings.
  2. **IF Node:** Condition `{{ $node["Get a row"].json["id"] }}` is not empty.
     - > [!IMPORTANT]
     - > **NODE NAME:** Must match exactly. Use `$node["Get a row"]`.
  3. **Update Node (True Branch):** 
     - Only runs if ID exists.
     - **Select Conditions:** `id` equals `{{ $node["Get a row"].json["id"] }}`.
     - > [!CAUTION]
     - > If you manually click "Execute Step" here while looking at a new invoice, it will fail with "undefined" because `Get a row` has no ID to give! Test with a full workflow run.

## 4. NEW NODE: Move Processed File
- **Goal:** Clean up the inbox.
- **Action:** Add a **Google Drive** node at the very end.
  - **Resource:** `File`
  - **Operation:** `Move`
  - **File ID:** `{{ $node["Google Drive Trigger"].json["id"] }}`
  - **Parent Folder:** Use `By ID` and set to `10_Y_bu9Cz99MataERG6ylQEi6Zec7Ht-` (your Processed folder).
