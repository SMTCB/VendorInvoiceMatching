from fpdf import FPDF
import argparse
import json
import os

class InvoicePDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'INVOICE', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def generate_pdf_from_data(output_path, data):
    pdf = InvoicePDF()
    pdf.add_page()
    
    # Vendor Info
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, data.get('vendor', 'Unknown Vendor'), 0, 1)
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 5, '123 Business Road', 0, 1)
    pdf.cell(0, 5, 'City, State, 12345', 0, 1)
    
    pdf.ln(10)
    
    # Details
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(40, 8, 'Invoice #:', 0, 0)
    pdf.set_font('Arial', '', 10)
    pdf.cell(60, 8, data.get('invoice_data', {}).get('number', 'INV-000'), 0, 1)
    
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(40, 8, 'PO Reference:', 0, 0)
    pdf.set_font('Arial', '', 10)
    po_data = data.get('po_data')
    po_ref = po_data.get('number', 'N/A') if po_data else 'N/A'
    pdf.cell(60, 8, po_ref, 0, 1)

    # Date Override
    if 'text_content' in data and 'Date:' in data['text_content']:
        pdf.set_font('Arial', 'B', 10)
        pdf.cell(40, 8, 'Date:', 0, 0)
        pdf.set_font('Arial', '', 10)
        # Extract date roughly or just print
        pdf.cell(60, 8, '2024-01-01', 0, 1) # hardcoded for S19 based on scenario desc

    pdf.ln(10)
    
    # Text Content (e.g. "FINAL", "CREDIT MEMO")
    if data.get('text_content'):
        pdf.set_font('Arial', 'I', 10)
        pdf.multi_cell(0, 10, data['text_content'])
        pdf.ln(5)

    # Table Header
    pdf.set_font('Arial', 'B', 10)
    pdf.set_fill_color(230, 230, 230)
    pdf.cell(80, 10, 'Description', 1, 0, 'C', 1)
    pdf.cell(30, 10, 'Qty', 1, 0, 'C', 1)
    pdf.cell(40, 10, 'Unit Price', 1, 0, 'C', 1)
    pdf.cell(40, 10, 'Total', 1, 1, 'C', 1)
    
    # Prepare Items
    items = []
    # Primary Line
    if data.get('line_item'):
        items.append(data['line_item'])
    # Extra Lines
    if data.get('extra_inv_lines'):
        items.extend(data['extra_inv_lines'])

    # Items Render
    pdf.set_font('Arial', '', 10)
    currency_fmt = "{value:,.2f} " + data.get('invoice_data', {}).get('currency', 'USD')
    if data.get('invoice_data', {}).get('currency') == 'EUR':
         currency_fmt = "{value:,.2f} EUR" # Simple override
    elif data.get('invoice_data', {}).get('currency') == 'USD':
         currency_fmt = "${value:,.2f}"

    for item in items:
        pdf.cell(80, 10, item['desc'], 1, 0, 'L')
        pdf.cell(30, 10, str(item['qty']), 1, 0, 'C')
        price_str = currency_fmt.format(value=item['unit_price'])
        # Calc total line
        line_total = item['qty'] * item['unit_price']
        total_str = currency_fmt.format(value=line_total)
        pdf.cell(40, 10, price_str, 1, 0, 'R')
        pdf.cell(40, 10, total_str, 1, 1, 'R')
    
    pdf.ln(5)
    
    # Total
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(150, 10, 'Total Amount:', 0, 0, 'R')
    total_val = data.get('invoice_data', {}).get('total', 0.0)
    total_fmt = currency_fmt.format(value=total_val)
    pdf.cell(40, 10, total_fmt, 1, 1, 'R')
    
    pdf.output(output_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", required=True, help="JSON string of scenario data")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    
    data = json.loads(args.json)
    generate_pdf_from_data(args.output, data)


