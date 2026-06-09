import type { SkuAnalysis } from '../data/types'

export interface Alert {
  skuCode: string
  name: string
  onHand: number
  minLevel: number
  belowMinBy: number
  status: SkuAnalysis['status']
}

/**
 * Items currently sitting below their minimum stock level — i.e. anything the
 * agent would raise its hand about right now. Worst (furthest below) first.
 */
export function alerts(rows: SkuAnalysis[]): Alert[] {
  return rows
    .filter((r) => r.sku.onHand < r.minLevel)
    .map((r) => ({
      skuCode: r.sku.code,
      name: r.sku.name,
      onHand: r.sku.onHand,
      minLevel: r.minLevel,
      belowMinBy: r.belowMinBy,
      status: r.status,
    }))
    .sort((a, b) => b.belowMinBy - a.belowMinBy)
}
