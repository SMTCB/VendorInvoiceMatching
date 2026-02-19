
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

async function repro() {
    console.log('--- REPRODUCING S3 MATCHING ---');

    // Data from scenarios.json for S3
    const extractedData = {
        invoice_number: "INV-S3",
        po_reference: "4500002003",
        vendor_name: "TechGap Solutions",
        total_amount: 120.00,
        currency: "USD",
        line_items: [{ desc: "Expensive Widget", qty: 10, unit_price: 12.00 }],
        text: "Invoice INV-S3 for PO 4500002003. Total $120.00."
    };

    const poLines = [
        {
            po_number: "4500002003",
            line_item: 10,
            material: "MAT-S3_PRICE_BLOCK",
            open_qty: 10,
            unit_price: 10.00,
            currency: "USD"
        }
    ];

    const rules = [
        {
            name: "High Value Threshold",
            condition_field: "total_amount",
            operator: "greater_than",
            value: "5000",
            action: "flag_review"
        }
    ];

    // S9 Example (History) - TechGap Solutions
    const historicalExamples = [
        {
            vendor_name: "TechGap Solutions",
            scenario_description: "unit_price Mismatch (10 -> 10.5)",
            user_rationale: "Pre-approved price hike 2026",
            expected_status: "READY_TO_POST"
        }
    ];

    const prompt = `
  ==You are an expert Accounts Payable Controller. Your task is to perform a Three-Way Match: compare the extracted INVOICE against the SAP Purchase Order (PO) data.

**YOUR OBJECTIVE:**
Decide if the invoice is "READY_TO_POST" or if it should be "BLOCKED" due to price or quantity variances.

**INPUT DATA:**
1. **CURRENT INVOICE:** ${JSON.stringify(extractedData)}
2. **SAP PO LINES:** ${JSON.stringify(poLines)}
3. **BUSINESS RULES:** ${JSON.stringify(rules)}
4. **HISTORICAL EXAMPLES:** ${JSON.stringify(historicalExamples)}

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
- Historical Exception: If the "Historical Examples" show a similar discrepancy was approved for this vendor previously, you may consider it valid (Priority 2).

**TRACEABILITY (MANDATORY):**
In the \`audit_trail\` field, you must explain your logic. If you approve an invoice with a discrepancy, cite the specific Rule name or Historical Example. If you block it, state specifically: \"Blocked Price on Item X (Inv: $10 vs PO: $9.50)\".

**OUTPUT JSON ONLY:**
{
  "status": "READY_TO_POST" | "BLOCKED_PRICE" | "BLOCKED_QTY" | "AWAITING_INFO",
  "exception_reason": "Technical summary of variance or null",
  "audit_trail": "Explain your decision and which rules/history were applied here.",
  "confidence": 0-100
}
  `;

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
}

repro();
