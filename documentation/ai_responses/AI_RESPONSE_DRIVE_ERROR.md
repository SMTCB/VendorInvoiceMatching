# Fixing "File not Exportable" (403) Error 🛠️

The error message hidden inside your log is:
`"message": "Export only supports Docs Editors files."`
`"reason": "fileNotExportable"`

## The Cause
This is unrelated to permissions.
It means you are confusing the **Download** vs **Export** operation in n8n.
*   **Download:** For regular files (PDFs, Images, ZIPs).
*   **Export:** For Google Docs, Sheets, and Slides (converting them to PDF/Docx).

The error usually happens when:
1.  The node is set to "Export" instead of "Download".
2.  **OR** you are trying to download a Google Doc/Sheet as if it were a binary file (which Google doesn't allow directly; it *must* be exported).

## The Likely Scenario for You
Since you are building an *invoice* system, you probably have a mix of files in your folder.
If the folder contains a native **Google Sheet** or **Google Doc**, the "Download" node will fail with this exact error.

## The Fix

### Option A: Force "Download" (If you only want PDFs)
1.  Ensure your **Download file** node has **Operation** set to `Download`.
2.  **CRITICAL:** Go back to your **Search/List** node.
3.  Add the filter I recommended earlier to **Mime Type**:
    *   **Value:** `application/pdf`
    *(This ensures you ONLY try to process PDFs, ignoring any random Google Docs/Sheets that might be in the folder).*

### Option B: Handle Both (If you need to process Docs/Sheets too)
If you want to support Google Docs/Sheets as invoices:
1.  You need an **If** node (or Switch) to check the generic type.
2.  If `application/vnd.google-apps.*`, use an **Export** node (convert to PDF).
3.  If `application/pdf`, use a **Download** node.

**Recommendation:** Stick to **Option A** for now. Filter your search to only grab `application/pdf` files.
