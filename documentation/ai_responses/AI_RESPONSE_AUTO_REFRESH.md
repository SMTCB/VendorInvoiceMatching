# Auto-Refresh Implemented 🔄

I've updated the "Poll Vendor Portal" button!

## What Changed:
Now, once the invoices are successfully fetched from the portal (via n8n), the dashboard will **automatically refresh** to show the new data. No manual refresh needed!

## Git Status:
I've also committed and pushed this change to Git.
- **Message:** `Feat: auto-refresh page after poll portal success`
- **Component:** `components/poll-portal-button.tsx`

Since this is a client-side component change, **you don't need to restart the server**. Just refresh your page once to make sure you have the new button code loaded, and then test it out!
