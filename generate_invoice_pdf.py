from fpdf import FPDF
import os

class PDF(FPDF):
    def header(self):
        # Logo placeholder
        self.set_font('Arial', 'B', 15)
        self.cell(80)
        self.cell(30, 10, 'INVOICE', 0, 0, 'C')
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, 'Page ' + str(self.page_no()), 0, 0, 'C')

def create_invoice(filename):
    pdf = PDF()
    pdf.add_page()
    
    # Vendor Info
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, 'TechGap Solutions', 0, 1)
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 5, '789 Innovation Way', 0, 1)
    pdf.cell(0, 5, 'Brick City, NY 10001', 0, 1)
    pdf.cell(0, 5, 'billing@techgap.solutions', 0, 1)
    
    pdf.ln(10)
    
    # Invoice Details
    pdf.set_fill_color(240, 240, 240)
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(50, 8, 'Invoice Number:', 1, 0, 'L', 1)
    pdf.set_font('Arial', '', 10)
    pdf.cell(50, 8, 'INV-LEGO-789', 1, 1, 'L')
    
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(50, 8, 'Date:', 1, 0, 'L', 1)
    pdf.set_font('Arial', '', 10)
    pdf.cell(50, 8, '2026-02-16', 1, 1, 'L')
    
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(50, 8, 'PO Reference:', 1, 0, 'L', 1)
    pdf.set_font('Arial', '', 10)
    pdf.cell(50, 8, '4500001005', 1, 1, 'L')
    
    pdf.ln(15)
    
    # Line Items Header
    pdf.set_font('Arial', 'B', 10)
    pdf.set_fill_color(200, 200, 200)
    pdf.cell(80, 10, 'Description', 1, 0, 'C', 1)
    pdf.cell(30, 10, 'Quantity', 1, 0, 'C', 1)
    pdf.cell(40, 10, 'Unit Price', 1, 0, 'C', 1)
    pdf.cell(40, 10, 'Total', 1, 1, 'C', 1)
    
    # Line Items
    pdf.set_font('Arial', '', 10)
    pdf.cell(80, 10, 'Lego Millenium Falcon (75192)', 1, 0, 'L')
    pdf.cell(30, 10, '1', 1, 0, 'C')
    pdf.cell(40, 10, '$849.99', 1, 0, 'R')
    pdf.cell(40, 10, '$849.99', 1, 1, 'R')
    
    pdf.cell(80, 10, 'Lego Death Star (10188)', 1, 0, 'L')
    pdf.cell(30, 10, '1', 1, 0, 'C')
    pdf.cell(40, 10, '$499.99', 1, 0, 'R')
    pdf.cell(40, 10, '$499.99', 1, 1, 'R')
    
    pdf.ln(5)
    
    # Totals
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(150, 10, 'Subtotal', 0, 0, 'R')
    pdf.cell(40, 10, '$1,349.98', 1, 1, 'R')
    
    pdf.cell(150, 10, 'Tax (0%)', 0, 0, 'R')
    pdf.cell(40, 10, '$0.00', 1, 1, 'R')
    
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(150, 10, 'Total Amount', 0, 0, 'R')
    pdf.set_fill_color(220, 255, 220)
    pdf.cell(40, 10, '$1,349.98', 1, 1, 'R', 1)
    
    pdf.ln(20)
    pdf.set_font('Arial', 'I', 10)
    pdf.cell(0, 10, 'Thank you for your business!', 0, 1, 'C')


    pdf.output(filename)
    print(f"Successfully generated {filename}")

if __name__ == '__main__':
    try:
        create_invoice('test_invoice_4500001005.pdf')
    except Exception as e:
        print(f"Error: {e}")
