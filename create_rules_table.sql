-- Create the AI Validator Rules table
CREATE TABLE IF NOT EXISTS validator_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    condition_field TEXT NOT NULL, -- e.g., 'vendor_name', 'total_amount', 'po_reference'
    operator TEXT NOT NULL,        -- e.g., 'equals', 'contains', 'greater_than', 'less_than'
    value TEXT NOT NULL,           -- The value to compare against
    action TEXT NOT NULL,          -- e.g., 'auto_approve', 'flag_review', 'reject'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE validator_rules ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read/write for the POC
CREATE POLICY "Allow all authenticated users" ON validator_rules
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Insert some sample rules
INSERT INTO validator_rules (name, condition_field, operator, value, action)
VALUES 
    ('TechParts Auto-Approve', 'vendor_name', 'equals', 'TechParts Ltd', 'auto_approve'),
    ('High Value Threshold', 'total_amount', 'greater_than', '5000', 'flag_review'),
    ('Legacy PO Block', 'po_reference', 'contains', 'PO-2023', 'reject');
