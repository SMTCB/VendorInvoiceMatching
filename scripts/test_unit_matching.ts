
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

async function runTest(invoiceNumber: string) {
    console.log(`\n--- TESTING MATCHING LOGIC FOR: ${invoiceNumber} ---`);

    // 1. Fetch Invoice Data (Simulating extracted_data)
    const { data: invoice, error: invError } = await supabase
        .from('invoices')
        .select('*')
        .eq('invoice_number', invoiceNumber)
        .single();

    if (invError || !invoice) {
        console.error("Invoice not found:", invError);
        return;
    }

    const extractedData = {
        invoice_number: invoice.invoice_number,
        po_reference: invoice.po_reference || '',
        vendor_name: invoice.vendor_name_extracted,
        total_amount: invoice.total_amount,
        currency: invoice.currency,
        line_items: parsedLines(invoice.line_items),
        text: "INVOICE TEXT PLACEHOLDER (OCR)" // Simulate OCR text availability
    };

    console.log("Extracted Data:", JSON.stringify(extractedData, null, 2));

    // 2. Fetch PO Lines
    const poRef = (extractedData.po_reference || '').replace('PO', '').trim();
    const { data: poLines, error: poError } = await supabase
        .from('ekpo')
        .select('po_number, line_item, material, ordered_qty, unit_price') // Fetch relevant fields
        .eq('po_number', poRef);

    // Also need header currency
    const { data: poHeader } = await supabase
        .from('ekko')
        .select('currency')
        .eq('po_number', poRef)
        .single();

    if (poError) {
        console.error("PO Fetch Error:", poError);
    }

    const enhancedPOLines = poLines?.map(l => ({ ...l, currency: poHeader?.currency }));
    console.log("PO Data:", JSON.stringify(enhancedPOLines, null, 2));


    // 3. Fetch Rules (Mocked or Real)
    // For unit test, let's fetch real rules if possible, or mock basic ones
    const { data: rules } = await supabase
        .from('validator_rules')
        .select('*')
        .eq('is_active', true);

    console.log("Rules:", JSON.stringify(rules?.map(r => r.rule_name), null, 2));


    // 4. Construct Prompt
    const prompt = `
  ==You are an expert Accounts Payable Controller. Your task is to perform a Three-Way Match: compare the extracted INVOICE against the SAP Purchase Order (PO) data.

**YOUR OBJECTIVE:**
Decide if the invoice is "READY_TO_POST" or if it should be "BLOCKED" due to price or quantity variances.

**INPUT DATA:**
1. **CURRENT INVOICE:** ${JSON.stringify(extractedData)}
2. **SAP PO LINES:** ${JSON.stringify(enhancedPOLines)}
3. **BUSINESS RULES:** ${JSON.stringify(rules)}
4. **HISTORICAL EXAMPLES:** [] (Omitted for unit test)

**MATCHING LOGIC:**
- Default tolerance is 0%.
- **Currency Rule:** Invoice Currency (e.g., 'USD', 'EUR', '$', '€') MUST MATCH PO Currency. If mismatched (e.g., $50 vs €50), MARK AS "BLOCKED_PRICE" (Reason: "Currency Mismatch: Invoice in EUR vs PO in USD").
- Price Rule: Invoice Unit Price must match PO Unit Price (Check \`line_items\` in the Current Invoice if available).
- Quantity Rule: Invoice Qty must be less than or equal to PO Open Qty.
  - IF Qty < PO Qty: 
    - CHECK FOR "FINAL"/"CLOSED"/"LAST" keywords in the Invoice text (or OCR). IF FOUND: MARK AS "AWAITING_INFO" (Explanation: "Short delivery marked as Final Bill - Review required").
    - IF NOT FOUND: MARK AS "READY_TO_POST" (Valid Partial Delivery).
  - IF Qty > PO Qty: MARK AS "BLOCKED_QTY".
- Rule Exception: If a "Validation Rule" or "Exception" exists in the prompt that allows a variance, follow that rule (Priority 1).

**TRACEABILITY (MANDATORY):**
In the \`audit_trail\` field, you must explain your logic. If you approve an invoice with a discrepancy, cite the specific Rule name. If you block it, state specifically: "Blocked Price on Item X (Inv: $10 vs PO: $9.50)".

**OUTPUT JSON ONLY:**
{
  "status": "READY_TO_POST" | "BLOCKED_PRICE" | "BLOCKED_QTY" | "AWAITING_INFO",
  "exception_reason": "Technical summary of variance or null",
  "audit_trail": "Explain your decision and which rules/history were applied here.",
  "confidence": 0-100
}
  `;

    // 5. Call LLM
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("\n--- LLM RESULT ---");
        console.log(text);

        // Parse JSON
        try {
            const json = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
            console.log("\nParsed JSON:", json);

            // 6. Update DB (Simulated)
            console.log(`\n[SIMULATION] Updating Invoice ${invoiceNumber} -> status: ${json.status}`);

        } catch (e) {
            console.error("Failed to parse LLM JSON:", e);
        }

    } catch (error) {
        console.error("LLM Error:", error);
    }
}

function parsedLines(lines: any) {
    if (typeof lines === 'string') {
        try { return JSON.parse(lines); } catch { return []; }
    }
    return lines || [];
}

// Run for a known stressed invoice
runTest('STRESS-C3-001-1');
