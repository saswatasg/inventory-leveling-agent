import type { Bom, Order, Sku, SkuAnalysis } from '../data/types'
import { classify } from './classify'
import { explodeBOM } from './explodeBOM'
import { minimumStockLevel } from './minimumStockLevel'

/**
 * The heart of the agent: combine demand (exploded BOMs) with supply (on-hand +
 * open POs) into a per-SKU netting and classification.
 *
 *   net        = gross − onHand − incomingPO        (positive ⇒ shortage)
 *   minLevel   = gross + safetyStock − incomingPO
 *   belowMinBy = minLevel − onHand  ( ≡ net + safetyStock )
 *
 * Returns one row per SKU, sorted Critical → Low → Optimal → Overstocked then by
 * how far below minimum it sits, so the worst items float to the top.
 */
const STATUS_ORDER: Record<string, number> = {
  Critical: 0,
  Low: 1,
  Optimal: 2,
  Overstocked: 3,
}

export function netRequirements(skus: Sku[], orders: Order[], boms: Bom[]): SkuAnalysis[] {
  const grossBySku = new Map(explodeBOM(orders, boms).map((g) => [g.skuCode, g]))

  const rows: SkuAnalysis[] = skus.map((sku) => {
    const g = grossBySku.get(sku.code)
    const gross = g?.gross ?? 0
    const contributions = g?.contributions ?? []

    const net = gross - sku.onHand - sku.incomingPoQty
    const minLevel = minimumStockLevel(sku, gross)
    const belowMinBy = minLevel - sku.onHand
    const status = classify({
      onHand: sku.onHand,
      gross,
      safetyStock: sku.safetyStock,
      net,
      belowMinBy,
    })

    return { sku, gross, contributions, net, minLevel, belowMinBy, status }
  })

  return rows.sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.belowMinBy - a.belowMinBy,
  )
}
