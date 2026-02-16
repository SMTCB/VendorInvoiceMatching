const fs = require('fs');
const path = require('path');

const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

console.log('--- Env File Debugger ---');
console.log('Current Directory:', process.cwd());

function checkFile(filePath) {
    if (fs.existsSync(filePath)) {
        console.log(`✅ File found: ${path.basename(filePath)}`);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const webhookLine = lines.find(line => line.startsWith('N8N_INGESTION_WEBHOOK_URL'));
        if (webhookLine) {
            console.log(`   Found key: ${webhookLine.trim()}`);
            if (webhookLine.includes('webhook/poll-portal')) {
                console.log('   Value looks correctly formed.');
            } else {
                console.warn('   ⚠️ Value might be malformed or empty.');
            }
        } else {
            console.error('   ❌ N8N_INGESTION_WEBHOOK_URL key NOT found in file.');
        }
    } else {
        console.error(`❌ File NOT found: ${path.basename(filePath)}`);
    }
}

checkFile(envLocalPath);
checkFile(envPath);

console.log('\n--- Process Env Check (Node) ---');
// Try to load dotenv manually if available (Next.js does this internally)
try {
    require('dotenv').config({ path: '.env.local' });
} catch (e) {
    console.log('(dotenv package not found, checking raw process.env)');
}

console.log('N8N_INGESTION_WEBHOOK_URL:', process.env.N8N_INGESTION_WEBHOOK_URL || 'UNDEFINED');
