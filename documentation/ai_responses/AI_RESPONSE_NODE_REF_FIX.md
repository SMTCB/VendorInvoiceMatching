# Fixing the "Node hasn't been executed" Error 🔗

This error happens because your SQL query tries to read `{{ $node["Google Drive Trigger"].json["id"] }}`.
But in this manual run (via webhook), the **Trigger never ran**, so that node ID doesn't exist!

## The Fix: Reference the "Download" Node Instead

Both the "Auto Trigger" and "Manual Webhook" paths merge at the **Download file** node. That node always has the file ID.

1.  Open your **PostgreSQL** node.
2.  Find the `google_file_id` part of your SQL query.
3.  Change this line:
    ```sql
    '{{ $node["Google Drive Trigger"].json["id"] }}', 
    ```
    **To this:**
    ```sql
    '{{ $node["Download file"].json["id"] }}', 
    ```
    *(Assuming your download node is named "Download file". If you renamed it, just point to that node instead).*

4.  **Wait! There's one more.**
    You also need to update the last **Move file** node. It probably references the Trigger too.
    *   Open the **Move file** node.
    *   Change **File ID** to: `{{ $node["Download file"].json["id"] }}`.

Now it will work regardless of which path (Auto or Manual) started the workflow!
