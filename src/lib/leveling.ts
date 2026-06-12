import { HOLDING_RATE } from '../data'
import type {
  BomRow,
  GanttRow,
  LevelingImpact,
  LevelingRow,
  ProcurementItem,
} from '../data/types'
import { addDays, daysBetween, parseISO } from './dates'

/** Below this much runway (days) a feasible order is "normal" urgency, else "monitor". */
const TIGHT_RUNWAY_DAYS = 21

export interface LevelingResult {
  rows: LevelingRow[]
  impact: LevelingImpact
  gantt: GanttRow[]
}

/**
 * Backward-schedule one production run from its BOM. For each component we work
 * back from the production/required date by the component's lead time:
 *
 *   required   = orderQty × qtyPerUnit
 *   shortage   = max(0, required − onHand)
 *   orderBy    = productionDate − leadTime      ← place the PO no later than this
 *   arrival    = productionDate                 ← all parts land just-in-time
 *
 * Long-lead parts get the earliest order-by date, short-lead parts the latest —
 * so nothing arrives early and capital isn't tied up before it's needed. Parts
 * whose order-by date is already in the past can't be procured reactively and
 * must be forecast / pre-stocked.
 */
export function levelProductionRun(
  bom: BomRow[],
  orderQty: number,
  productionDate: string,
  today: string,
): LevelingResult {
  const rows: LevelingRow[] = bom.map((c) => {
    const required = orderQty * c.qtyPerUnit
    const shortage = Math.max(0, required - c.onHand)
    const orderByDate = addDays(productionDate, -c.leadTimeDays)
    const feasible = parseISO(orderByDate) >= parseISO(today)
    // If we ordered everything today, this part would sit on the shelf for the
    // gap between today and when it actually needs ordering — wasted capital.
    const idleDaysIfOrderedToday = Math.max(0, daysBetween(today, orderByDate))
    const holdingCostAvoided =
      (shortage * c.unitCost * HOLDING_RATE * idleDaysIfOrderedToday) / 365

    return {
      name: c.name,
      qtyPerUnit: c.qtyPerUnit,
      leadTimeDays: c.leadTimeDays,
      onHand: c.onHand,
      unitCost: c.unitCost,
      required,
      shortage,
      orderByDate,
      arrivalDate: productionDate,
      feasible,
      idleDaysIfOrderedToday,
      holdingCostAvoided,
    }
  })

  const short = rows.filter((r) => r.shortage > 0)
  const cost = (r: LevelingRow) => r.shortage * r.unitCost
  const dueNow = (r: LevelingRow) => parseISO(r.orderByDate) <= parseISO(today)

  const totalProcurementCost = short.reduce((s, r) => s + cost(r), 0)
  const dueNowCost = short.filter(dueNow).reduce((s, r) => s + cost(r), 0)

  const impact: LevelingImpact = {
    totalProcurementCost,
    dueNowCost,
    capitalDeferred: totalProcurementCost - dueNowCost,
    holdingCostAvoided: short.reduce((s, r) => s + r.holdingCostAvoided, 0),
    mustPreStockCount: short.filter((r) => !r.feasible).length,
    criticalPathDays: short.reduce((m, r) => Math.max(m, r.leadTimeDays), 0),
  }

  // Longest-lead (earliest order-by) first — that's the binding constraint.
  const gantt: GanttRow[] = short
    .map((r): GanttRow => {
      const runway = daysBetween(today, r.orderByDate)
      const tone: GanttRow['tone'] = !r.feasible
        ? 'critical'
        : runway <= TIGHT_RUNWAY_DAYS
          ? 'normal'
          : 'monitor'
      return {
        label: r.name,
        sublabel: `${r.shortage.toLocaleString()} u · ${r.leadTimeDays}d lead`,
        start: r.orderByDate,
        end: r.arrivalDate,
        leadTimeDays: r.leadTimeDays,
        tone,
      }
    })
    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())

  return { rows, impact, gantt }
}

/**
 * Adapt the existing multi-order procurement schedule into Gantt bars: each short
 * component becomes a bar from its order-by date to the earliest date it's needed.
 * Tone reflects *timing* (overdue / soon / comfortable) so it matches the Gantt's
 * own legend and the "late" markers — the reorder table conveys shortage priority.
 */
export function scheduleToGanttRows(items: ProcurementItem[], today: string): GanttRow[] {
  return items
    .map((it): GanttRow => {
      const runway = daysBetween(today, it.orderByDate)
      const tone: GanttRow['tone'] =
        runway < 0 ? 'critical' : runway <= TIGHT_RUNWAY_DAYS ? 'normal' : 'monitor'
      return {
        label: it.name,
        sublabel: `${it.recommendedOrderQty.toLocaleString()} u · ${it.supplierLeadTimeDays}d lead`,
        start: it.orderByDate,
        end: it.earliestShipDate,
        leadTimeDays: it.supplierLeadTimeDays,
        tone,
      }
    })
    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
}
