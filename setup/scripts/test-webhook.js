const https = require('https');
const http = require('http');

// Define the webhook URL from your .env.local file
const WEBHOOK_URL = 'https://amiably-vitiated-hilde.ngrok-free.dev/webhook/poll-portal';
// If n8n runs locally on port 5678, try this instead:
// const WEBHOOK_URL = 'http://localhost:5678/webhook/poll-portal';

console.log(`Testing connectivity to: ${WEBHOOK_URL}`);

const protocol = WEBHOOK_URL.startsWith('https') ? https : http;

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
};

const req = protocol.request(WEBHOOK_URL, options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', (d) => {
        process.stdout.write(d);
    });

    res.on('end', () => {
        console.log('\nResponse received.');
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log("✅ SUCCESS: Webhook is reachable!");
        } else {
            console.log("❌ FAILURE: Webhook returned an error status.");
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ ERROR: Could not connect to webhook.\nDetails: ${e.message}`);
    console.log("\nPossible Fixes:");
    console.log("1. Check if n8n is running.");
    console.log("2. If using ngrok, verify the URL hasn't expired/changed.");
    console.log("3. Ensure the 'Webhook' node in n8n is Active or set to 'Production' mode.");
});

req.write(JSON.stringify({
    source: 'test_script',
    timestamp: new Date().toISOString()
}));

req.end();
