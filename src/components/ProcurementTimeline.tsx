import { useMemo } from 'react'
import type { ProcurementItem } from '../data/types'
import { addDays, daysBetween, fmtMoney, formatDate } from '../lib'
import { PRIORITY_META } from './statusMeta'

const WEEKS = 6

/**
 * Weekly procurement timeline. Each PO is placed in the week its order-by date
 * falls in (relative to the planning date). Anything already due lands in W1 and
 * is flagged — that's where the agent is shouting.
 */
export function ProcurementTimeline({
  items,
  today,
}: {
  items: ProcurementItem[]
  today: string
}) {
  const buckets = useMemo(() => {
    const cols = Array.from({ length: WEEKS }, (_, i) => ({
      index: i,
      start: addDays(today, i * 7),
      end: addDays(today, i * 7 + 6),
      items: [] as ProcurementItem[],
    }))
    for (const it of items) {
      const d = daysBetween(today, it.orderByDate)
      const wk = Math.min(WEEKS - 1, Math.max(0, Math.floor(d / 7)))
      cols[wk].items.push(it)
    }
    for (const c of cols)
      c.items.sort((a, b) => (a.orderByDate < b.orderByDate ? -1 : 1))
    return cols
  }, [items, today])

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-tight">Procurement Schedule</h2>
        <p className="text-sm text-txt-3">
          The next six weeks of purchasing, laid out by the day each PO must go in.
        </p>
      </div>

      <div className="scrollbar-thin overflow-x-auto pb-2">
        <div className="grid min-w-[900px] grid-cols-6 gap-3">
          {buckets.map((c) => {
            const spend = c.items.reduce((s, it) => s + it.orderCost, 0)
            return (
              <div key={c.index} className="card flex flex-col p-3">
                <div className="mb-2 border-b border-line/50 pb-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-accent">
                    Week {c.index + 1}
                  </div>
                  <div className="text-[11px] text-txt-3">
                    {formatDate(c.start).replace(/ \d{4}$/, '')} – {formatDate(c.end).replace(/ \d{4}$/, '')}
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  {c.items.length === 0 && (
                    <div className="py-6 text-center text-[11px] text-txt-3/60">—</div>
                  )}
                  {c.items.map((it) => {
                    const m = PRIORITY_META[it.priority]
                    const overdue = daysBetween(today, it.orderByDate) < 0
                    return (
                      <div
                        key={it.skuCode}
                        className={`rounded-lg border px-2.5 py-2 ${m.chipBorder} ${m.chipBg}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-xs font-semibold text-txt">{it.name}</span>
                          {overdue && (
                            <span className="shrink-0 text-[10px] font-bold uppercase text-critical">
                              now
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center justify-between text-[11px] text-txt-3">
                          <span className="tnum">{it.recommendedOrderQty.toLocaleString()} u</span>
                          <span className="tnum">{fmtMoney(it.orderCost)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {spend > 0 && (
                  <div className="mt-2 border-t border-line/50 pt-2 text-right text-[11px] text-txt-2">
                    <span className="text-txt-3">spend </span>
                    <span className="font-semibold tnum">{fmtMoney(spend)}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
