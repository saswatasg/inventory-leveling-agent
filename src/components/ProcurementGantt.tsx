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
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-tight">Procurement Schedule</h2>
        <p className="text-sm text-txt-3">
          Every open-order shortage placed on a timeline by the day its PO must go in — long-lead
          parts on the left, short-lead on the right.
        </p>
      </div>
      <Gantt rows={rows} today={today} emptyLabel="No open shortages to schedule." />
    </section>
  )
}
