-- 1. Wipe dependent tables first (mseg = Goods Receipt)
DELETE FROM ai_learning_examples;
DELETE FROM learning_examples;
DELETE FROM mseg;

-- 2. Wipe main tables (ekpo = PO items, ekko = PO header, lfa1 = Vendors)
DELETE FROM invoices;
DELETE FROM ekpo;
DELETE FROM ekko;
DELETE FROM lfa1;
DELETE FROM exception_rules;
