import type { Priority, Status } from '../data/types'

interface Meta {
  label: string
  /** solid dot / accent color */
  dot: string
  /** text color */
  text: string
  /** translucent chip background */
  chipBg: string
  /** chip border */
  chipBorder: string
}

export const STATUS_META: Record<Status, Meta> = {
  Critical: {
    label: 'Critical',
    dot: 'bg-critical',
    text: 'text-critical',
    chipBg: 'bg-critical/10',
    chipBorder: 'border-critical/30',
  },
  Low: {
    label: 'Low',
    dot: 'bg-low',
    text: 'text-low',
    chipBg: 'bg-low/10',
    chipBorder: 'border-low/30',
  },
  Optimal: {
    label: 'Optimal',
    dot: 'bg-optimal',
    text: 'text-optimal',
    chipBg: 'bg-optimal/10',
    chipBorder: 'border-optimal/30',
  },
  Overstocked: {
    label: 'Overstocked',
    dot: 'bg-overstocked',
    text: 'text-overstocked',
    chipBg: 'bg-overstocked/10',
    chipBorder: 'border-overstocked/30',
  },
}

export const PRIORITY_META: Record<Priority, { text: string; chipBg: string; chipBorder: string }> =
  {
    Critical: { text: 'text-critical', chipBg: 'bg-critical/10', chipBorder: 'border-critical/30' },
    Normal: { text: 'text-low', chipBg: 'bg-low/10', chipBorder: 'border-low/30' },
    Monitor: { text: 'text-txt-2', chipBg: 'bg-white/5', chipBorder: 'border-line' },
  }
