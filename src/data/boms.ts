import type { Bom } from './types'

// One ~10-line BOM per active order. Components are deliberately REUSED across
// BOMs — M8 Hex Bolt (SKU-1003) and Ball Bearing (SKU-1008) appear in all four,
// so their demand compounds and they tip into Critical. That compounding is the
// headline insight the agent surfaces.
export const boms: Bom[] = [
  {
    orderId: 'O-1001',
    product: 'Hydraulic Power Unit HPU-500',
    lines: [
      { skuCode: 'SKU-1001', qtyPerUnit: 1 }, // Steel Casting Housing
      { skuCode: 'SKU-1003', qtyPerUnit: 8 }, // M8 Hex Bolt   (shared ×4)
      { skuCode: 'SKU-1006', qtyPerUnit: 1 }, // Servo Motor 1.5kW
      { skuCode: 'SKU-1008', qtyPerUnit: 2 }, // Ball Bearing  (shared ×4)
      { skuCode: 'SKU-1010', qtyPerUnit: 2 }, // Oil Seal
      { skuCode: 'SKU-1012', qtyPerUnit: 1 }, // PLC Control Board
      { skuCode: 'SKU-1013', qtyPerUnit: 1 }, // Power Supply 24V
      { skuCode: 'SKU-1014', qtyPerUnit: 1 }, // Wiring Harness (shared ×3)
      { skuCode: 'SKU-1020', qtyPerUnit: 2 }, // Hydraulic Hose
      { skuCode: 'SKU-1018', qtyPerUnit: 1 }, // Gasket Set
    ],
  },
  {
    orderId: 'O-1002',
    product: 'Conveyor Drive Assembly CDA-200',
    lines: [
      { skuCode: 'SKU-1002', qtyPerUnit: 2 }, // Aluminum Bracket
      { skuCode: 'SKU-1003', qtyPerUnit: 6 }, // M8 Hex Bolt   (shared)
      { skuCode: 'SKU-1007', qtyPerUnit: 1 }, // Servo Motor 0.75kW
      { skuCode: 'SKU-1008', qtyPerUnit: 4 }, // Ball Bearing  (shared)
      { skuCode: 'SKU-1009', qtyPerUnit: 2 }, // Roller Bearing
      { skuCode: 'SKU-1014', qtyPerUnit: 1 }, // Wiring Harness (shared)
      { skuCode: 'SKU-1015', qtyPerUnit: 2 }, // Proximity Sensor
      { skuCode: 'SKU-1016', qtyPerUnit: 1 }, // Drive Shaft
      { skuCode: 'SKU-1017', qtyPerUnit: 2 }, // Coupling Flange
      { skuCode: 'SKU-1005', qtyPerUnit: 6 }, // Hex Nut M8
    ],
  },
  {
    orderId: 'O-1003',
    product: 'Industrial Gearbox GBX-750',
    lines: [
      { skuCode: 'SKU-1001', qtyPerUnit: 1 }, // Steel Casting Housing (shared)
      { skuCode: 'SKU-1003', qtyPerUnit: 12 }, // M8 Hex Bolt  (shared)
      { skuCode: 'SKU-1008', qtyPerUnit: 6 }, // Ball Bearing  (shared)
      { skuCode: 'SKU-1009', qtyPerUnit: 4 }, // Roller Bearing (shared)
      { skuCode: 'SKU-1010', qtyPerUnit: 4 }, // Oil Seal (shared)
      { skuCode: 'SKU-1016', qtyPerUnit: 2 }, // Drive Shaft (shared)
      { skuCode: 'SKU-1017', qtyPerUnit: 1 }, // Coupling Flange (shared)
      { skuCode: 'SKU-1011', qtyPerUnit: 3 }, // O-Ring
      { skuCode: 'SKU-1004', qtyPerUnit: 8 }, // M6 Socket Screw
      { skuCode: 'SKU-1018', qtyPerUnit: 2 }, // Gasket Set (shared)
    ],
  },
  {
    orderId: 'O-1004',
    product: 'Packaging Line Motor PLM-100',
    lines: [
      { skuCode: 'SKU-1007', qtyPerUnit: 1 }, // Servo Motor 0.75kW (shared)
      { skuCode: 'SKU-1012', qtyPerUnit: 1 }, // PLC Control Board (shared)
      { skuCode: 'SKU-1013', qtyPerUnit: 1 }, // Power Supply 24V (shared)
      { skuCode: 'SKU-1014', qtyPerUnit: 1 }, // Wiring Harness (shared)
      { skuCode: 'SKU-1015', qtyPerUnit: 1 }, // Proximity Sensor (shared)
      { skuCode: 'SKU-1019', qtyPerUnit: 1 }, // Cooling Fan
      { skuCode: 'SKU-1005', qtyPerUnit: 4 }, // Hex Nut M8 (shared)
      { skuCode: 'SKU-1004', qtyPerUnit: 6 }, // M6 Socket Screw (shared)
      { skuCode: 'SKU-1008', qtyPerUnit: 2 }, // Ball Bearing (shared)
      { skuCode: 'SKU-1003', qtyPerUnit: 4 }, // M8 Hex Bolt (shared)
    ],
  },
]
