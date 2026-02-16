-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Vendors (lfa1) - Simulated SAP Table
CREATE TABLE IF NOT EXISTS lfa1 (
    vendor_id TEXT PRIMARY KEY, -- SAP Vendor Number (e.g., "100050")
    name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Purchase Order Header (ekko) - Simulated SAP Table
CREATE TABLE IF NOT EXISTS ekko (
    po_number TEXT PRIMARY KEY, -- PO Number (e.g., "4500001234")
    vendor_id TEXT REFERENCES lfa1(vendor_id),
    company_code TEXT DEFAULT '1000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Purchase Order Items (ekpo) - Simulated SAP Table
CREATE TABLE IF NOT EXISTS ekpo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number TEXT REFERENCES ekko(po_number),
    line_item INTEGER NOT NULL, -- 10, 20, 30...
    material TEXT NOT NULL, -- SKU/Description
    ordered_qty NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(po_number, line_item)
);

-- 4. Goods Receipt History (mseg) - Simulated SAP Table
CREATE TABLE IF NOT EXISTS mseg (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number TEXT REFERENCES ekko(po_number),
    po_line_item INTEGER NOT NULL, -- Logical link to ekpo line_item
    received_qty NUMERIC(10, 2) NOT NULL,
    movement_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Invoices (invoices) - Application Main Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT,
    po_reference TEXT, -- Extracted PO Number
    vendor_name_extracted TEXT,
    total_amount NUMERIC(10, 2),
    status TEXT DEFAULT 'PROCESSING', -- PROCESSING, READY_TO_POST, BLOCKED_PRICE, BLOCKED_QTY, POSTED, REJECTED, AWAITING_INFO
    pdf_link TEXT, -- Google Drive Link or ID
    exception_reason TEXT,
    is_test_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Learning Examples (learning_examples) - AI Feedback Loop
CREATE TABLE IF NOT EXISTS learning_examples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id TEXT, -- Can be null if it applies generally, or linked to lfa1
    scenario_type TEXT NOT NULL, -- PRICE_VARIANCE, MISSING_GR, etc.
    input_context JSONB, -- Context data (variance amount, item name, etc.)
    user_decision TEXT NOT NULL, -- ACCEPTED, REJECTED
    reasoning TEXT, -- User comment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_po_reference ON invoices(po_reference);
CREATE INDEX IF NOT EXISTS idx_learning_vendor ON learning_examples(vendor_id);
