# Fixing the "Bad Request" (400) Error 🔧

The error is happening because the Node is currently configured to **Search File/Folder Name**, but you pasted a complex filter (`trashed = false...`) into the name field. That confuses Google Drive.

## The Fix: Change "Search Method"

1.  Open your **Search files and folders** node.
2.  Look at the field **Search Method** (currently set to "Search File/Folder Name").
3.  Change it to **`Query String`** (or `List` / `Filter`, depending on your exact n8n version, but usually **Query String** is the raw mode).
4.  Once changed, you will see a field dedicated to the query string.
5.  Paste your query there:
    ```text
    trashed = false and '1wxSginHaOrjEzb4KxeR5h9UZChKDPoue' in parents
    ```
6.  **Additional Fix:** To ensure you only get PDFs, update the query to this:
    ```text
    trashed = false and '1wxSginHaOrjEzb4KxeR5h9UZChKDPoue' in parents and mimeType = 'application/pdf'
    ```

**Then test the node again.** It should work perfectly!
