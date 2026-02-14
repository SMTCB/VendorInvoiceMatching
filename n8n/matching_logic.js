// n8n Code Node: 3-Way Match Logic

// Input Check
const invoice = items[0].json.invoice; // From AI Agent
const poData = items[0].json.sapData;  // From Supabase (ekko/ekpo)
const grData = items[0].json.grData;   // From Supabase (mseg)
const learningHistory = items[0].json.learningHistory || [];

let status = 'READY_TO_POST';
let exceptionReason = null;

// Helper to sum GR quantity
const getReceivedQty = (poNum, lineItem) => {
    return grData
        .filter(gr => gr.po_number === poNum && gr.po_line_item === lineItem)
        .reduce((sum, gr) => sum + parseFloat(gr.received_qty), 0);
};

// 1. PO Existence Check
if (!poData || poData.length === 0) {
    return {
        json: {
            ...items[0].json,
            status: 'REJECTED',
            exception_reason: 'PO Not Found in SAP'
        }
    };
}

// 2. Line Item Matching
for (const line of invoice.lineItems) {
    const sapLine = poData.find(p => p.material === line.sku || p.line_item === line.line_item);

    if (!sapLine) {
        status = 'AWAITING_INFO';
        exceptionReason = `Unknown Item: ${line.sku}`;
        continue;
    }

    // 2a. Quantity Check
    // Total previously billed + current invoice qty vs Ordered
    // Simplified: Just check against GR for now (3-way)
    const totalReceived = getReceivedQty(sapLine.po_number, sapLine.line_item);

    if (parseFloat(line.quantity) > totalReceived) {
        // Exception: Billing for more than received
        status = 'BLOCKED_QTY';
        exceptionReason = `Qty Variance: Invoiced ${line.quantity}, Received ${totalReceived}`;
    }

    // 2b. Price Check
    const poPrice = parseFloat(sapLine.unit_price);
    const invPrice = parseFloat(line.unit_price);
    const variance = Math.abs(invPrice - poPrice);

    // Tolerance (e.g., $0.50)
    if (variance > 0.50) {
        // Check Learning History
        const learned = learningHistory.find(l =>
            l.scenario_type === 'PRICE_VARIANCE' &&
            l.user_decision === 'ACCEPTED' &&
            // Simple heuristic matches
            Math.abs(l.input_context?.diff) >= variance
        );

        if (learned) {
            // Auto-resolve based on history
            // We keep it READY_TO_POST but maybe flag it?
            // For now, accept it.
        } else {
            status = 'BLOCKED_PRICE';
            exceptionReason = `Price Variance: Invoiced ${invPrice}, PO ${poPrice}`;
        }
    }
}

return {
    json: {
        ...items[0].json,
        final_status: status,
        final_reason: exceptionReason
    }
};
