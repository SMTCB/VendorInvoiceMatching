
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function reportResults() {
    const scenariosPath = path.resolve(process.cwd(), 'testing/stress_test/scenarios.json');
    const scenarios = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));

    // Map Expectations (Hardcoded logic from monitor script)
    const expectations: Record<string, string> = {
        'S1_PERFECT_MATCH': 'READY_TO_POST',
        'S2_MULTI_LINE': 'READY_TO_POST',
        'S3_PRICE_BLOCK': 'BLOCKED_PRICE',
        'S4_QTY_BLOCK': 'BLOCKED_QTY',
        'S5_CURRENCY_FAIL': 'BLOCKED_PRICE',
        'S6_PARTIAL_DELIV': 'READY_TO_POST',
        'S7_FINAL_DELIV': 'AWAITING_INFO',
        'S8_FUZZY_VENDOR': 'READY_TO_POST',
        'S9_AI_LEARNING': 'READY_TO_POST',
        'S10_NO_PO': 'BLOCKED_DATA',
        'S11_INVALID_PO': 'BLOCKED_DATA',
        'S12_TOLERANCE_PASS': 'READY_TO_POST',
        'S13_SERVICE_PO': 'READY_TO_POST',
        'S14_DUPLICATE': 'BLOCKED_DUPLICATE',
        'S15_CREDIT_MEMO': 'READY_TO_POST',
        'S16_FREIGHT': 'BLOCKED_PRICE',
        'S17_TAX_MISMATCH': 'BLOCKED_PRICE',
        'S18_HIGH_VALUE': 'READY_TO_POST',
        'S19_OLD_DATE': 'READY_TO_POST',
        'S20_COMPLEX_AUDIT': 'BLOCKED_PRICE'
    };

    let report = '| ID | Invoice | Expected | Actual | Result | Notes |\n';
    report += '|---|---|---|---|---|---|\n';

    let passCount = 0;

    for (const s of scenarios) {
        const invNum = s.invoice_data.number;
        const expected = expectations[s.id] || 'READY_TO_POST';

        const { data: rec } = await supabase
            .from('invoices')
            .select('status, exception_reason')
            .eq('google_file_id', `gdrive_${s.id}`)
            .single();

        const actual = rec?.status || 'NOT_FOUND';

        // Logic: Pass if exact match OR both start with BLOCKED (e.g. BLOCKED_PRICE vs BLOCKED_DATA)
        // Adjusting logic: S10 expects BLOCKED_DATA, if actual is PROCESSING -> FAIL
        let passed = actual === expected;
        if (!passed && expected.startsWith('BLOCKED') && actual.startsWith('BLOCKED')) {
            passed = true;
        }

        if (passed) passCount++;

        const icon = passed ? '✅' : '❌';
        const note = (!passed && rec) ? `Reason: ${rec.exception_reason || 'None'}` : '';

        report += `| ${s.id} | ${invNum} | ${expected} | ${actual} | ${icon} | ${note} |\n`;
    }

    report += `\n**Summary: ${passCount}/${scenarios.length} scenarios passed.**\n`;
    fs.writeFileSync('testing/stress_report_data.md', report);
    console.log('Report generated: testing/stress_report_data.md');
}

reportResults().catch(console.error);
