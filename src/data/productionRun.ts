import { addDays } from '../lib/dates'
import { TODAY } from './constants'
import type { BomRow } from './types'

// Sample finished-good production run used by the Inventory Leveling planner.
// The point of the demo: components span a wide lead-time range (7 → 150 days),
// so the backward-scheduled order dates stagger dramatically. The 150-day
// casting can't be ordered in time → it must be forecast / pre-stocked.

export const SAMPLE_PRODUCT = 'Industrial Pump Assembly PA-900'

/** Default finished-units to build. */
export const DEFAULT_ORDER_QTY = 10

/** Default production / required-by date — ~4 months out, matching the client's window. */
export const DEFAULT_PRODUCTION_DATE = addDays(TODAY, 120) // 2026-10-07

export const sampleBom: BomRow[] = [
  { name: 'Precision Casting Housing', qtyPerUnit: 1, leadTimeDays: 150, onHand: 3, unitCost: 2400 },
  { name: 'Servo Motor 2kW', qtyPerUnit: 1, leadTimeDays: 120, onHand: 2, unitCost: 1800 },
  { name: 'VFD Controller', qtyPerUnit: 1, leadTimeDays: 90, onHand: 0, unitCost: 1200 },
  { name: 'Mechanical Seal Kit', qtyPerUnit: 2, leadTimeDays: 75, onHand: 8, unitCost: 480 },
  { name: 'Bearing Set', qtyPerUnit: 4, leadTimeDays: 60, onHand: 30, unitCost: 140 },
  { name: 'Impeller (machined)', qtyPerUnit: 1, leadTimeDays: 45, onHand: 4, unitCost: 850 },
  { name: 'Shaft Coupling', qtyPerUnit: 2, leadTimeDays: 30, onHand: 25, unitCost: 95 },
  { name: 'Gasket Set', qtyPerUnit: 1, leadTimeDays: 21, onHand: 5, unitCost: 60 },
  { name: 'Fastener Pack M10', qtyPerUnit: 12, leadTimeDays: 14, onHand: 60, unitCost: 3 },
  { name: 'Wiring Loom', qtyPerUnit: 1, leadTimeDays: 7, onHand: 3, unitCost: 220 },
]
