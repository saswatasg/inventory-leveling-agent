import type { IconName } from './Icon'

export type ViewId = 'overview' | 'health' | 'reorder' | 'schedule' | 'leveling' | 'cost'

export interface NavItem {
  id: ViewId
  label: string
  icon: IconName
  title: string
  subtitle: string
}

export const NAV: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'overview',
    title: 'Overview',
    subtitle: 'At-a-glance health, risk, and what needs action today.',
  },
  {
    id: 'health',
    label: 'Inventory Health',
    icon: 'health',
    title: 'Inventory Health',
    subtitle: 'Every component classified — sortable, filterable, with BOM drill-down.',
  },
  {
    id: 'reorder',
    label: 'Reorder',
    icon: 'reorder',
    title: 'Reorder Recommendations',
    subtitle: 'What to buy to clear shortages — and the last day to place each PO.',
  },
  {
    id: 'schedule',
    label: 'Procurement',
    icon: 'schedule',
    title: 'Procurement Schedule',
    subtitle: 'Open-order shortages on a lead-time timeline.',
  },
  {
    id: 'leveling',
    label: 'Leveling',
    icon: 'leveling',
    title: 'Inventory Leveling',
    subtitle: 'Plan a production run — back-scheduled by lead time so capital is leveled.',
  },
  {
    id: 'cost',
    label: 'Cost Impact',
    icon: 'cost',
    title: 'Cost Impact',
    subtitle: 'Capital trapped in overstock and revenue exposed to stockouts.',
  },
]
