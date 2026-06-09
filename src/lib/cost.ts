import { HOLDING_RATE } from '../data'
import type { CostImpact, Order, SkuAnalysis } from '../data/types'

/**
 * Translate the leveling analysis into the two numbers a plant manager cares
 * about: cash trapped in overstock, and revenue exposed to stockouts.
 *
 *   holdingCostFreed   = Σ overstock excess × unitCost × annual holding rate
 *   capitalInOverstock = Σ overstock excess × unitCost
 *   shortageExposure   = Σ critical shortage units × unitCost
 *   ordersAtRisk       = orders with ≥1 Critical component, and their revenue
 *
 * where overstock excess = onHand − (gross + safetyStock).
 */
export function costImpact(rows: SkuAnalysis[], orders: Order[]): CostImpact {
  const valueByOrderId = new Map(orders.map((o) => [o.id, o.value]))

  let holdingCostFreed = 0
  let capitalInOverstock = 0
  let shortageExposure = 0
  const atRiskOrderIds = new Set<string>()

  for (const r of rows) {
    if (r.status === 'Overstocked') {
      const excessUnits = r.sku.onHand - (r.gross + r.sku.safetyStock)
      capitalInOverstock += excessUnits * r.sku.unitCost
      holdingCostFreed += excessUnits * r.sku.unitCost * HOLDING_RATE
    }
    if (r.status === 'Critical') {
      shortageExposure += r.net * r.sku.unitCost
      for (const c of r.contributions) atRiskOrderIds.add(c.orderId)
    }
  }

  const ordersAtRiskValue = [...atRiskOrderIds].reduce(
    (sum, id) => sum + (valueByOrderId.get(id) ?? 0),
    0,
  )

  return {
    holdingCostFreed,
    capitalInOverstock,
    shortageExposure,
    ordersAtRiskValue,
    ordersAtRiskCount: atRiskOrderIds.size,
  }
}
