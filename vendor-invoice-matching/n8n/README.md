# n8n Workflow Setup

This directory contains helper scripts for the n8n orchestration.

## Prerequisites
1.  **n8n Installed**: Local or Cloud.
2.  **Supabase Credentials**: Configured in n8n Credentials.
3.  **OpenAI/Gemini API Key**: For the AI Agent node.
4.  **Google Drive**: Connected for file watching.

## Workflow 1: Ingest & Match
**Trigger**: Google Drive (File Created in `01_INBOX`)

1.  **Move File**: Move to `02_PROCESSING`.
2.  **AI Extract (OpenAI/Gemini)**:
    *   System Prompt: "Extract Vendor, PO Number, Date, Total, and Line Items (SKU, Qty, Price) from this invoice."
    *   Output: JSON.
3.  **Supabase Lookup**:
    *   Query `ekko` / `ekpo` using extracted `po_number`.
    *   Query `mseg` (GR) using `po_number`.
    *   Query `learning_examples` using `vendor_name/id`.
4.  **Code Node (Matching Logic)**:
    *   Copy/Paste the content of `matching_logic.js` into this node.
    *   It inputs the AI data + SAP data and outputs a `status`.
5.  **Supabase Save**:
    *   Insert into `invoices` table with the determined status.

## Workflow 2: User Actions
**Trigger**: Webhook (POST)

1.  **Webhook Node**: Receives `{ invoiceId, action, status }` from Next.js.
2.  **Switch Node**:
    *   **Case POST**: Update `invoices` status to `POSTED`. Move Drive file to `03_ARCHIVE`.
        *   **Learning**: IF original status was BLOCKED, insert into `learning_examples`.
    *   **Case REJECT**: Update `invoices` status to `REJECTED`. Move Drive file to `04_EXCEPTIONS`.
