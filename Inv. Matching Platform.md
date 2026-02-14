# **High-Level Business Process Flow**

## **Intro**

This section outlines the end-to-end journey of an invoice within the platform, mapping business actions to the specific components of the technical stack.

More details will be provided in subsequent sections.

## **Process Diagram (in Mermaid)**

graph TD

    %% Step 1 & 2

    A\[Vendor Uploads PDF\] \--\>|Step 1: Ingestion| B(Google Drive: INBOX)

    B \--\>|Step 2: Trigger| C{n8n Orchestrator}

    

    %% Step 3

    C \--\>|Step 3: OCR| D\[n8n AI Agent: Extraction\]

    

    %% Step 4

    D \--\>|Step 4: Sync| E\[(Supabase: SAP Tables)\]

    

    %% Step 5: Learning Phase 1

    E \--\> F\[Step 5: Contextual Learning Check\]

    L\[(Learning History)\] \-.-\>|Fetch Overrides| F

    

    %% Step 6

    F \--\> G\[Step 6: 3-Way Match Logic\]

    

    %% Step 7

    G \--\>|Step 7: UI| H\[Vercel Dashboard\]

    

    %% Step 8 & 9: Actions

    H \--\>|Post / Override| I\[Step 8: Capture Feedback\]

    I \-.-\>|Save New Rule| L

    I \--\> J\[Step 9: Final Posting & Archive\]

    

    %% Styling

    style F fill:\#f9f,stroke:\#333,stroke-width:2px

    style I fill:\#f9f,stroke:\#333,stroke-width:2px

    style L fill:\#fff4dd,stroke:\#d4a017,stroke-width:2px

## **High-Level Process Flow Description**

### **1\. Ingestion & Inflow**

* **Business Action:** Vendor or internal user uploads a PDF invoice.  
* **Tech Component:** **Google Drive**  
* **Process:** The file is dropped into the 01\_INBOX folder. This acts as the "Hot Folder" for the entire system.

### **2\. Detection & Orchestration Trigger**

* **Business Action:** The system identifies a new document and begins processing.  
* **Tech Component:** **n8n**  
* **Process:** An n8n "Google Drive Watcher" node detects the new file and immediately moves it to 02\_PROCESSING to prevent duplicate runs.

### **3\. Data Extraction (OCR & AI)**

* **Business Action:** Converting visual PDF data into structured digital data.  
* **Tech Component:** **n8n AI Agent (OpenAI/Gemini)**  
* **Process:** The AI Agent extracts header information (Vendor, Total, PO Number) and a structured array of line items (SKU, Price, Quantity).

### **4\. SAP Data Synchronization**

* **Business Action:** Fetching the "Source of Truth" from the ERP.  
* **Tech Component:** **Supabase**  
* **Process:** n8n queries the simulated SAP tables (ekko, ekpo, mseg) to retrieve the corresponding Purchase Order and Goods Receipt data.

### **5\. The Contextual Learning Check (Feedback Loop \- Phase 1\)**

* **Business Action:** Checking historical "common sense" and past user behavior.  
* **Tech Component:** **n8n \+ Supabase (learning\_examples)**  
* **Process:** Before making a decision, the n8n Agent queries the learning\_examples table. It checks if similar variances for this specific vendor were accepted by humans in the past.

### **6\. Automated Matching Logic**

* **Business Action:** The Three-Way Match (Invoice vs. PO vs. GR).  
* **Tech Component:** **n8n (Javascript Node / AI Agent)**  
* **Process:** \* The system compares extracted data against SAP data.  
  * **Exception Management:** If discrepancies are found, the application categorizes them (Price, Qty, or Missing GR) but maintains the flow.  
  * A status is assigned: READY\_TO\_POST or EXCEPTION\_FLAGGED.

### **7\. User Workbench & Decision**

