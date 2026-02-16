-- Add google_file_id column to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS google_file_id TEXT UNIQUE;

-- Add index for performance on lookups
CREATE INDEX IF NOT EXISTS idx_invoices_google_file_id ON invoices(google_file_id);
