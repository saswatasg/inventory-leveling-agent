import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ORDER_QTY,
  DEFAULT_PRODUCTION_DATE,
  HOLDING_RATE,
  TODAY,
  sampleBom,
} from '../../data'
import {
  BOM_CSV_TEMPLATE,
  addDays,
  daysBetween,
  levelProductionRun,
  parseBomCsv,
  toBomCsv,
} from '..'

const { rows, impact, gantt } = levelProductionRun(
  sampleBom,
  DEFAULT_ORDER_QTY,
  DEFAULT_PRODUCTION_DATE,
  TODAY,
)

describe('levelProductionRun — backward scheduling', () => {
  it('required = orderQty × qtyPerUnit and shortage = max(0, required − onHand)', () => {
    for (const r of rows) {
      expect(r.required).toBe(DEFAULT_ORDER_QTY * r.qtyPerUnit)
      expect(r.shortage).toBe(Math.max(0, r.required - r.onHand))
    }
  })

  it('orderByDate = productionDate − leadTime, arrival = productionDate', () => {
    for (const r of rows) {
      expect(r.orderByDate).toBe(addDays(DEFAULT_PRODUCTION_DATE, -r.leadTimeDays))
      expect(r.arrivalDate).toBe(DEFAULT_PRODUCTION_DATE)
    }
  })

  it('feasible ⟺ order-by date is today or later', () => {
    for (const r of rows) {
      expect(r.feasible).toBe(daysBetween(TODAY, r.orderByDate) >= 0)
    }
  })

  it('idle days and avoided holding cost reconcile exactly', () => {
    for (const r of rows) {
      const expectedIdle = Math.max(0, daysBetween(TODAY, r.orderByDate))
      expect(r.idleDaysIfOrderedToday).toBe(expectedIdle)
      expect(r.holdingCostAvoided).toBeCloseTo(
        (r.shortage * r.unitCost * HOLDING_RATE * expectedIdle) / 365,
        9,
      )
    }
  })
})

describe('levelProductionRun — impact', () => {
  it('total procurement = due-now + deferred (no leakage)', () => {
    expect(impact.totalProcurementCost).toBeCloseTo(impact.dueNowCost + impact.capitalDeferred, 6)
  })

  it('the 150-day casting cannot be procured in time → must pre-stock', () => {
    expect(impact.mustPreStockCount).toBe(1)
    const casting = rows.find((r) => r.name === 'Precision Casting Housing')!
    expect(casting.feasible).toBe(false)
  })

  it('critical path = the longest lead among short components (150d)', () => {
    expect(impact.criticalPathDays).toBe(150)
  })

  it('gantt contains exactly the short components, earliest order-by first', () => {
    const shortCount = rows.filter((r) => r.shortage > 0).length
    expect(gantt).toHaveLength(shortCount)
    for (let i = 1; i < gantt.length; i++) {
      expect(daysBetween(gantt[i - 1].start, gantt[i].start)).toBeGreaterThanOrEqual(0)
    }
  })

  it('fully-stocked components (Shaft Coupling) produce no order', () => {
    const coupling = rows.find((r) => r.name === 'Shaft Coupling')!
    expect(coupling.shortage).toBe(0)
    expect(gantt.some((g) => g.label === 'Shaft Coupling')).toBe(false)
  })
})

describe('CSV parsing', () => {
  it('round-trips the sample BOM without loss', () => {
    const parsed = parseBomCsv(toBomCsv(sampleBom))
    expect(parsed.errors).toHaveLength(0)
    expect(parsed.rows).toEqual(sampleBom)
  })

  it('parses the built-in template (5 rows, no errors)', () => {
    const parsed = parseBomCsv(BOM_CSV_TEMPLATE)
    expect(parsed.errors).toHaveLength(0)
    expect(parsed.rows).toHaveLength(5)
  })

  it('reports missing required columns instead of throwing', () => {
    const parsed = parseBomCsv('name,qty\nWidget,3')
    expect(parsed.rows).toHaveLength(0)
    expect(parsed.errors[0]).toMatch(/Missing column/)
  })

  it('skips invalid rows but keeps valid ones', () => {
    const csv = 'name,qtyPerUnit,leadTimeDays,onHand,unitCost\nGood,1,30,5,10\nBad,0,30,5,10'
    const parsed = parseBomCsv(csv)
    expect(parsed.rows).toHaveLength(1)
    expect(parsed.rows[0].name).toBe('Good')
    expect(parsed.errors.length).toBeGreaterThan(0)
  })
})
