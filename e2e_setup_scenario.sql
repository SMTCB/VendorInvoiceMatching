-- 1. Create a Vendor (lfa1)
INSERT INTO lfa1 (vendor_id, name)
VALUES ('100050', 'TechGap Solutions');

-- 2. Create the PO Header (ekko)
INSERT INTO ekko (po_number, vendor_id, company_code)
VALUES ('4500001005', '100050', '1000');

-- 3. Create PO Items (ekpo)
INSERT INTO ekpo (po_number, line_item, material, ordered_qty, unit_price)
VALUES 
('4500001005', 10, 'Lego Millenium Falcon (75192)', 1, 849.99),
('4500001005', 20, 'Lego Death Star (10188)', 1, 499.99);

-- 4. Create the Goods Receipt (mseg)
INSERT INTO mseg (po_number, po_line_item, received_qty)
VALUES 
('4500001005', 10, 1),
('4500001005', 20, 1);

-- 5. Add an Exception Rule
INSERT INTO exception_rules (rule_name, vendor_name, rule_description, system_prompt_addition)
VALUES 
('Lego Promo Discount', 'TechGap Solutions', 'Allow 10% discount if noted', 'If the invoice price is lower than the PO price for TechGap Solutions, consider it a MATCH as they often provide unannounced discounts.');

-- 6. Add a Learning Example
INSERT INTO ai_learning_examples (scenario_description, user_rationale, expected_status)
VALUES 
('Unit Price Mismatch ($849 vs $850)', 'Small $0.01 rounding errors should be ignored.', 'READY_TO_POST');
