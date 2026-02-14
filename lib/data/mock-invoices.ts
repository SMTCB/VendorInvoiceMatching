export interface Invoice {
    id: string;
    invoice_number: string;
    po_reference: string;
    vendor_name_extracted: string;
    total_amount: number;
    status: 'PROCESSING' | 'READY_TO_POST' | 'BLOCKED_PRICE' | 'BLOCKED_QTY' | 'POSTED' | 'REJECTED' | 'AWAITING_INFO';
    pdf_link: string;
    exception_reason?: string | null;
    created_at: string;
    vendor_id?: string;
}

export interface POLine {
    id: string;
    po_number: string;
    line_item: number;
    material: string;
    ordered_qty: number;
    unit_price: number;
}

const MOCK_INVOICES: Invoice[] = [
    {
        id: 'inv-001',
        invoice_number: 'INV-2024-001',
        po_reference: '4500001001',
        vendor_name_extracted: 'TechGap Solutions',
        total_amount: 6000.00,
        status: 'READY_TO_POST',
        pdf_link: '#',
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        vendor_id: '1001'
    },
    {
        id: 'inv-002',
        invoice_number: 'INV-8859',
        po_reference: '4500001002',
        vendor_name_extracted: 'Office Depotless',
        total_amount: 1600.00,
        status: 'BLOCKED_PRICE',
        exception_reason: 'Unit Price Variance: PO $150.00 vs Inv $160.00',
        pdf_link: '#',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        vendor_id: '1002'
    },
    {
        id: 'inv-003',
        invoice_number: 'FF-9921',
        po_reference: '4500001003',
        vendor_name_extracted: 'FastFreight Logistics',
        total_amount: 5000.00,
        status: 'BLOCKED_QTY',
        exception_reason: 'Qty Variance: PO 1 vs Inv 2',
        pdf_link: '#',
        created_at: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
        vendor_id: '1003'
    },
    {
        id: 'inv-004',
        invoice_number: 'ISC-5501',
        po_reference: '4500001004',
        vendor_name_extracted: 'Industrial Steel Co',
        total_amount: 5000.00,
        status: 'AWAITING_INFO',
        exception_reason: 'Missing Goods Receipt',
        pdf_link: '#',
        created_at: new Date().toISOString(), // Today
        vendor_id: '1004'
    },
    {
        id: 'inv-005',
        invoice_number: 'BEAN-101',
        po_reference: '4500001005',
        vendor_name_extracted: 'BeanThere Coffee Services',
        total_amount: 350.00,
        status: 'POSTED',
        pdf_link: '#',
        created_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        vendor_id: '1005'
    }
];

const MOCK_PO_LINES: Record<string, POLine[]> = {
    '4500001001': [
        { id: 'po-1-1', po_number: '4500001001', line_item: 10, material: 'Laptops - Model X', ordered_qty: 5, unit_price: 1200.00 }
    ],
    '4500001002': [
        { id: 'po-2-1', po_number: '4500001002', line_item: 10, material: 'Office Chairs', ordered_qty: 10, unit_price: 150.00 }
    ],
    '4500001003': [
        { id: 'po-3-1', po_number: '4500001003', line_item: 10, material: 'Shipping Container 20ft', ordered_qty: 1, unit_price: 2500.00 }
    ],
    '4500001004': [
        { id: 'po-4-1', po_number: '4500001004', line_item: 10, material: 'Steel Beams', ordered_qty: 50, unit_price: 100.00 }
    ],
    '4500001005': [
        { id: 'po-5-1', po_number: '4500001005', line_item: 10, material: 'Coffee Beans (kg)', ordered_qty: 20, unit_price: 15.00 },
        { id: 'po-5-2', po_number: '4500001005', line_item: 20, material: 'Sugar Packets (Box)', ordered_qty: 5, unit_price: 10.00 }
    ]
};

export async function getInvoices() {
    return MOCK_INVOICES;
}

export async function getInvoice(id: string) {
    return MOCK_INVOICES.find(inv => inv.id === id) || null;
}

export async function getPOLines(poReference: string) {
    return MOCK_PO_LINES[poReference] || [];
}
