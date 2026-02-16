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
- **Why:** Your n8n version lacks the "Upsert" operation. Branches (IF nodes) are error-prone.
- **Node to ADD:** Add a **PostgreSQL** node.

### 🛑 NODES TO DELETE:
Delete these four nodes to clean up your workflow:
1. **Get a row**
2. **If**
3. **Update Supabase**
4. **Save Supabase** (Create)

### 🔗 NEW CONNECTIONS:
- **PREVIOUS NODE:** Connect the output of **Basic LLM Chain** to the **PostgreSQL** node.
- **NEXT NODE:** Connect the output of the **PostgreSQL** node to the **Move file** node.

### ⚙️ PostgreSQL CONFIG:
- **Operation:** `Execute Query`
- **Credentials:** Create a new **PostgreSQL** credential.
- **Mapping from Supabase:**
  Go to your **Supabase Dashboard** -> **Project Settings** -> **Database**. 
  
  > [!IMPORTANT]
  > **CONNECTION METHOD:** Choose **Transaction pooler** (and set Mode to **Session**). 
  > This is crucial because **Direct connection** is often IPv6-only, which can cause connection errors in n8n. The Transaction pooler provides an IPv4-compatible host.

  Use these values from the **Transaction pooler** section:
  - **Host:** Copy the host provided (it usually starts with `aws-0-...`)
  - **Database:** `postgres`
  - **User:** `postgres`
  - **Port:** `6543` (Note: Pooler usually uses 6543, while Direct uses 5432)
  - **Password:** Your project password.
  - **SSL:** Set to **ON**.
  - **Ignore SSL Issues (Insecure):** Set to **ON**.
    > [!IMPORTANT]
    > **SSL FIX:** If you see a "self-signed certificate" error, you **must** toggle "Ignore SSL Issues (Insecure)" to **ON**. This allows n8n to trust Supabase's certificate.

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

## 4. NEW NODE: Move Processed File
- **Goal:** Clean up the inbox.
- **Action:** Add a **Google Drive** node at the very end.
  - **Resource:** `File`
  - **Operation:** `Move`
  - **File ID:** `{{ $node["Google Drive Trigger"].json["id"] }}`
  - **Parent Folder:** Use `By ID` and set to `10_Y_bu9Cz99MataERG6ylQEi6Zec7Ht-` (your Processed folder).

## 5. NEW NODE: Trigger Matching (Optional for Real-Time)
- **Goal:** Immediately move to the "Matching" phase without waiting for the 1-minute poller.
- **Action:** Add an **Execute Workflow** node at the very end.
  - **Workflow ID:** Select **02_Matching_Smart_Judge**.
  
  > [!IMPORTANT]
  > **CAN'T SEE WORKFLOW 2? (CHOOSE THE RIGHT NODE)** 
  > There are two nodes with similar names. You **must** use the **Trigger** version in Workflow 2.
  > 
  > 1. In **02_Matching_Smart_Judge**:
  >    - **DELETE** the "Execute Workflow" node (the one with the arrow pointing into a bracket `->]`). That is for *calling* other workflows.
  >    - **ADD** the **Execute Workflow Trigger** node (the one that looks like a play button in a circle). This node has **ZERO parameters** to fill in—it just acts as an entry point.
  >    - **Connect it** to the **Get Processing Invoices** node.
  >    - **Save** the workflow.
  > 
  > 2. In **Workflow 1 (Ingestion)**:
  >    - Keep the **Execute Workflow** node (the Action node). 
  >    - Now, when you search for "02_Matching_Smart_Judge", it will appear because the trigger is present!

  **Execute Workflow Node Settings:**
  - **Source:** Choose **Local** (if available) or keep **Database**.
  - **Workflow:** Select **02_Matching_Smart_Judge**.
  - **Mode:** `Run once with all items`.
  - **Wait for completion:** Turn **OFF**.
