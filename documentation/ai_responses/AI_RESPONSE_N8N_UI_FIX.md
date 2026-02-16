# Using "Advanced Search" correctly 🛠️

Since your node version doesn't have a "Query String" option, you must use the **UI Builder** (The "Filter" section) to create your query.

## Steps to Fix

1.  **Search Method:** Select **`Advanced Search`**.
2.  Scroll down to the **Filter** section (at the bottom of your screenshot).
3.  Click the **Add Filter** button.
4.  Select **`Parents`** (or "Parent ID").
    *   **Value:** Paste your folder ID: `1wxSginHaOrjEzb4KxeR5h9UZChKDPoue`
        *(Note: If it asks for an operator, choose `in` or `is inside`).*
5.  Click **Add Filter** again.
6.  Select **`Trashed`**.
    *   **Value:** `False`.
7.  (Optional) Click **Add Filter** again -> **`Mime Type`**.
    *   **Value:** `application/pdf` (or `application/vnd.google-apps.folder` if you were searching folders, but here we want files).

## Why this works
The "Advanced Search" mode builds the complex `trashed = false...` query for you in the background. By using the filters, you avoid syntax errors!
