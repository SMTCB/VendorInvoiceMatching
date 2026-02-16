# Fixing the Syntax Error 📝

The error `Syntax error ... near "PROCESSING"` is happening because there is an **extra single quote** in your SQL query.

In the error log, we can see: `'...QS8ag'', 'PROCESSING'` (two quotes instead of one).

## The Fix

1.  Open your **PostgreSQL** node.
2.  Look at the `VALUES` section of your query.
3.  Find the line where you updated the ID. It likely looks like this:
    ```sql
    '{{ $node["Download file"].json["id"] }}'', 
    ```
    *(Note the double quotes at the end `''`)*.

4.  **Delete one of the single quotes** so it looks like this:
    ```sql
    '{{ $node["Download file"].json["id"] }}', 
    ```

## A Heads Up on "Undefined"
I also notice your query is trying to insert `'undefined'` for the invoice number and vendor.
This means the **AI extraction (LLM)** didn't find any data in this specific file.
Once you fix the quote error, the query might run, but it will insert "undefined" as the vendor name.
*   Check if your **Basic LLM Chain** node actually outputted any JSON data.
*   If this is a test file, make sure it has readable text!
