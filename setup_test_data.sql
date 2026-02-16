-- Clean up previous test data if it exists
DELETE FROM mseg WHERE po_number = '4500001005';
DELETE FROM ekpo WHERE po_number = '4500001005';
DELETE FROM ekko WHERE po_number = '4500001005';
DELETE FROM lfa1 WHERE vendor_id = '100050';

-- 1. Insert Vendor
INSERT INTO lfa1 (vendor_id, name, email)
VALUES ('100050', 'TechParts Ltd', 'billing@techparts.com');

-- 2. Insert Purchase Order Header
INSERT INTO ekko (po_number, vendor_id, company_code)
VALUES ('4500001005', '100050', '1000');

-- 3. Insert PO Line Items
-- Item 1: 10x Laptops at $1200.00 each
INSERT INTO ekpo (po_number, line_item, material, ordered_qty, unit_price)
VALUES ('4500001005', 10, 'Gaming Laptop Pro X', 10, 1200.00);

-- 4. Insert Goods Receipt (GR)
-- We received all 10 items yesterday
INSERT INTO mseg (po_number, po_line_item, received_qty, movement_date)
VALUES ('4500001005', 10, 10, CURRENT_DATE - 1);

-- TEST SCENARIO EXPECTATION:
-- Invoice for 10 units @ $1200.00 should MATCH perfectly.
