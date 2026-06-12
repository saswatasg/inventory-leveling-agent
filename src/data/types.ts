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

// ── Lead-time leveling (v2): plan a single production run from its BOM ──

/** One line of an uploaded / sample BOM. Lead time + quantity are the focus. */
export interface BomRow {
  name: string
  /** units of this component per one finished unit */
  qtyPerUnit: number
  /** supplier lead time in days — drives the backward schedule */
  leadTimeDays: number
  /** current stock on hand (would come from D365 in production) */
  onHand: number
  unitCost: number
}

/** Per-component result of leveling one production run. */
export interface LevelingRow {
  name: string
  qtyPerUnit: number
  leadTimeDays: number
  onHand: number
  unitCost: number
  /** orderQty × qtyPerUnit */
  required: number
  /** max(0, required − onHand) */
  shortage: number
  /** ISO — productionDate − leadTime (when the PO must be placed) */
  orderByDate: string
  /** ISO — when the component is needed (= productionDate) */
  arrivalDate: string
  /** orderByDate ≥ today: can still be procured reactively in time */
  feasible: boolean
  /** days this part would sit idle if ordered today instead of at orderByDate */
  idleDaysIfOrderedToday: number
  /** capital you avoid tying up by waiting: shortage × unitCost × holdingRate × idleDays/365 */
  holdingCostAvoided: number
}

export interface LevelingImpact {
  /** total cash to cover all shortages across the run */
  totalProcurementCost: number
  /** spend that must be committed now (order-by date already reached or passed) */
  dueNowCost: number
  /** spend the schedule defers — ordered later, not tied up today (totalProcurement − dueNow) */
  capitalDeferred: number
  /** annual-equivalent holding cost avoided by staggering vs ordering everything today */
  holdingCostAvoided: number
  /** components that cannot be procured in time → must be forecast / pre-stocked */
  mustPreStockCount: number
  /** the binding lead time (days) — the longest-lead short component */
  criticalPathDays: number
}

/** A single bar on the reusable Gantt. */
export interface GanttRow {
  label: string
  sublabel: string
  /** ISO — bar start (order-by date) */
  start: string
  /** ISO — bar end (arrival / need-by date) */
  end: string
  leadTimeDays: number
  /** drives bar color */
  tone: 'critical' | 'normal' | 'monitor'
}
