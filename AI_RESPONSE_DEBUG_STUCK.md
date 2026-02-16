# Why is it stuck? 🚦

The UI is stuck on "Gemini is Extracting Data" (Status: `PROCESSING`) because **Workflow 2 (Matching)** hasn't updated the invoice status yet.

In our architecture, this is a relay race:
1.  **Workflow 1 (Ingestion):** Downloads PDF -> Extracts Data -> Saves to DB as `PROCESSING`. **(This part is done ✅)**.
2.  **Workflow 2 (Matching):** Picks up `PROCESSING` invoices -> Checks PO -> Updates Status to `READY/BLOCKED`. **(This part is missing/failing ❌)**.

## How to Debug (Check n8n)

1.  Go to your **n8n Dashboard**.
2.  Click **Executions** (sidebar).
3.  Look at the most recent runs.
    *   You should see a green success for **Ingestion**.
    *   **Do you see a run for "02_Matching_Smart_Judge"?**

### Scenario A: "Matching" Workflow NEVER ran
This means the "Handoff" failed. Workflow 1 finished, but didn't trigger Workflow 2.
*   **Quick Fix:** Go to **02_Matching_Smart_Judge** and click **Execute Workflow** manually. It should find the pending invoice and process it.
*   **Permanent Fix:** Ensure you added the **Execute Workflow** node at the end of Workflow 1 (as per the guide), OR enable a **Schedule Trigger** (Cron) in Workflow 2 to run every minute.

### Scenario B: "Matching" Workflow failed (Red)
If you see it ran but failed, click it to see the error node.

**Let me know which scenario it is!**
