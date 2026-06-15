import type { GanttRow } from '../data/types'
import { addDays, daysBetween, formatDate, minDate, parseISO } from '../lib'

const LABEL_W = 210

const TONE: Record<GanttRow['tone'], string> = {
  critical: 'from-critical to-critical/60 border-critical/60',
  normal: 'from-low to-low/60 border-low/60',
  monitor: 'from-accent to-accent/55 border-accent/60',
}

function maxDate(dates: string[]): string {
  return dates.reduce((mx, d) => (parseISO(d) > parseISO(mx) ? d : mx))
}

/**
 * A dependency-free horizontal Gantt. Each row is a bar spanning [order-by →
 * arrival] on a shared date axis. Gridlines, a "today" line, and an optional
 * build/need-by marker all share one coordinate system with the bars, so a
 * production-run's bars visibly converge on the build date.
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
  const axisStart = addDays(minDate(allDates), -5)
  const axisEnd = addDays(maxDate(allDates), 5)
  const span = Math.max(1, daysBetween(axisStart, axisEnd))

  const pct = (d: string) => Math.min(100, Math.max(0, (daysBetween(axisStart, d) / span) * 100))
  const ticks = Array.from({ length: 7 }, (_, i) => addDays(axisStart, Math.round((span * i) / 6)))
  const todayPct = pct(today)
  const markerPct = markerDate ? pct(markerDate) : null

  return (
    <div className="card overflow-hidden">
      <div className="scrollbar-thin overflow-x-auto">
        <div className="min-w-[820px] px-4 pt-2">
          {/* axis header */}
          <div className="flex">
            <div className="shrink-0" style={{ width: LABEL_W }} />
            <div className="relative h-7 flex-1">
              {ticks.map((t, i) => (
                <div
                  key={i}
                  className="absolute top-1.5 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-txt-3"
                  style={{ left: `${pct(t)}%` }}
                >
                  {formatDate(t).replace(/ \d{4}$/, '')}
                </div>
              ))}
            </div>
          </div>

          {/* body */}
          <div className="relative border-t border-line/50">
            {/* shared overlay: gridlines + today + build marker, aligned to the track */}
            <div className="pointer-events-none absolute inset-y-0" style={{ left: LABEL_W, right: 0 }}>
              {ticks.map((t, i) => (
                <div
                  key={i}
                  className="absolute inset-y-0 w-px bg-line/25"
                  style={{ left: `${pct(t)}%` }}
                />
              ))}
              {markerPct !== null && (
                <div
                  className="absolute inset-y-0 z-20 w-0.5 bg-mint/80 shadow-[0_0_12px_rgba(61,221,196,0.5)]"
                  style={{ left: `${markerPct}%` }}
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-mint px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-navy-900">
                    {markerLabel} · {formatDate(markerDate!).replace(/ \d{4}$/, '')}
                  </span>
                </div>
              )}
              <div
                className="absolute inset-y-0 z-20 border-l border-dashed border-accent/90"
                style={{ left: `${todayPct}%` }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wide text-accent">
                  today
                </span>
              </div>
            </div>

            {rows.map((r, i) => {
              const left = pct(r.start)
              const width = Math.max(1.2, pct(r.end) - left)
              const overdue = daysBetween(today, r.start) < 0
              const wide = width > 7
              return (
                <div
                  key={`${r.label}-${i}`}
                  className="flex items-center border-b border-line/25 last:border-0 hover:bg-white/[0.02]"
                >
                  <div className="shrink-0 py-2.5 pr-3" style={{ width: LABEL_W }}>
                    <div className="truncate text-xs font-semibold text-txt">{r.label}</div>
                    <div className="truncate text-[10px] text-txt-3">{r.sublabel}</div>
                  </div>
                  <div className="relative h-10 flex-1">
                    <div
                      className={`absolute top-1/2 flex h-[22px] -translate-y-1/2 items-center overflow-hidden rounded-md border bg-gradient-to-r shadow-sm ${TONE[r.tone]}`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${r.label}: order by ${formatDate(r.start)} → arrive ${formatDate(r.end)} (${r.leadTimeDays}d lead)`}
                    >
                      {wide && (
                        <span className="truncate px-1.5 text-[10px] font-bold text-navy-900">
                          {r.leadTimeDays}d
                        </span>
                      )}
                    </div>
                    {/* arrival cap — a diamond where the part lands */}
                    <div
                      className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[1px] border border-txt/40 bg-txt/80"
                      style={{ left: `${pct(r.end)}%` }}
                      title={`Arrives ${formatDate(r.end)}`}
                    />
                    {overdue && (
                      <span
                        className="absolute top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase text-critical"
                        style={{ left: `calc(${left}% - 27px)` }}
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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line/60 px-4 py-2.5 text-[11px] text-txt-3">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-3 rounded-sm bg-gradient-to-r from-critical to-critical/60" /> Order
          overdue / pre-stock
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-3 rounded-sm bg-gradient-to-r from-low to-low/60" /> Order soon
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-3 rounded-sm bg-gradient-to-r from-accent to-accent/55" /> Comfortable
          runway
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rotate-45 rounded-[1px] bg-txt/80" /> arrival
        </span>
        <span className="ml-auto">bar length = supplier lead time</span>
      </div>
    </div>
  )
}