* **Business Action:** Human-in-the-loop review and final approval.  
* **Tech Component:** **Vercel (Next.js Frontend)**  
* **Process:** The AP Clerk logs into the dashboard to view the worklist. They can see the side-by-side comparison of PDF data vs. SAP data.  
  * If "Ready," they click **Post**.  
  * If an "Exception" exists, they can **Reject**, **Request Review**, or **Manually Override** (Post anyway).

### **8\. Feedback Capture (Feedback Loop \- Phase 2\)**

* **Business Action:** Teaching the system based on human expertise.  
* **Tech Component:** **Vercel \-\> n8n \-\> Supabase**  
* **Process:** If the user performs a **Manual Override** (e.g., accepting a variance the system flagged), n8n automatically captures the context of that decision and stores it in the learning\_examples table. This data will inform Step 5 in future runs.

### **9\. Final Posting & Archiving**

* **Business Action:** Successful completion and record keeping.  
* **Tech Component:** **Supabase \+ Google Drive**  
* **Process:** Upon posting, the status in Supabase updates to POSTED, and the PDF is moved to the 03\_ARCHIVE folder in Google Drive, renamed with a unique SAP reference ID.

Detailed description for the main sections provided in more detail below.

# 

# **Card 1: Business Process Logic (Invoice Matching)**

## **Goal**

To simulate a "Touchless" Invoice Processing environment common in Tier-1 Retailers using SAP S/4HANA. The goal is automation by default, but human intervention by exception.

## **The Process Flow**

### **Step 1: Ingestion (Vendor Interaction)**

* **Action:** Vendor sends invoice via email or uploads to portal.  
* **Tech Component:** Google Drive (Folder: INBOX).  
* **System Logic:** System detects new file ![][image1] Moves file to PROCESSING folder ![][image1] Triggers n8n Workflow.

### **Step 2: Extraction & Digitization (OCR)**

