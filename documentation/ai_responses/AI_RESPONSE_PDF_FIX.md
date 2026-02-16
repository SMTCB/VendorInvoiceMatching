# Selecting "PDF" in File Types 📄

The dropdown list can be tricky. Here are two ways to select PDF:

## Method A: Scroll Down (It should be there)
"PDF" usually appears further down the list, or sometimes under **"Ad..."** (Adobe PDF).
*   Try typing `pdf` into that dropdown search box to filter the list.

## Method B: Force Manual Entry (Recommended)
If you can't find it in the list, you can force it manually.

1.  Look to the right of the "File Types" field label.
2.  Click the button that says **`Fixed`** and change it to **`Expression`**.
3.  The dropdown will turn into a text box.
4.  Paste this exact text:
    ```text
    application/pdf
    ```

This tells Google Drive explicitly: *"I only want files with the MIME type application/pdf"*.

**After setting this, run the node again.** It will filter out the Google Doc causing the error and only grab your invoices.
