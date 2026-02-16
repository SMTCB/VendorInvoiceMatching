# Using "Filter" Instead of "File Types" ⚙️

It seems the "File Types" field is strict about what it accepts. No problem—we can use the **Filter** section below it instead, which is more flexible.

## Steps to Fix

1.  **Clear the "File Types" field.**
    *   Click the trash icon next to "File Types" or remove the text so it's empty/default.

2.  **Scroll down to "Filter".**
    *   You should already have "Parent ID" and "Trashed" in this list from our previous step.

3.  **Click "Add Filter" button again.**

4.  **Select `Mime Type`.**
    *   It might be called `Mime Type` or `File Type` in the filter list.

5.  **Enter Value:**
    *   Paste: `application/pdf`
    *(Make sure there are no extra spaces).*

6.  **Run the node.**

This achieves the exact same thing (filtering for PDFs only) but uses the raw API filter instead of the UI helper.