* **Action:** System extracts Header Data (Vendor, Date, Invoice \#, Total Amount, Currency) and Line Item Data (Material/SKU, Quantity, Unit Price).  
* **Tech Component:** n8n (AI Agent/OCR Node).  
* **System Logic:** \* Convert PDF to JSON.  
  * Normalize formatting (e.g., dates to YYYY-MM-DD).

### **Step 3: The 3-Way Match (The Core Logic)**

* **Action:** The system validates the Invoice against the Purchase Order (PO) and Goods Receipt (GR).  
* **Tech Component:** n8n Agent querying Supabase (SAP Tables).  
* **Logic Rules:**  
  1. **Vendor Check:** Does the Vendor Tax ID on PDF match the PO Vendor?  
  2. **PO Check:** Does the PO Reference exist in SAP?  
  3. **Line Item Check (Iterative):**  
     * *Quantity Check:* Is Invoice\_Qty ![][image2] (PO\_Qty \- Already\_Billed\_Qty)? AND Is Invoice\_Qty ![][image2] GR\_Qty?  
     * *Price Check:* Is Invoice\_Unit\_Price ![][image3] PO\_Unit\_Price (within defined tolerance, e.g., $0.50 or 1%)?  
  4. **Tax Check:** Does Invoice\_Total \= Sum(Lines) \+ Tax?

### **Step 4: Contextual Decision Making (The Feedback Loop)**

* **Action:** Before assigning a final status, the Agent checks the learning\_examples database.  
* **Logic:**  
  * *Query:* "Has the user previously accepted a price variance for this Vendor?"  
  * *Adaptation:* If yes, the Agent treats the current variance as acceptable (up to the historical threshold) instead of flagging it.

### **Step 5: Classification & Status Assignment**

Based on Step 3 & 4, the system assigns a status in Supabase (invoices table):

* **Scenario A: Perfect Match (The Happy Path)**  
  * **Condition:** All validations pass (or AI auto-resolves based on history).  
  * **Status:** READY\_TO\_POST.  
  * **Action:** Visible in Dashboard as Green. One-click "Post" enabled.  
* **Scenario B: Business Exception**  
  * **Condition:** Price or Qty variance detected and NOT resolved by history.  
  * **Status:** BLOCKED\_PRICE or BLOCKED\_QTY.  
  * **Action:** Visible in Dashboard as Red/Yellow. "Post" disabled until resolved.  
* **Scenario C: Technical Error**  
  * **Condition:** PO not found / OCR failed.  
  * **Status:** MANUAL\_REVIEW.

### **Step 6: User Interface (The Workbench)**

* **Action:** Accounts Payable (AP) Clerk logs into the Web Portal.  
* **Tech Component:** Vercel (Next.js App).  
* **Views:**  
  * *Dashboard:* Overview of Statuses.  
  * *Worklist:* Filterable list of invoices.  
  * *Detail View:* Side-by-Side (PDF on left, Extracted Data \+ PO Data on right). Differences highlighted in red.

### **Step 7: User Actions & System Learning**

The user selects an invoice and performs an action. **Crucially, this action teaches the system.**

1. **Post (Override):** User posts an invoice the system flagged as "Blocked".  
   * *System:* Updates status to POSTED. **Records the override** in learning\_examples (e.g., "User accepted $5 variance for Vendor X").  
2. **Post (Standard):** User confirms a READY\_TO\_POST invoice.  
   * *System:* Updates status to POSTED. Moves PDF to ARCHIVE.  
3. **Send for Review:** User sees a missing GR or Price diff.  
   * *System:* Triggers n8n workflow ![][image1] Sends Email/Slack to Buyer/Warehouse. Updates status to AWAITING\_INFO.  
4. **Reject:** Invoice is invalid.  
   * *System:* Sends rejection email to Vendor. Moves PDF to REJECTED.

## **Bulk Processing Note**

* **One-by-One:** The workflow triggers per file.  
* **Bulk:** The n8n trigger will handle "Batch" processing. The Dashboard must support "Select All" ![][image1] "Post Selected" for all items in READY\_TO\_POST status.

# **Card 2: Business Exceptions Catalog**

## **Philosophy**

In retail, invoices rarely match perfectly due to volume. This catalog defines how the Agent should categorize errors.

## **Exception Table**

| ID | Exception Name | Description | Logic / Threshold | Handling Workflow |
| :---- | :---- | :---- | :---- | :---- |
| **EX-01** | **Price Variance** | Vendor is charging more per unit than agreed on the PO. | Inv\_Price \> PO\_Price AND Difference \> $5.00 (Tolerance) | **Workflow:** Block Payment. User option to "Accept Variance" (posts to Price Diff account) or "Send for Review" (email Buyer). |
| **EX-02** | **Quantity Variance** | Vendor is billing for 100 items, but PO was for 50\. | Inv\_Qty \> PO\_Qty | **Workflow:** Auto-Reject or Block. Usually implies duplicate billing or wrong PO. |
| **EX-03** | **Missing Goods Receipt (GR)** | Vendor sent invoice, but warehouse hasn't scanned the goods yet. | Inv\_Qty \> GR\_Qty | **Workflow:** "GR/IR Mismatch". Status: AWAITING\_GR. System periodically re-checks Supabase for new GRs. |
| **EX-04** | **Unknown PO** | The PO number on the invoice does not exist in our DB. | PO\_Number not found in EKKO table. | **Workflow:** Manual Review. OCR might have misread it, or Vendor made a typo. |
| **EX-05** | **Tax Calculation Error** | The total amount doesn't match the sum of lines \+ tax. | Total \!= Sum(Lines) \* (1+TaxRate) | **Workflow:** Warning Flag. User must correct the header amount or line amounts before posting. |
| **EX-06** | **Duplicate Invoice** | An invoice with this number and vendor already exists. | Vendor\_ID \+ Invoice\_Ref already exists in RBKP table. | **Workflow:** Auto-Reject. Move to Error Folder. |

## **Feature Flagging for PoC**

To keep the PoC simple but realistic, we will implement **EX-01 (Price)** and **EX-03 (Missing GR)** as the primary demo scenarios, as these are the most common Retail pain points.

# **Card 3: Storage & Ingestion (Google Drive)**

## **Role**

Simulates the "Vendor Portal" and "Document Management System" (DMS).

## **Folder Structure**

The application requires a dedicated root folder PO\_INVOICE\_POC with the following sub-structure:

* **01\_INBOX**  
  * **Purpose:** The entry point. Vendors (or you, simulating them) drop PDF invoices here.  
  * **Trigger:** n8n watches this folder for *New Files*.  
* **02\_PROCESSING**  
  * **Purpose:** Files are moved here immediately after the trigger fires to prevent double-processing.  
* **03\_ARCHIVE**  
  1. **Purpose:** Successfully POSTED invoices are moved here. They are renamed to \[SAP\_ID\]\_\[OriginalName\].pdf.  
* **04\_EXCEPTIONS**  
  5. **Purpose:** Invoices that failed technical processing (e.g., corrupt PDF) or were REJECTED by business logic.

## **Permissioning**

* **Service Account:** The n8n Google Drive node must have Read/Write access to this tree.  
* **Public Access:** Files in 02\_PROCESSING might need to be temporarily shared (via link) so the Vercel app can display the PDF in an iframe, or we will use the Google Drive API to stream the binary data to the frontend.

# **Card 4: Orchestration & AI (n8n)**

## **Role**

The "SAP Build Process Automation" replacement. It handles logic, AI extraction, database operations, and the **Feedback Loop**.

## **Workflow 1: The "Ingest & Match" Agent**

* **Trigger:** Google Drive (New File in 01\_INBOX).  
* **Step 1 (Housekeeping):** Move file to 02\_PROCESSING.  
* **Step 2 (AI Extraction):**  
  * **Node:** n8n AI Agent (OpenAI GPT-4o or Google Gemini).  
  * **Input:** PDF Binary.  
  * **Prompt:** "Extract Vendor, Invoice Date, PO Number, Currency, and a generic Array of Line Items (Material, Qty, Amount) as JSON."  
* **Step 3 (Data Fetch \- SAP):**  
  * **Node:** Supabase (Get Rows).  
  * **Query:** Fetch PO\_Header and PO\_Lines based on extracted PO Number.  
* **Step 4 (Data Fetch \- Learning History):**  
  2. **Node:** Supabase (Get Rows).  
  3. **Query:** Fetch learning\_examples where vendor\_id matches the extracted Vendor.  
  4. **Goal:** Retrieve past user decisions (e.g., "User accepted Freight charge of $20").  
* **Step 5 (The Logic Core \- Agent/Code Node):**  
  6. **Input:** Extracted JSON \+ SAP Data \+ **Learning History**.  
  7. **Logic:** Perform the 3-Way Match.  
  8. **Heuristic:** *If a variance exists, check 'Learning History'. If similar variance was accepted in the past, Mark as READY\_TO\_POST with a warning note, otherwise Mark as BLOCKED.*  
* **Step 6 (Persist):**  
  1. **Node:** Supabase (Insert Row).  
  2. **Action:** Insert into invoices table with Status and Link to Drive File.  
  3. **Action:** Insert into invoice\_logs (History of what happened).

## **Workflow 2: The "User Action" Handler (The Teacher)**

* **Trigger:** Webhook (POST request from Vercel).  
* **Payload:** { invoiceId, action, comment, originalStatus, finalStatus }.  
* **Step 1 (Execute Action):**  
  * **Case "POST":** Update Supabase Status to POSTED. Move Drive file to 03\_ARCHIVE.  
  * **Case "SEND\_REVIEW":** Send Email to "Buyer". Update Supabase to AWAITING\_INFO.  
  * **Case "REJECT":** Move Drive file to 04\_EXCEPTIONS. Update Supabase to REJECTED.  
* **Step 2 (The Learning Step):**  
  * **Condition (If Node):** IF action \== "POST" AND originalStatus \!= "READY\_TO\_POST" (Meaning: The user overrode the system's block).  
  * **Action:** Insert into learning\_examples.  
    * vendor\_id: (From Invoice).  
    * scenario\_type: (e.g., "PRICE\_VARIANCE").  
    * input\_context: JSON string (e.g., {"variance\_amount": 10.00, "item": "Shipping"}).  
    * user\_decision: "ACCEPTED".  
    * reasoning: User's comment (if any) or "Manual Override".

## **AI Configuration**

* **Model:** Use a Vision-capable model (Gemini 1.5 Pro or GPT-4o) as invoices are visual documents.  
* **Output Parser:** Strictly enforce JSON output.  
* **Context Window:** Ensure the model context includes the learning\_examples JSON array to allow few-shot reasoning.

# **Card 5: Orchestration Exposure (ngrok)**

## **Role**

To expose the local (or self-hosted) n8n webhooks to the internet so Vercel can talk to them.

## **Configuration**

* **Scenario:** If running n8n locally (e.g., via Docker):  
  * Run: ngrok http 5678 (assuming n8n runs on port 5678).  
  * **Result:** You get a URL like https://random-name.ngrok-free.app.  
* **Environment Variables:**  
  * In Vercel, set NEXT\_PUBLIC\_N8N\_WEBHOOK\_URL \= https://random-name.ngrok-free.app/webhook/action.

## **Security Note for PoC**

Since this is a PoC, we will use basic authentication in the webhook header or a simple shared secret token to ensure random internet traffic doesn't trigger invoice postings.

# **Card 6: SAP Database Simulation (Supabase)**

## **Role**

To mimic the SAP S/4HANA Table structure (simplified) to provide realistic data relationships.

## **Table Structure (PostgreSQL)**

### **1\. Vendors (lfa1)**

* vendor\_id (PK, text): SAP Vendor Number (e.g., "100050").  
* name (text): Vendor Name.  
* email (text): For rejection notifications.

### **2\. Purchase Order Header (ekko)**

* po\_number (PK, text): The PO Number (e.g., "4500001234").  
* vendor\_id (FK): Link to Vendor.  
* created\_at (timestamp).  
* company\_code (text): e.g., "1000".

### **3\. Purchase Order Items (ekpo)**

* id (PK, uuid).  
* po\_number (FK): Link to Header.  
* line\_item (int): 10, 20, 30... (Standard SAP increments).  
* material (text): SKU/Description.  
* ordered\_qty (numeric).  
* unit\_price (numeric).

### **4\. Goods Receipt History (mseg)**

* This is critical for 3-Way Match.  
* id (PK).  
* po\_number (FK).  
* po\_line\_item (int).  
* received\_qty (numeric).  
* movement\_date (date).

### **5\. Invoices (rbkp) \-\> The App's Main Table**

* id (PK, uuid).  
* invoice\_number (text): Extracted from PDF.  
* po\_reference (text): Extracted PO.  
* vendor\_name\_extracted (text).  
* total\_amount (numeric).  
* status (text): PROCESSING, READY\_TO\_POST, BLOCKED\_PRICE, BLOCKED\_QTY, POSTED.  
* pdf\_link (text): Google Drive ID or Link.  
* exception\_reason (text): e.g., "Price Variance of $50".  
* created\_at (timestamp).  
* is\_test\_data (boolean): Flag for Card 8 (Automated Tests).

### **6\. Learning Examples (learning\_examples) \-\> The "Brain" Memory**

* This table stores user overrides to teach the Agent.  
* id (PK, uuid).  
* vendor\_id (text): (FK to lfa1) To scope the learning (e.g., "Only Vendor A allows extra fees").  
* scenario\_type (text): The type of issue (e.g., PRICE\_VARIANCE, EXTRA\_CHARGE, TAX\_MISMATCH).  
* input\_context (jsonb): Structured data about the variance (e.g., {"diff": 12.50, "line\_item": "Freight"}).  
* user\_decision (text): ACCEPTED or REJECTED.  
* reasoning (text): Optional comment provided by the user during the override.  
* created\_at (timestamp): To prioritize recent decisions.

## **Relationships**

* The n8n workflow will query ekko/ekpo to validate rbkp data.  
* The n8n workflow will query learning\_examples to refine the validation logic.  
* The Dashboard will primarily display rbkp (Invoices), but allow expanding to see related ekpo (PO Lines) for comparison.

# **Card 7: Web & Mobile App (Vercel / Next.js)**

## **Role**

The "Fiori Launchpad." A responsive web app for the AP Clerk.

## **Tech Stack**

* **Framework:** Next.js (React).  
* **Styling:** Tailwind CSS (Critical for looking modern/clean).  
* **State:** React Query (for fetching Supabase data).

## **Key Screens / Components**

### **1\. The Dashboard (Home)**

* **Metrics Cards:** "Ready to Post (5)", "Exceptions (2)", "Processed Today (12)".  
* **The Worklist:** A Data Grid (table) showing incoming invoices.  
  * *Columns:* Status (Badge), Vendor, Amount, Invoice \#, PO \#, Date.  
  * *Visuals:* Rows with exceptions should be highlighted lightly in red/yellow.

### **2\. The Invoice Detail (The "Workbench")**

* **Layout:** Split screen (Desktop) / Tabbed (Mobile).  
  1. **Left Panel:** PDF Viewer (using iframe or a PDF viewer component passing the Drive Link).  
  2. **Right Panel:** Matching Interface.  
     * **Header:** Vendor Name, Totals.  
     * **Line Items Comparison Table:**  
       * Col 1: Invoiced Qty/Price.  
       * Col 2: SAP PO Qty/Price.  
       * Col 3: Variance (Auto-calculated).  
* **Action Bar (Sticky Footer):**  
  * **"Post Invoice" Button:** (Green). Triggers n8n POST webhook.  
  * **"Request Review" Button:** (Blue). Opens modal to type a comment \-\> Triggers n8n SEND\_REVIEW.  
  * **"Park" Button:** (Grey). Saves state locally.

## **Interactivity**

* When an action is taken, show a "Toast" notification (e.g., "Invoice 12345 Posted Successfully").  
* Optimistic UI updates: Immediately turn the row green/remove it from the list while waiting for n8n to respond.

# **Card 8: Automated Testing Strategy**

## **Goal**

To allow "Antigravity" (the AI coder) to run verification cycles without polluting the demo data.

## **Strategy: The "Shadow" Dataset**

### **1\. Data Segregation**

* **Database:** The invoices table in Supabase will have a column is\_test\_data (boolean).  
* **Drive:** A specific Google Drive folder named 99\_TEST\_HARNESS.

### **2\. The Test Suite (10 Scenarios)**

We will create 10 mock PDFs (using a generator or simple HTML-to-PDF).

* **Perfect Match:** Values match PO exactly.  
* **Price Variance High:** Unit price \+20%.  
* **Price Variance Low (Tolerance):** Unit price \+1% (Should pass).  
* **Qty Variance High:** Invoiced 10, PO said 5\.  
* **Partial Delivery:** Invoiced 5, PO said 10 (Should match if GR is 5).  
* **Missing GR:** Invoiced 10, PO said 10, GR says 0\.  
* **Wrong Vendor:** PO belongs to Vendor A, Invoice is from Vendor B.  
* **Duplicate:** Same invoice number twice.  
* **Bad Scan:** Blurred PDF (OCR Failure simulation).  
* **Tax Mismatch:** Calculated tax wrong.

### **3\. Execution Logic**

* **The Script:** A simple TypeScript script (runnable via Vercel API route or local Node.js).  
* **Flow:**  
  1. Script uploads Test PDF 1 to 01\_INBOX.  
  2. Waits 30 seconds.  
  3. Queries Supabase: SELECT status FROM invoices WHERE invoice\_number \= 'TEST\_01'.  
  4. Asserts: Does status \== READY\_TO\_POST?  
* **Cleanup:** After the test run, the script deletes all rows where is\_test\_data \= true and empties the Drive folders of test files.

# **Open Points & Evolution Pipeline**

## **1\. Does a RAG (Retrieval-Augmented Generation) make sense?**

**YES.**

* **Use Case:** Retailers have complex **Vendor Manuals**.  
  * *Example:* Vendor A is allowed to charge for pallets. Vendor B is not.  
  * *Implementation:* Upload the "Retailer Supplier Manual" (PDF) to n8n's vector store.  
  * *Workflow:* If an "Unidentified Charge" appears on the invoice (e.g., "Logistics Fee"), the Agent queries the RAG: *"Does the contract for Vendor A allow logistics fees?"*  
  * *Result:* The PoC looks incredibly smart because it handles "policy" checks, not just math checks.

## **2\. Will we have an Agent?**

**YES.**

* The n8n workflow described in Card 4 is fundamentally an **Agentic Workflow**.  
* Instead of hard-coded "If X then Y", we use an LLM Node to "Decide the Status."  
* *Prompt Strategy:* "You are a Senior AP Clerk. Here is the PO data and the Invoice Data. Analyze the discrepancies. If the difference is less than $1.00, ignore it. If the Qty is higher, flag it. Output your decision."  
* This is the "Showstopper" feature for your customer.

## **3\. How to implement "Learning" (The Feedback Loop)?**

We can implement a **Few-Shot Learning Loop**:

* **Capture Correction:** When a user overrides the AI (e.g., AI said "Block", User clicked "Post"), we trigger a webhook.  
* **Store Context:** Save the Invoice Data \+ The User's Decision to a learning\_examples table in Supabase.  
* **Inject History:** In the n8n Workflow (Card 4), add a step *before* the AI decision:  
  3. Fetch similar examples from learning\_examples.  
  4. Add to Prompt: *"Note: In the past, for Vendor A, the user accepted a $10 price variance on 'Freight'. Take this into account."*  
* **Result:** The model stops making the same mistake twice. This is a very powerful "Enterprise" feature.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAYCAYAAAAYl8YPAAAAqklEQVR4XmNgGAWjYBACZWVlWXl5+W4FBQUOdDmygJycXDkIo4uTBYCuEwO6br+ioqIZuhxZAGQQ0MAjMjIyKigSoqKiPEAJSTJwMNC7j4AGcsINAwZmBUiQVAw07BkQ/wfqj0dyG+lAXFycG2jIQqBhfehyJAGgq1yBhqxG8R6ZgAXkIiD2QJcgGQBdIw101WYpKSkRdDmSgbGxMSvQQCEgkxFdbhQMMAAAwdwthtTzqmQAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAXCAYAAADUUxW8AAAAxElEQVR4XmNgGAW0BYqKiuqioqI86OL4AKOCgoI5EO+Sl5c/A+KjK0AHzEDF/iANQNv0GIjQwCAjI8MJND0JiJ/JycnNR5fHCYCK84GaXgLxVCCWRJfHCqC2VQFxt7S0tDC6PF4gLi7ODfTbBJDNIDa6PNFARUWFD2hIGdAVT0AuQZcnCiAF3FwgVkSXJwoAvRMB1HwXiNeBEgi6PDGAGajZG5RAQPGOLjkUAShhAP2zGxhFj4jB6LmKEWqAJDEYWePAAACIfTFUWH323wAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAXCAYAAADUUxW8AAAA9klEQVR4XmNgGAVDERgbG7NqaWmxoYtjAcwoPCUlJTV5efn/UPxUQUEhEkMRFADlGuAcGRkZFaCGu7KysjqKioryQMl0IP8hkD6F0IIAQLkcZE41UGE4kjzIQE45ObkyIJ6urKwsCxIDeQvIjwFibbhCoOYqKSkpEbgAEgAaugvJOyD8EV0NCDADJdYA8QmgyfkqKip86ApgACjvC+eIioryADWtAtqyEkjPBeI7IBuggYYBgJrL4Rygogig4llI8oxAvhPIEKBCLSRxUFgIAcVc4QJAzZ1AASUkNWAACjSgAT+A+DzIcKCaDUD6Jyjg0NWOgkENADq3NIKIloPCAAAAAElFTkSuQmCC>