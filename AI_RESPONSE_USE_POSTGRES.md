# Recommendation: Switch to PostgreSQL 🐘

I strongly recommend replacing this **Supabase** node with a **PostgreSQL** node, just like we did in Workflow 1.

## Why?
1.  **Reliability:** The PostgreSQL node uses the **Transaction Pooler** (port 6543), which is far more stable than the direct Supabase API connection (which often yields timeouts or IPv6 errors).
2.  **Simplicity:** You can just paste the SQL query below instead of manually mapping every field in the dashboard.
3.  **Consistency:** It keeps your workflows using the same logic.

## Steps to Switch
1.  **Delete** the current Supabase "Update Status" node.
2.  **Add** a **PostgreSQL** node.
3.  **Credential:** Select the same PostgreSQL credential you created for Workflow 1.
4.  **Operation:** `Execute Query`.
5.  **Query:** Copy/Paste this exact query:

```sql
UPDATE invoices
SET 
  status = '{{ $json.status }}',
  exception_reason = '{{ $json.exception_reason }}',
  updated_at = NOW()
WHERE id = '{{ $item(0).$node["Get Processing Invoices"].json["id"] }}';
```

*(Note: The `WHERE` clause expression might need to be re-selected via drag-and-drop if the ID reference is slightly different in your setup, but the one above checks the first item of the "Get Processing Invoices" node).*

**Run it, and you're done!**
