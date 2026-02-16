# ☁️ How File Serving Works (Zero Storage)

You are absolutely right to be concerned about storage, but we are using a **"Zero-Copy" architecture**.

### We are NOT storing the image/PDF.

Here is exactly how it works:

1.  **Google Drive is the Storage:**
    The actual PDF file (which might be 2MB or 20MB) lives ONLY in your Google Drive (the `10_Processed` folder). We never move it to our database or application server.

2.  **Database Stores a Reference (Tiny):**
    In our Supabase `invoices` table, we store only the **`google_file_id`**.
    *   **Size:** ~30 bytes (just a text string like `1bafUFAzQAb...`).
    *   **Cost:** Negligible. You could store millions of these for pennies.

3.  **On-Demand Streaming:**
    When you open the invoice page, your browser (the client) creates an `<iframe>`.
    *   **Source:** `https://drive.google.com/file/d/[ID]/preview`
    *   This iframe connects **directly** to Google's servers to fetch the pixels.
    *   Our server (Next.js) never touches the file data. It just hands the ID to the browser and says "Go ask Google for this file."

### 🚀 Production Implications
*   **Scalability:** Extremely high. You are leveraging Google's massive CDN infrastructure.
*   **Cost:** You only pay for Google Workspace/Drive storage (which is cheap/included) and Supabase database rows (structured text only).
*   **Security:** Access is controlled by Google Drive permissions. If you remove a user from the Google Drive folder, they lose access to view the file in the app instantly, even if they have the link.

**Summary:** This is the most efficient way to build this MVP. You are not duplicating data.
