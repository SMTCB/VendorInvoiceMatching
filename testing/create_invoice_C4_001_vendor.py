from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)

# Header - INTENTIONAL VENDOR NAME VARIATION
# PO Vendor: "TechGap Solutions"
# Invoice Vendor: "Tech Gap Inc."
pdf.set_font("Arial", 'B', 16)
pdf.cell(200, 10, txt="Tech Gap Inc.", ln=True, align='L') # Variation
pdf.set_font("Arial", size=10)
pdf.cell(200, 10, txt="123 Innovation Drive, Tech City, TX 75001", ln=True, align='L')
pdf.cell(200, 10, txt="Phone: (555) 123-4567 | Email: billing@techgap.com", ln=True, align='L')

pdf.ln(10)

# Invoice Details
pdf.set_font("Arial", 'B', 12)
pdf.cell(100, 10, txt="INVOICE #C4-001-VENDOR", ln=0, align='L')
pdf.cell(90, 10, txt="Date: 2024-07-01", ln=1, align='R')
pdf.ln(5)

# Bill To
pdf.set_font("Arial", 'B', 10)
pdf.cell(100, 10, txt="Bill To:", ln=1, align='L')
pdf.set_font("Arial", size=10)
pdf.cell(100, 5, txt="Smart Manufacturing Corp", ln=1, align='L')
pdf.cell(100, 5, txt="Attn: Accounts Payable", ln=1, align='L')
pdf.cell(100, 5, txt="PO Reference: 4500001005", ln=1, align='L')

pdf.ln(20)

# Line Items Table Header
pdf.set_font("Arial", 'B', 10)
pdf.cell(80, 10, txt="Description", border=1, align='C')
pdf.cell(30, 10, txt="Quantity", border=1, align='C')
pdf.cell(30, 10, txt="Unit Price", border=1, align='C')
pdf.cell(30, 10, txt="Total", border=1, align='C')
pdf.ln()

# Line Items (Correct Price & Qty - Only Vendor Name is different)
pdf.set_font("Arial", size=10)
pdf.cell(80, 10, txt="Tech Consulting - Level 1", border=1)
pdf.cell(30, 10, txt="10", border=1, align='C')
pdf.cell(30, 10, txt="$50.00", border=1, align='R')
pdf.cell(30, 10, txt="$500.00", border=1, align='R')
pdf.ln()

# Totals
pdf.ln(5)
pdf.set_font("Arial", 'B', 10)
pdf.cell(140, 10, txt="Subtotal:", align='R')
pdf.cell(30, 10, txt="$500.00", align='R', ln=1)

pdf.cell(140, 10, txt="Tax (8.25%):", align='R')
pdf.cell(30, 10, txt="$41.25", align='R', ln=1)

pdf.set_font("Arial", 'B', 12)
pdf.cell(140, 10, txt="Total Due:", align='R')
pdf.cell(30, 10, txt="$541.25", align='R', ln=1)

# Footer
pdf.ln(20)
pdf.set_font("Arial", 'I', 8)
pdf.cell(0, 10, txt="Thank you for your business. Payment due within 30 days.", align='C')

pdf.output("testing/test_data/C4-001_vendor_name_mismatch.pdf")
print("PDF Generated: testing/test_data/C4-001_vendor_name_mismatch.pdf")
