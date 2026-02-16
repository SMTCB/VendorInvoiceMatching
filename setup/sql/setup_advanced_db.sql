-- Create table for User-Defined Exception Rules
CREATE TABLE IF NOT EXISTS exception_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name TEXT NOT NULL,
    vendor_name TEXT, -- specific vendor (optional)
    rule_description TEXT NOT NULL, -- "Allow up to 5% price variance"
    system_prompt_addition TEXT NOT NULL, -- exact text to add to LLM prompt
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed an example rule
INSERT INTO exception_rules (rule_name, vendor_name, rule_description, system_prompt_addition)
VALUES 
('Small Variance Tolerance', NULL, 'Allow small price differences', 'If the Invoice Unit Price is within 2% of the PO Unit Price, consider it a MATCH (ignore small rounding errors).'),
('Office Depot Tolerance', 'Office Depotless', 'Allow 5% for this vendor', 'For vendor "Office Depotless", allow up to 5% price variance.');

-- Create table for AI Learning (Feedback Loop)
CREATE TABLE IF NOT EXISTS ai_learning_examples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id),
    scenario_description TEXT, -- "Price was higher but approved manually"
    user_rationale TEXT, -- "Approved because it was a rush order"
    expected_status TEXT, -- "READY_TO_POST"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (Simple for now)
ALTER TABLE exception_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for all" ON exception_rules FOR SELECT USING (true);

ALTER TABLE ai_learning_examples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for all" ON ai_learning_examples FOR SELECT USING (true);
CREATE POLICY "Allow insert access for all" ON ai_learning_examples FOR INSERT WITH CHECK (true);
