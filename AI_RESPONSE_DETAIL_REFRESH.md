# Invoice Detail Auto-Refresh Added 🔄

I've updated the **Invoice Detail Page** to also refresh automatically.

## How it works:
While the invoice status is `PROCESSING` (showing the "Gemini Extracting..." screen), the page will now:
1.  Check for updates every **3 seconds**.
2.  Automatically reload the data from Supabase.
3.  Once the status changes (e.g. to `READY_TO_POST` or `BLOCKED_PRICE`), it stops refreshing and shows the full interface.

## Git Status:
- **Message:** `Feat: auto-refresh invoice detail while processing`
- **File:** `components/invoice-detail-view.tsx`

Since this is a client-side update, just **refresh your browser page once** to load the new code. Then click on an invoice—it should now update automatically as soon as n8n finishes!
