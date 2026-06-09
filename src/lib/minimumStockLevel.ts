import type { Sku } from '../data/types'

/**
 * Minimum on-hand quantity this SKU must hold to fulfil all open orders without
 * halting production — the client's core question.
 *
 *   minLevel = gross demand + safety stock − incoming PO already in transit
 *
 * Reading: you need enough on the shelf to cover everything the open orders will
 * consume, plus the safety buffer, less whatever a confirmed PO will deliver.
 * Kept un-clamped so the identity  belowMinBy = minLevel − onHand = net + safety
 * holds exactly and the tests can pin it down.
 */
export function minimumStockLevel(sku: Sku, gross: number): number {
  return gross + sku.safetyStock - sku.incomingPoQty
}
