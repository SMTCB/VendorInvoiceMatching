
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const WEBHOOK_URL = 'http://localhost:5678/webhook/test-matching';

async function runMinimalTest() {
    console.log('--- MINIMAL PAYLOAD TEST ---');
    const payload = { "test": "minimal", "status": "ok" };

    console.log(`Sending to ${WEBHOOK_URL}...`);
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Response: ${text}`);

    } catch (err) {
        console.error('Network error:', err);
    }
}

runMinimalTest();
