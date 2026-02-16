# Resolved: Ghost Data & Configuration Error

I've addressed both of your findings:

## 1. Ghost Data (Invoices appearing when DB is empty)
I've **disabled the "mock data fallback"** in `app/page.tsx`.
*   *Previously:* If the database was empty, the app would load fake demo data to show how the UI looks.
*   *Now:* If your invoices table is empty, the UI will correctly show **"Zero active items"** with an empty state illustration.

## 2. Configuration Error ("System not configured")
The error `System not configured. Please add n8n Webhook URL to .env` happens when the server cannot read the `N8N_INGESTION_WEBHOOK_URL` variable.

This is almost certainly because the **environment variables were not reloaded** by the Next.js server after you added them to `.env.local`.

### 🛠️ The Fix: Restart the Server
Environment variables are strictly loaded at startup. You simply need to restart your dev server for `.env.local` changes to take effect.

1.  **Stop the server** (Ctrl+C in your terminal).
2.  **Start it again**:
    ```bash
    npm run dev
    ```
3.  **Reload the page**.

You should now see an empty dashboard, and the "Poll Vendor Portal" button should work (or verify if n8n is reachable). I've also added debug logging to the server console so we can see exactly what's happening if it fails again.
