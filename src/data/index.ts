// The single planning "now". Everything date-related derives from this, so the
// demo and the tests stay stable no matter when they run.
export const TODAY = '2026-06-09'

// Annual inventory holding-cost rate (storage, capital, obsolescence, insurance).
export const HOLDING_RATE = 0.25

export { skus } from './skus'
export { orders } from './orders'
export { boms } from './boms'
export type * from './types'
