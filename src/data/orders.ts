import type { Order } from './types'

// 4 active sales orders, ship dates spread across the next ~6 weeks from
// TODAY (2026-06-09). O-1001 is the pressure point — it ships first.
export const orders: Order[] = [
  {
    id: 'O-1001',
    customer: 'Meridian Hydraulics',
    product: 'Hydraulic Power Unit HPU-500',
    quantity: 12,
    requiredShipDate: '2026-06-15', // +6d — earliest
    value: 185_000,
  },
  {
    id: 'O-1002',
    customer: 'Northgate Conveyors',
    product: 'Conveyor Drive Assembly CDA-200',
    quantity: 25,
    requiredShipDate: '2026-06-21', // +12d
    value: 142_000,
  },
  {
    id: 'O-1003',
    customer: 'Apex Heavy Industries',
    product: 'Industrial Gearbox GBX-750',
    quantity: 8,
    requiredShipDate: '2026-07-03', // +24d
    value: 96_000,
  },
  {
    id: 'O-1004',
    customer: 'Cascade Packaging Co.',
    product: 'Packaging Line Motor PLM-100',
    quantity: 40,
    requiredShipDate: '2026-07-19', // +40d
    value: 88_000,
  },
]
