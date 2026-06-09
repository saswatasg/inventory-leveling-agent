import type { Bom, GrossRequirement, Order } from '../data/types'

/**
 * Explode every active order through its BOM into a consolidated gross
 * requirement per SKU, keeping a per-order trace so the math stays transparent.
 *
 *   gross(sku) = Σ over orders of  order.quantity × qtyPerUnit
 *
 * The trace (`contributions`) is what powers the "View BOM explosion" drill-down
 * and lets the tests assert Σ contributions === gross for every SKU.
 */
export function explodeBOM(orders: Order[], boms: Bom[]): GrossRequirement[] {
  const byOrderId = new Map(orders.map((o) => [o.id, o]))
  const acc = new Map<string, GrossRequirement>()

  for (const bom of boms) {
    const order = byOrderId.get(bom.orderId)
    if (!order) continue // a BOM with no matching active order contributes nothing

    for (const line of bom.lines) {
      const units = order.quantity * line.qtyPerUnit
      const existing = acc.get(line.skuCode)
      if (existing) {
        existing.gross += units
        existing.contributions.push({ orderId: order.id, units })
      } else {
        acc.set(line.skuCode, {
          skuCode: line.skuCode,
          gross: units,
          contributions: [{ orderId: order.id, units }],
        })
      }
    }
  }

  return [...acc.values()]
}
