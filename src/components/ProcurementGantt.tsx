import { useMemo } from 'react'
import type { ProcurementItem } from '../data/types'
import { scheduleToGanttRows } from '../lib'
import { Gantt } from './Gantt'

/**
 * The live procurement schedule for all open orders, drawn as a Gantt: each short
 * component is a bar from its order-by date to the date it's first needed. Bars
 * already crossing the "today" line are overdue — that's where the agent points.
 */
export function ProcurementGantt({
  items,
  today,
}: {
  items: ProcurementItem[]
  today: string
}) {
  const rows = useMemo(() => scheduleToGanttRows(items, today), [items, today])

  return (
    <section>
      <Gantt rows={rows} today={today} emptyLabel="No open shortages to schedule." />
    </section>
  )
}
