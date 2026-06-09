import type { Status } from '../data/types'

// Single source of truth for status classification. All four buckets are
// mutually exclusive and total, so every SKU lands in exactly one.
//
//   net        = gross − onHand − incomingPO   (positive ⇒ true shortage)
//   belowMinBy = net + safetyStock             (positive ⇒ below minimum level)
//
//   Critical    — net > 0: on-hand + incoming PO cannot cover demand → line stops
//   Low         — net ≤ 0 but belowMinBy > 0: covers demand but eats the buffer
//   Overstocked — on-hand alone ≥ 2 × (gross + safetyStock): idle capital
//   Optimal     — everything else: covered, with buffer, not excessive

/** Multiplier of (demand + safety) above which on-hand counts as overstock. */
export const OVERSTOCK_FACTOR = 2

export function classify(args: {
  onHand: number
  gross: number
  safetyStock: number
  net: number
  belowMinBy: number
}): Status {
  const { onHand, gross, safetyStock, net, belowMinBy } = args

  if (net > 0) return 'Critical'
  if (onHand >= OVERSTOCK_FACTOR * (gross + safetyStock)) return 'Overstocked'
  if (belowMinBy > 0) return 'Low'
  return 'Optimal'
}
