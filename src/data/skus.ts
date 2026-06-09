import type { Sku } from './types'

// 20 SKUs, deliberately mis-leveled so the agent has something real to say:
//   • 5 Critical   — onHand + incoming PO can't cover compounded demand
//   • 5 Low        — covers demand but erodes the safety buffer
//   • 7 Optimal    — healthy
//   • 3 Overstocked— idle capital sitting on the shelf
// Arrival dates are relative to TODAY (2026-06-09); several land AFTER the
// earliest order ships (2026-06-15), which is the whole point.

export const skus: Sku[] = [
  // ── Castings / structural ──
  {
    code: 'SKU-1001',
    name: 'Steel Casting Housing',
    category: 'Castings',
    unitCost: 45,
    supplierLeadTimeDays: 30,
    onHand: 30,
    incomingPoQty: 0,
    incomingPoArrivalDate: null,
    safetyStock: 8,
  },
  {
    code: 'SKU-1002',
    name: 'Aluminum Bracket',
    category: 'Castings',
    unitCost: 6.5,
    supplierLeadTimeDays: 18,
    onHand: 900, // OVERSTOCKED
    incomingPoQty: 0,
    incomingPoArrivalDate: null,
    safetyStock: 20,
  },

  // ── Fasteners (cheap, shared across every BOM → compound shortages) ──
  {
    code: 'SKU-1003',
    name: 'M8 Hex Bolt',
    category: 'Fasteners',
    unitCost: 0.45,
    supplierLeadTimeDays: 21,
    onHand: 300, // CRITICAL — used in all 4 orders
    incomingPoQty: 80,
    incomingPoArrivalDate: '2026-06-27',
    safetyStock: 80,
  },
  {
    code: 'SKU-1004',
    name: 'M6 Socket Screw',
    category: 'Fasteners',
    unitCost: 0.3,
    supplierLeadTimeDays: 14,
    onHand: 200, // CRITICAL
    incomingPoQty: 50,
    incomingPoArrivalDate: '2026-06-21',
    safetyStock: 50,
  },
  {
    code: 'SKU-1005',
    name: 'Hex Nut M8',
    category: 'Fasteners',
    unitCost: 0.12,
    supplierLeadTimeDays: 14,
    onHand: 180, // CRITICAL
    incomingPoQty: 40,
    incomingPoArrivalDate: '2026-06-19',
    safetyStock: 50,
  },

  // ── Motors ──
  {
    code: 'SKU-1006',
    name: 'Servo Motor 1.5kW',
    category: 'Motors',
    unitCost: 320,
    supplierLeadTimeDays: 42,
    onHand: 20,
    incomingPoQty: 0,
    incomingPoArrivalDate: null,
    safetyStock: 5,
  },
  {
    code: 'SKU-1007',
    name: 'Servo Motor 0.75kW',
    category: 'Motors',
    unitCost: 210,
    supplierLeadTimeDays: 42,
    onHand: 60, // LOW
    incomingPoQty: 10,
    incomingPoArrivalDate: '2026-06-29',
    safetyStock: 12,
  },

  // ── Bearings (shared) ──
  {
    code: 'SKU-1008',
    name: 'Ball Bearing 6204',
    category: 'Bearings',
    unitCost: 3.2,
    supplierLeadTimeDays: 28,
    onHand: 120, // CRITICAL — used in all 4 orders, PO lands after earliest ship
    incomingPoQty: 60,
    incomingPoArrivalDate: '2026-07-09',
    safetyStock: 40,
  },
  {
    code: 'SKU-1009',
    name: 'Roller Bearing 30205',
    category: 'Bearings',
    unitCost: 5.5,
    supplierLeadTimeDays: 28,
    onHand: 70, // LOW
    incomingPoQty: 18,
    incomingPoArrivalDate: '2026-06-24',
    safetyStock: 15,
  },

  // ── Seals ──
  {
    code: 'SKU-1010',
    name: 'Oil Seal 35x52',
    category: 'Seals',
    unitCost: 2.1,
    supplierLeadTimeDays: 21,
    onHand: 80,
    incomingPoQty: 0,
    incomingPoArrivalDate: null,
    safetyStock: 12,
  },
  {
    code: 'SKU-1011',
    name: 'O-Ring 50mm',
    category: 'Seals',
    unitCost: 0.85,
    supplierLeadTimeDays: 10,
    onHand: 800, // OVERSTOCKED
    incomingPoQty: 0,
    incomingPoArrivalDate: null,
    safetyStock: 20,
  },

  // ── Electronics ──
  {
    code: 'SKU-1012',
    name: 'PLC Control Board',
    category: 'Electronics',
    unitCost: 85,
    supplierLeadTimeDays: 35,
    onHand: 45, // LOW
    incomingPoQty: 12,
    incomingPoArrivalDate: '2026-06-23',
    safetyStock: 10,
  },
  {
    code: 'SKU-1013',
    name: 'Power Supply 24V',
    category: 'Electronics',
    unitCost: 38,
    supplierLeadTimeDays: 28,
    onHand: 75,
    incomingPoQty: 0,
    incomingPoArrivalDate: null,
    safetyStock: 10,
  },
  {
    code: 'SKU-1014',
    name: 'Wiring Harness',
    category: 'Electronics',
    unitCost: 22,
    supplierLeadTimeDays: 21,
    onHand: 65, // LOW
    incomingPoQty: 18,
    incomingPoArrivalDate: '2026-06-25',
    safetyStock: 15,
  },
  {
    code: 'SKU-1015',
    name: 'Proximity Sensor',
    category: 'Electronics',
    unitCost: 18.5,
    supplierLeadTimeDays: 35,
    onHand: 40, // CRITICAL
    incomingPoQty: 20,
    incomingPoArrivalDate: '2026-07-04',
    safetyStock: 15,
  },

  // ── Machined ──
  {
    code: 'SKU-1016',
    name: 'Drive Shaft',
    category: 'Machined',
    unitCost: 28,
    supplierLeadTimeDays: 30,
    onHand: 60,
    incomingPoQty: 0,
    incomingPoArrivalDate: null,
    safetyStock: 10,
  },
  {
    code: 'SKU-1017',
    name: 'Coupling Flange',
    category: 'Machined',
    unitCost: 16,
    supplierLeadTimeDays: 25,
    onHand: 52, // LOW
    incomingPoQty: 12,
    incomingPoArrivalDate: '2026-06-30',
    safetyStock: 12,
  },

  // ── Misc ──
  {
    code: 'SKU-1018',
    name: 'Gasket Set',
    category: 'Seals',
    unitCost: 4.5,
    supplierLeadTimeDays: 14,
    onHand: 45,
    incomingPoQty: 0,
    incomingPoArrivalDate: null,
    safetyStock: 8,
  },
  {
    code: 'SKU-1019',
    name: 'Cooling Fan',
    category: 'Electronics',
    unitCost: 12,
    supplierLeadTimeDays: 16,
    onHand: 500, // OVERSTOCKED
    incomingPoQty: 0,
    incomingPoArrivalDate: null,
    safetyStock: 15,
  },
  {
    code: 'SKU-1020',
    name: 'Hydraulic Hose 1m',
    category: 'Hydraulics',
    unitCost: 9,
    supplierLeadTimeDays: 18,
    onHand: 50,
    incomingPoQty: 0,
    incomingPoArrivalDate: null,
    safetyStock: 12,
  },
]
