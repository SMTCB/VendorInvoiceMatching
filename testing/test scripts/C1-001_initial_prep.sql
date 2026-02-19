-- Test Case: C1-001 (Platform Webhook Trigger)
-- Description: Prepare environment for initial ingestion test.

-- 1. Ensure the PO exists in SAP (ekpo)
INSERT INTO ekpo (po_number, line_item, material, ordered_qty, unit_price, vendor_name)
VALUES ('4500001005', 10, 'Tech Consulting - Level 1', 10, 50.00, 'TechGap Solutions')
ON CONFLICT (po_number, line_item) DO UPDATE 
SET ordered_qty = 10, unit_price = 50.00, vendor_name = 'TechGap Solutions';

-- 2. Cleanup previous test runs for this PO to ensure fresh state
DELETE FROM invoices WHERE po_reference = '4500001005';
