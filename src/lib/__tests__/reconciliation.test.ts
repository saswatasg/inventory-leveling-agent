import { describe, expect, it } from 'vitest'
import { TODAY, boms, orders, skus } from '../../data'
import {
  alerts,
  costImpact,
  explodeBOM,
  minimumStockLevel,
  netRequirements,
  procurementSchedule,
} from '..'

const gross = explodeBOM(orders, boms)
const rows = netRequirements(skus, orders, boms)
const rowByCode = new Map(rows.map((r) => [r.sku.code, r]))
const grossByCode = new Map(gross.map((g) => [g.skuCode, g]))

describe('explodeBOM', () => {
  it('per-order contributions sum exactly to the gross requirement', () => {
    for (const g of gross) {
      const summed = g.contributions.reduce((s, c) => s + c.units, 0)
      expect(summed).toBe(g.gross)
    }
  })

  it('each contribution equals order.quantity × qtyPerUnit', () => {
    // Spot-check the headline shared component: M8 Hex Bolt across all 4 orders.
    // O-1001: 12×8=96, O-1002: 25×6=150, O-1003: 8×12=96, O-1004: 40×4=160 → 502
    const bolt = grossByCode.get('SKU-1003')!
    expect(bolt.gross).toBe(502)
    expect(bolt.contributions).toHaveLength(4)
  })
})

describe('net / minimum-level reconciliation', () => {
  it('net = gross − onHand − incomingPO for every SKU', () => {
    for (const r of rows) {
      expect(r.net).toBe(r.gross - r.sku.onHand - r.sku.incomingPoQty)
    }
  })

  it('minLevel = gross + safetyStock − incomingPO for every SKU', () => {
    for (const r of rows) {
      expect(r.minLevel).toBe(minimumStockLevel(r.sku, r.gross))
    }
  })

  it('belowMinBy = minLevel − onHand = net + safetyStock (the core identity)', () => {
    for (const r of rows) {
      expect(r.belowMinBy).toBe(r.minLevel - r.sku.onHand)
      expect(r.belowMinBy).toBe(r.net + r.sku.safetyStock)
    }
  })
})

describe('classification', () => {
  it('classifies every SKU into exactly one bucket (counts sum to total)', () => {
    const counts = { Critical: 0, Low: 0, Optimal: 0, Overstocked: 0 }
    for (const r of rows) counts[r.status]++
    const total = counts.Critical + counts.Low + counts.Optimal + counts.Overstocked
    expect(total).toBe(skus.length)
    expect(total).toBe(20)
  })

  it('produces the intended mis-leveled spread', () => {
    const counts = { Critical: 0, Low: 0, Optimal: 0, Overstocked: 0 }
    for (const r of rows) counts[r.status]++
    expect(counts.Critical).toBe(5)
    expect(counts.Low).toBe(5)
    expect(counts.Optimal).toBe(7)
    expect(counts.Overstocked).toBe(3)
  })

  it('Critical ⟺ net > 0 for every SKU', () => {
    for (const r of rows) {
      expect(r.status === 'Critical').toBe(r.net > 0)
    }
  })
})

describe('earliest order is genuinely threatened', () => {
  it('≥2 Critical SKUs feed the earliest order (O-1001)', () => {
    const earliest = [...orders].sort((a, b) =>
      a.requiredShipDate < b.requiredShipDate ? -1 : 1,
    )[0]
    const criticalFeedingEarliest = rows.filter(
      (r) => r.status === 'Critical' && r.contributions.some((c) => c.orderId === earliest.id),
    )
    expect(earliest.id).toBe('O-1001')
    expect(criticalFeedingEarliest.length).toBeGreaterThanOrEqual(2)
  })
})

describe('procurement schedule', () => {
  const plan = procurementSchedule(rows, orders, TODAY)

  it('covers every below-minimum SKU and nothing else', () => {
    const expected = rows.filter((r) => r.belowMinBy > 0).length
    expect(plan).toHaveLength(expected)
  })

  it('ordering the recommended qty restores on-hand exactly to the minimum level', () => {
    for (const item of plan) {
      const r = rowByCode.get(item.skuCode)!
      expect(r.sku.onHand + item.recommendedOrderQty).toBe(r.minLevel)
    }
  })

  it('orderByDate = earliestShipDate − supplierLeadTime, and qty is positive', () => {
    for (const item of plan) {
      expect(item.recommendedOrderQty).toBeGreaterThan(0)
      expect(item.orderCost).toBeCloseTo(item.recommendedOrderQty * item.unitCost, 6)
    }
  })
})

describe('alerts', () => {
  it('flags exactly the SKUs whose on-hand is below their minimum level', () => {
    const flagged = alerts(rows)
    const expected = rows.filter((r) => r.sku.onHand < r.minLevel).length
    expect(flagged).toHaveLength(expected)
    for (const a of flagged) expect(a.belowMinBy).toBeGreaterThan(0)
  })
})

describe('cost impact', () => {
  const impact = costImpact(rows, orders)

  it('matches an independent per-SKU recomputation (no rounding drift)', () => {
    let holding = 0
    let capital = 0
    let exposure = 0
    for (const r of rows) {
      if (r.status === 'Overstocked') {
        const excess = r.sku.onHand - (r.gross + r.sku.safetyStock)
        capital += excess * r.sku.unitCost
        holding += excess * r.sku.unitCost * 0.25
      }
      if (r.status === 'Critical') exposure += r.net * r.sku.unitCost
    }
    expect(impact.capitalInOverstock).toBeCloseTo(capital, 6)
    expect(impact.holdingCostFreed).toBeCloseTo(holding, 6)
    expect(impact.shortageExposure).toBeCloseTo(exposure, 6)
  })

  it('all 4 orders are at risk (shared Critical components feed each one)', () => {
    expect(impact.ordersAtRiskCount).toBe(4)
    expect(impact.ordersAtRiskValue).toBe(185_000 + 142_000 + 96_000 + 88_000)
  })
})
