INSERT INTO invoices (
  invoice_number, 
  po_reference, 
  vendor_name_extracted, 
  total_amount, 
  google_file_id, 
  status
) VALUES (
  '{{ $json.invoice_number }}', 
  '{{ $json.po_reference }}', 
  '{{ $json.vendor_name }}', 
  {{ $json.total_amount || 0 }}, 
  '{{ $node["Download file"].json["id"] }}', 
  'PROCESSING'
) 
ON CONFLICT (google_file_id) 
DO UPDATE SET 
  invoice_number = EXCLUDED.invoice_number,
  vendor_name_extracted = EXCLUDED.vendor_name_extracted,
  total_amount = EXCLUDED.total_amount,
  updated_at = NOW();
