# Fixing Workflow 2 (Matching) 🧠

Yes, the exact same issue is happening here!
Your **Basic LLM Chain** in Workflow 2 is also outputting a **String of Markdown**, not real JSON data:
```json
"text": "```json\n{\n  \"status\": \"BLOCKED_PRICE\", ... \n}\n```"
```

The final **Update Status** node is trying to read `{{ $json.status }}`, but it can't find it inside that text string, so it updates nothing (or tries to update with `undefined` and fails silently).

## The Fix: Add the "Parse JSON" Node Again

We need to add the same **Code** node here to clean up the data.

### Step 1: Add a Code Node
1.  **Disconnect** the **Basic LLM Chain** from the **Update Status** node.
2.  **Add a "Code" node** in between them.
3.  **Language:** JavaScript.
4.  **Code:** Use the same script as before:

```javascript
// Get the text output from the LLM
const text = $input.item.json.text || "";

// Clean up markdown code blocks
const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();

try {
  // Parse into real object
  return JSON.parse(cleanJson);
} catch (error) {
  return { error: "Failed to parse JSON" };
}
```

### Step 2: Configure the Update Node
Now, ensure your **Update Status** (PostgreSQL) node logic is correct.
It typically needs two things:
1.  **The ID to update:** This comes from the **"Get Processing Invoices"** node (further back in the chain).
2.  **The New Status:** This comes from the **Code** node you just added.

**Check your SQL Query in the Update Node:**
It should look something like this:

```sql
UPDATE invoices
SET 
  status = '{{ $json.status }}',
  exception_reason = '{{ $json.exception_reason }}',
  updated_at = NOW()
WHERE id = '{{ $node["Get Processing Invoices"].json["id"] }}';
```

*(Note: The `WHERE id = ...` must reference the node that originally fetched the invoice ID, usually named "Get Processing Invoices").*

**Run it again, and your invoice will finally move out of PROCESSING!**
