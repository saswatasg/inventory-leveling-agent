import type { Order, Priority, ProcurementItem, SkuAnalysis } from '../data/types'
import { addDays, minDate, parseISO } from './dates'

/**
 * Turn every below-minimum SKU into a concrete purchasing action:
 *
 *   recommendedOrderQty = minLevel − onHand   (restores cover incl. safety)
 *   orderByDate         = earliest required ship date − supplier lead time
 *   priority            = Critical  net > 0 and order-by date already reached
 *                         Normal    net > 0 but still lead-time runway left
 *                         Monitor   only the safety buffer is eroding (net ≤ 0)
 *
 * Sorted by order-by date so the most time-critical purchase is first.
 */
export function procurementSchedule(
  rows: SkuAnalysis[],
  orders: Order[],
  today: string,
): ProcurementItem[] {
  const shipByOrderId = new Map(orders.map((o) => [o.id, o.requiredShipDate]))

  const items = rows
    .filter((r) => r.belowMinBy > 0)
    .map((r): ProcurementItem => {
      const earliestShipDate = minDate(
        r.contributions.map((c) => shipByOrderId.get(c.orderId)!).filter(Boolean),
      )
      const orderByDate = addDays(earliestShipDate, -r.sku.supplierLeadTimeDays)

      let priority: Priority
      if (r.net > 0) {
        priority = parseISO(orderByDate) <= parseISO(today) ? 'Critical' : 'Normal'
      } else {
        priority = 'Monitor'
      }

      return {
        skuCode: r.sku.code,
        name: r.sku.name,
        category: r.sku.category,
        recommendedOrderQty: r.belowMinBy,
        supplierLeadTimeDays: r.sku.supplierLeadTimeDays,
        orderByDate,
        earliestShipDate,
        net: r.net,
        priority,
        unitCost: r.sku.unitCost,
        orderCost: r.belowMinBy * r.sku.unitCost,
      }
    })

  return items.sort((a, b) => parseISO(a.orderByDate).getTime() - parseISO(b.orderByDate).getTime())
}
