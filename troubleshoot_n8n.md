# Troubleshooting Guide: n8n and ngrok

Since your ngrok/n8n services were offline, here is how to restart them and ensure everything is connected.

## Option 1: All-in-One (Deprecated but easy)
Run the following command which attempts to start n8n and create a tunnel automatically:
```bash
npx n8n start --tunnel
```
*Note: This feature is deprecated in newer n8n versions and might be removed.*

## Option 2: Manual Setup (Recommended)
This approach gives you better control and stability.

### Step 1: Start n8n
Open a terminal and run:
```bash
npx n8n start
```
- Wait until you see "Editor is now accessible via: http://localhost:5678/"

### Step 2: Start ngrok
Open a **second** terminal window and run:
```bash
ngrok http 5678
```
- This will generate a public Forwarding URL (e.g., `https://random-name.ngrok-free.app`).
- **Copy this URL.**

### Step 3: Configure n8n Webhook
1.  Open your n8n workflows.
2.  Update your `Webhook` nodes to rely on the Production/Test URL.
3.  Ensure the webhook path matches your implementation (e.g., `/webhook/vendor-invoice-ingestion`).

## Current Status
I have attempted to launch `npx n8n start --tunnel` for you in the background. If it succeeds, you will see the tunnel URL in the output logs.
If it fails or hangs, please follow Option 2 above.
