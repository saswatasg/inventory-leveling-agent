// ── Core domain types (these mirror what a real D365 read would return) ──

export interface Sku {
  code: string
  name: string
  category: string
  unitCost: number // $ per unit
  supplierLeadTimeDays: number
  onHand: number
  incomingPoQty: number
  /** ISO date (yyyy-mm-dd) the incoming PO is expected, or null if no PO open */
  incomingPoArrivalDate: string | null
  safetyStock: number
}

export interface BomLine {
  skuCode: string
  qtyPerUnit: number
}

export interface Bom {
  /** matches Order.id — one finished-goods BOM per active order */
  orderId: string
  product: string
  lines: BomLine[]
}

export interface Order {
  id: string
  customer: string
  product: string
  quantity: number
  /** ISO date (yyyy-mm-dd) the order must ship */
  requiredShipDate: string
  /** order revenue, used for the at-risk exposure summary */
  value: number
}

// ── Derived / computed types (produced by src/lib) ──

export interface Contribution {
  orderId: string
  /** units of this SKU consumed by that order = order.quantity × qtyPerUnit */
  units: number
}

export interface GrossRequirement {
  skuCode: string
  gross: number
  contributions: Contribution[]
}

export type Status = 'Critical' | 'Low' | 'Optimal' | 'Overstocked'
export type Priority = 'Critical' | 'Normal' | 'Monitor'

export interface SkuAnalysis {
  sku: Sku
  gross: number
  contributions: Contribution[]
  /** gross − onHand − incomingPO (positive ⇒ true shortage) */
  net: number
  /** gross + safetyStock − incomingPO (on-hand needed to stay safe) */
  minLevel: number
  /** minLevel − onHand = net + safetyStock (positive ⇒ below minimum) */
  belowMinBy: number
  status: Status
}

export interface ProcurementItem {
  skuCode: string
  name: string
  category: string
  recommendedOrderQty: number
  supplierLeadTimeDays: number
  /** ISO date — earliest required ship date minus the supplier lead time */
  orderByDate: string
  /** ISO date of the earliest order this SKU feeds */
  earliestShipDate: string
  net: number
  priority: Priority
  unitCost: number
  /** recommendedOrderQty × unitCost */
  orderCost: number
}

export interface CostImpact {
  /** annual holding cost (25%/yr) tied up in excess overstock that could be freed */
  holdingCostFreed: number
  /** working capital sitting in excess overstock (excessUnits × unitCost) */
  capitalInOverstock: number
  /** component spend currently un-coverable across all Critical SKUs */
  shortageExposure: number
  /** revenue of orders that have ≥1 Critical component */
  ordersAtRiskValue: number
  ordersAtRiskCount: number
}
