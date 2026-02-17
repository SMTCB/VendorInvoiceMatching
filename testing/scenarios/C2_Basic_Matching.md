# Cluster C2: Basic Three-Way Matching

Verify that the core matching logic correctly compares Invoice data against SAP `ekpo` records.

## C2-001: Perfect Match (All items aligned)
- **Goal:** Confirm `READY_TO_POST` status when Invoice matches PO exactly.
- **Test Data:** Invoice with 1 item, Qty 10, Price $50.00.
- **DB Requirements:** 
    - `ekpo` entry for PO `PO-1001` with `ordered_qty`: 10, `unit_price`: 50.00.
- **PDF Requirements:** Invoice `INV-101` referencing `PO-1001` with 1 line item: 10 units at $50.00 each.
- **Success Criteria:** 
    - `invoices.status` is `READY_TO_POST`.
    - `audit_trail` explains the perfect match.

## C2-002: Blocked Quantity (Over-delivery)
- **Goal:** Verify blockage when Invoice Qty > PO Open Qty.
- **Test Data:** Invoice Qty 15 vs PO Qty 10.
- **DB Requirements:** 
    - `ekpo` entry for PO `PO-1002` with `ordered_qty`: 10.
- **PDF Requirements:** Invoice `INV-102` referencing `PO-1002` with 15 units.
- **Success Criteria:** 
    - `invoices.status` is `BLOCKED_QTY`.
    - `exception_reason` cites "Quantity Variance".

## C2-003: Blocked Price (Inflation)
- **Goal:** Verify blockage when Invoice Price > PO Unit Price.
- **Test Data:** Invoice Price $55.00 vs PO Price $50.00.
- **DB Requirements:** 
    - `ekpo` entry for PO `PO-1003` with `unit_price`: 50.00.
- **PDF Requirements:** Invoice `INV-103` referencing `PO-1003` with unit price $55.00.
- **Success Criteria:** 
    - `invoices.status` is `BLOCKED_PRICE`.

## C2-004: Blocked Quantity (Under-delivery)
- **Goal:** Verify blockage when Invoice Qty < PO Open Qty (Partial shipment without prior notice).
- **Test Data:** Invoice Qty 5 vs PO Qty 10.
- **DB Requirements:** 
    - `ekpo` entry for PO `PO-1004` with `ordered_qty`: 10.
- **PDF Requirements:** Invoice `INV-104` referencing `PO-1004` with 5 units.
- **Success Criteria:** 
    - `invoices.status` is `BLOCKED_QTY` (unless a rule allows partials).
    - `audit_trail` explains the missing quantity.
