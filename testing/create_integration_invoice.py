
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

def create_invoice(filename):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter

    # Header
    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, height - 50, "INVOICE")

    # Vendor Details
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 80, "Vendor: TechSupply Inc")
    c.drawString(50, height - 95, "Address: 123 Tech Blvd, Silicon Valley, CA")
    
    # Invoice Details
    c.drawString(350, height - 80, "Invoice #: INT-TEST-001")
    c.drawString(350, height - 95, "Date: 2025-02-18")
    c.drawString(350, height - 110, "PO Number: 4500001005")

    # Line Items Header
    y = height - 150
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Description")
    c.drawString(250, y, "Qty")
    c.drawString(350, y, "Unit Price")
    c.drawString(450, y, "Total")
    
    # Line Items
    y -= 25
    c.setFont("Helvetica", 12)
    
    items = [
        ("Laptops", 10, 100.00),
        ("Printers", 5, 50.00)
    ]
    
    total = 0
    for desc, qty, price in items:
        line_total = qty * price
        total += line_total
        
        c.drawString(50, y, desc)
        c.drawString(250, y, str(qty))
        c.drawString(350, y, f"${price:,.2f}")
        c.drawString(450, y, f"${line_total:,.2f}")
        y -= 20

    # Total
    y -= 20
    c.setFont("Helvetica-Bold", 14)
    c.drawString(350, y, "TOTAL:")
    c.drawString(450, y, f"${total:,.2f}")

    # Footer
    c.setFont("Helvetica-Oblique", 10)
    c.drawString(50, 50, "Thank you for your business!")

    c.save()
    print(f"Created: {filename}")

if __name__ == "__main__":
    output_dir = "testing/invoices"
    os.makedirs(output_dir, exist_ok=True)
    create_invoice(os.path.join(output_dir, "Integration_Test_Invoice.pdf"))
