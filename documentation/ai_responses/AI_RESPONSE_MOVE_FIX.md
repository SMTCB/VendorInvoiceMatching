# Fixing the Move Node 📦

This is the exact same issue we fixed in the PostgreSQL node. The "Move File" node is still looking for the "Trigger" (which didn't run), instead of the actual file ID we have available.

## The Fix

1.  Open your **Move file** node (the one in your screenshot).
2.  Look at the **File** (By ID) field.
3.  Currently, it says:
    ```javascript
    {{ $node["Google Drive Trigger"].json["id"] }}
    ```
4.  **Change it to:**
    ```javascript
    {{ $node["Download file"].json["id"] }}
    ```
    *(Or whatever your download node is named).*

Once you update this, the node will know exactly which file to move, regardless of whether it came from the automatic trigger or the manual button.
