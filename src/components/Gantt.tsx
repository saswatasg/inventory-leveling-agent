import type { GanttRow } from '../data/types'
import { addDays, daysBetween, formatDate, minDate, parseISO } from '../lib'

const TONE: Record<GanttRow['tone'], { bar: string; text: string }> = {
  critical: { bar: 'bg-critical/80 border-critical', text: 'text-critical' },
  normal: { bar: 'bg-low/80 border-low', text: 'text-low' },
  monitor: { bar: 'bg-accent/70 border-accent', text: 'text-accent' },
}

function maxDate(dates: string[]): string {
  return dates.reduce((mx, d) => (parseISO(d) > parseISO(mx) ? d : mx))
}

/**
 * A dependency-free horizontal Gantt. Each row is a bar spanning [start → end]
 * (order-by → arrival) on a shared date axis, with a "today" line and an optional
 * production/need-by marker. Bars are positioned purely by date math.
 */
export function Gantt({
  rows,
  today,
  markerDate,
  markerLabel = 'Production',
  emptyLabel = 'Nothing to schedule.',
}: {
  rows: GanttRow[]
  today: string
  markerDate?: string
  markerLabel?: string
  emptyLabel?: string
}) {
  if (rows.length === 0) {
    return <div className="card px-4 py-10 text-center text-sm text-txt-3">{emptyLabel}</div>
  }

  const allDates = [today, ...rows.map((r) => r.start), ...rows.map((r) => r.end)]
  if (markerDate) allDates.push(markerDate)
  // pad the axis a touch on each side
  const axisStart = addDays(minDate(allDates), -4)
  const axisEnd = addDays(maxDate(allDates), 4)
  const span = Math.max(1, daysBetween(axisStart, axisEnd))

  const pct = (d: string) => Math.min(100, Math.max(0, (daysBetween(axisStart, d) / span) * 100))

  const ticks = Array.from({ length: 7 }, (_, i) => addDays(axisStart, Math.round((span * i) / 6)))
  const todayPct = pct(today)
  const markerPct = markerDate ? pct(markerDate) : null

  return (
    <div className="card overflow-hidden">
      <div className="scrollbar-thin overflow-x-auto">
        <div className="min-w-[760px]">
          {/* axis */}
          <div className="relative ml-[200px] h-6 border-b border-line/60">
            {ticks.map((t, i) => (
              <div
                key={i}
                className="absolute top-0 -translate-x-1/2 text-[10px] text-txt-3"
                style={{ left: `${pct(t)}%` }}
              >
                {formatDate(t).replace(/ \d{4}$/, '')}
              </div>
            ))}
          </div>

          {/* rows */}
          <div className="relative">
            {/* today line */}
            <div
              className="pointer-events-none absolute bottom-0 top-0 z-10 ml-[200px] border-l border-dashed border-accent/80"
              style={{ left: `calc(${todayPct}% )` }}
            >
              <span className="absolute -top-0 left-1 text-[9px] font-semibold uppercase tracking-wide text-accent">
                today
              </span>
            </div>
            {/* production / need-by marker */}
            {markerPct !== null && (
              <div
                className="pointer-events-none absolute bottom-0 top-0 z-10 ml-[200px] border-l-2 border-txt-2/70"
                style={{ left: `calc(${markerPct}% )` }}
              >
                <span className="absolute -top-0 left-1 whitespace-nowrap text-[9px] font-semibold uppercase tracking-wide text-txt-2">
                  {markerLabel}
                </span>
              </div>
            )}

            {rows.map((r, i) => {
              const tone = TONE[r.tone]
              const left = pct(r.start)
              const width = Math.max(1.5, pct(r.end) - left)
              const overdue = daysBetween(today, r.start) < 0
              return (
                <div
                  key={`${r.label}-${i}`}
                  className="flex items-center border-b border-line/30 last:border-0 hover:bg-white/[0.02]"
                >
                  <div className="w-[200px] shrink-0 py-2.5 pr-3">
                    <div className="truncate text-xs font-medium text-txt">{r.label}</div>
                    <div className="truncate text-[10px] text-txt-3">{r.sublabel}</div>
                  </div>
                  <div className="relative h-9 flex-1">
                    <div
                      className={`absolute top-1/2 flex h-5 -translate-y-1/2 items-center rounded-md border px-1.5 ${tone.bar}`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${r.label}: order by ${formatDate(r.start)} → arrive ${formatDate(r.end)} (${r.leadTimeDays}d lead)`}
                    >
                      <span className="truncate text-[10px] font-semibold text-navy-900">
                        {r.leadTimeDays}d
                      </span>
                    </div>
                    {overdue && (
                      <span
                        className="absolute top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase text-critical"
                        style={{ left: `calc(${left}% - 26px)` }}
                      >
                        late
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-line/60 px-4 py-2.5 text-[11px] text-txt-3">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-3 rounded-sm bg-critical/80" /> Order overdue / pre-stock
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-3 rounded-sm bg-low/80" /> Order soon
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-3 rounded-sm bg-accent/70" /> Comfortable runway
        </span>
        <span className="ml-auto">bar length = supplier lead time</span>
      </div>
    </div>
  )
}
