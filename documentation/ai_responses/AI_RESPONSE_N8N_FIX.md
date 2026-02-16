# Fixing the Google Drive 404 Error 🛠️

The error happens because the **Webhook** (the "Poll" button) triggers the workflow, but unlike the automatic Google Drive trigger, it **does not send a specific file ID**.

The "Download file" node tries to download `{{ $json.id }}`, which is empty (undefined) when coming from the webhook, causing the "Resource not found" (404) error.

## The Solution
We need to tell the workflow: *"If clicked manually, go look for files in the Inbox folder first."*

### Step 1: Add a "List Files" Node
1.  Disconnect the **Webhook** node from the **Download file** node.
2.  Add a new **Google Drive** node between them.
    *   **Resource:** `File`
    *   **Operation:** `List`
    *   **Filter (Query String):**
        ```text
        trashed = false and 'YOUR_INBOX_FOLDER_ID' in parents
        ```
        *(Replace `YOUR_INBOX_FOLDER_ID` with the ID of your `01_INBOX` folder. You can copy this from the browser URL when inside that folder).*
    *   **Limit:** `10` (or leave default).

### Step 2: Update the "Download file" Node
Currently, your Download node likely uses an expression that points specifically to the trigger. We need it to be generic.

1.  Open the **Download file** node.
2.  In the **File ID** field, make sure it is simply:
    ```javascript
    {{ $json.id }}
    ```
    *(It should logically pick up the ID from whichever node came before it—either the Trigger or the List).*

### Step 3: Handle the Flow
Now your workflow should look like this:

*   **Path A (Auto):** `Google Drive Trigger` -> `Download file` ...
*   **Path B (Manual):** `Webhook` -> `Google Drive (List)` -> `Download file` ...
    *(Both paths merge into the Download node)*

This way, clicking the button fetches the list of pending files, and the Download node gets a valid ID to work with.

---
**Tip:** If you don't have the `01_INBOX` folder ID handy, just open that folder in your browser. The ID is the random string at the end of the URL.
