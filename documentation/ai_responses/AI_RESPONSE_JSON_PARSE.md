# Fixing the "Undefined" Data Issue 🧹

The issue is clear from your output logs.

Your **Basic LLM Chain** node is outputting a **String of Markdown**, not a real JSON object:
```json
"text": "```json\n{\n  \"invoice_number\": \"INV-2026-001\", ... \n}\n```"
```

The PostgreSQL node expressions (`{{ $json.invoice_number }}`) are looking for fields that don't exist yet, because they are trapped inside that text string!

## The Solution: Add a "Parse JSON" Code Node

We need to strip away the markdown (` ```json `) and convert the text into real data.

### Step-by-Step Fix:

1.  **Add a new "Code" Node** between **Basic LLM Chain** and **PostgreSQL**.
2.  **Language:** JavaScript.
3.  **Code:** Copy and paste this exact script:

```javascript
// Get the text output from the LLM
const text = $input.item.json.text || "";

// Clean up markdown code blocks if present
const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();

try {
  // Parse the string into a real object
  const data = JSON.parse(cleanJson);
  
  // Return the parsed data
  return data;
} catch (error) {
  // Fallback if parsing fails
  return { error: "Failed to parse JSON", raw: text };
}
```

### 4. Connect the Nodes
*   **Basic LLM Chain** -> **Code (Parse JSON)** -> **PostgreSQL**.

### 5. Check PostgreSQL Expressions
Now that the data is parsed, your existing expressions in the PostgreSQL node should work perfectly without changes!
*   `{{ $json.invoice_number }}` will now find the real value.

Run the workflow again, and the data will populate correctly in Supabase.
