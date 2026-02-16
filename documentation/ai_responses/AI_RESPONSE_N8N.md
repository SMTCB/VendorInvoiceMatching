# Fixing the "Failed to contact n8n" Error

Great to hear the UI is working and you're logged in! 🎉

The error you're seeing (`Failed to contact n8n...`) and my test script's finding (`POST poll-portal is not registered`) point to a simple configuration issue in n8n.

## The Problem
Your n8n workflow is **reachable**, but it is **not Active**.
Because you are using the **Production Webhook URL** (it doesn't have `/test/` in the path), n8n rejects the request unless the workflow is officially "Active".

## How to Fix It (The Easy Way)
1.  Open your **Ingestion Workflow** in n8n.
2.  Look at the toggle switch in the **top right corner**.
3.  Flip it from **Inactive** to **Active** (Green).
4.  **Save** the workflow.

**Then try the "Poll Vendor Portal" button again.** work immediately!

*(Alternative: If you prefer to keep the workflow inactive for testing, you would need to get the "Test URL" from the Webhook node and update your `.env.local` file, but activating is the standard way for the app to work.)*
