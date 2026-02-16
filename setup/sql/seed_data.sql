-- SEED DATA SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Clear existing data (Optional - Remove if you want to keep existing data)
TRUNCATE TABLE invoices, learning_examples, mseg, ekpo, ekko, lfa1 CASCADE;

-- 2. Insert Vendors (lfa1)
INSERT INTO lfa1 (vendor_id, name, email) VALUES
('1001', 'TechGap Solutions', 'billing@techgap.com'),
('1002', 'Office Depotless', 'accounts@depotless.com'),
('1003', 'FastFreight Logistics', 'invoice@fastfreight.com'),
('1004', 'Industrial Steel Co', 'ar@industrialsteel.com'),
('1005', 'BeanThere Coffee Services', 'billing@beanthere.com');

-- 3. Insert Purchase Orders (ekko)
INSERT INTO ekko (po_number, vendor_id, company_code) VALUES
('4500001001', '1001', '1000'), -- Perfect Match PO
('4500001002', '1002', '1000'), -- Price Variance PO
('4500001003', '1003', '1000'), -- Qty Variance PO
('4500001004', '1004', '1000'), -- Missing GR PO
('4500001005', '1005', '1000'); -- Multiple Line Items PO

-- 4. Insert PO Items (ekpo)
INSERT INTO ekpo (po_number, line_item, material, ordered_qty, unit_price) VALUES
('4500001001', 10, 'Laptops - Model X', 5, 1200.00),
('4500001002', 10, 'Office Chairs', 10, 150.00),
('4500001003', 10, 'Shipping Container 20ft', 1, 2500.00),
('4500001004', 10, 'Steel Beams', 50, 100.00),
('4500001005', 10, 'Coffee Beans (kg)', 20, 15.00),
('4500001005', 20, 'Sugar Packets (Box)', 5, 10.00);

-- 5. Insert Goods Receipts (mseg)
INSERT INTO mseg (po_number, po_line_item, received_qty, movement_date) VALUES
('4500001001', 10, 5, CURRENT_DATE - 5),
('4500001002', 10, 10, CURRENT_DATE - 3),
('4500001003', 10, 1, CURRENT_DATE - 2),
-- PO 1004 (Steel Beams) has NO GR (Missing GR scenario)
('4500001005', 10, 20, CURRENT_DATE - 1),
('4500001005', 20, 5, CURRENT_DATE - 1);


-- 6. Insert Invoices (invoices) - The Application Data

-- Scenario 1: Perfect Match (READY_TO_POST)
INSERT INTO invoices (invoice_number, po_reference, vendor_name_extracted, total_amount, status, pdf_link, created_at)
VALUES ('INV-2024-001', '4500001001', 'TechGap Solutions', 6000.00, 'READY_TO_POST', 'https://example.com/pdf1.pdf', NOW() - INTERVAL '2 days');

-- Scenario 2: Price Variance (BLOCKED_PRICE) - Vendor charged 160 instead of 150
INSERT INTO invoices (invoice_number, po_reference, vendor_name_extracted, total_amount, status, exception_reason, pdf_link, created_at)
VALUES ('INV-8859', '4500001002', 'Office Depotless', 1600.00, 'BLOCKED_PRICE', 'Unit Price Variance: PO 150.00 vs Inv 160.00', 'https://example.com/pdf2.pdf', NOW() - INTERVAL '1 day');

-- Scenario 3: Quantity Variance (BLOCKED_QTY) - Vendor billed for 2 containers instead of 1
INSERT INTO invoices (invoice_number, po_reference, vendor_name_extracted, total_amount, status, exception_reason, pdf_link, created_at)
VALUES ('FF-9921', '4500001003', 'FastFreight Logistics', 5000.00, 'BLOCKED_QTY', 'Qty Variance: PO 1 vs Inv 2', 'https://example.com/pdf3.pdf', NOW() - INTERVAL '4 hours');

-- Scenario 4: Missing GR (AWAITING_INFO) - Goods not yet received in SAP
INSERT INTO invoices (invoice_number, po_reference, vendor_name_extracted, total_amount, status, exception_reason, pdf_link, created_at)
VALUES ('ISC-5501', '4500001004', 'Industrial Steel Co', 5000.00, 'AWAITING_INFO', 'Missing Goods Receipt', 'https://example.com/pdf4.pdf', NOW());

-- Scenario 5: Already Posted (POSTED)
INSERT INTO invoices (invoice_number, po_reference, vendor_name_extracted, total_amount, status, pdf_link, created_at)
VALUES ('BEAN-101', '4500001005', 'BeanThere Coffee Services', 350.00, 'POSTED', 'https://example.com/pdf5.pdf', NOW() - INTERVAL '5 days');

-- Scenario 6: Processing (PROCESSING)
INSERT INTO invoices (invoice_number, po_reference, vendor_name_extracted, total_amount, status, pdf_link, created_at)
VALUES ('INV-NEW-001', '4500001001', 'TechGap Solutions', 6000.00, 'PROCESSING', 'https://example.com/pdf6.pdf', NOW());

-- 7. Insert Learning Examples
INSERT INTO learning_examples (vendor_id, scenario_type, input_context, user_decision, reasoning)
VALUES
('1002', 'PRICE_VARIANCE', '{"diff_percent": 5, "item": "chairs"}', 'ACCEPTED', 'Vendor increased prices this year, approved by procurement.');
