import { useMemo } from 'react'
import {
  DEFAULT_ORDER_QTY,
  DEFAULT_PRODUCTION_DATE,
  TODAY,
  sampleBom,
} from '../data'
import type { CostImpact, ProcurementItem, SkuAnalysis, Status } from '../data/types'
import { daysBetween, fmtMoneyCompact, fmtNum, formatDate, levelProductionRun } from '../lib'
import { PRIORITY_META } from './statusMeta'
import { StatusTile } from './StatusTile'
import type { ViewId } from './nav'

const TILES: { status: Status; sublabel: string }[] = [
  { status: 'Critical', sublabel: 'Shortfall halts a build' },
  { status: 'Low', sublabel: 'Eating into safety stock' },
  { status: 'Optimal', sublabel: 'Covered, with buffer' },
  { status: 'Overstocked', sublabel: 'Idle capital on the shelf' },
]

export function Overview({
  rows,
  schedule,
  impact,
  onNavigate,
}: {
  rows: SkuAnalysis[]
  schedule: ProcurementItem[]
  impact: CostImpact
  onNavigate: (id: ViewId) => void
}) {
  const counts = useMemo(() => {
    const c: Record<Status, number> = { Critical: 0, Low: 0, Optimal: 0, Overstocked: 0 }
    for (const r of rows) c[r.status]++
    return c
  }, [rows])

  const belowMin = rows.filter((r) => r.sku.onHand < r.minLevel).length
  const overdue = schedule.filter((s) => daysBetween(TODAY, s.orderByDate) < 0).length
  const topPriorities = schedule.slice(0, 6)

  const leveling = useMemo(
    () => levelProductionRun(sampleBom, DEFAULT_ORDER_QTY, DEFAULT_PRODUCTION_DATE, TODAY),
    [],
  )

  return (
    <div className="space-y-6">
      {counts.Critical > 0 && (
        <div className="card flex flex-wrap items-center gap-x-3 gap-y-1 border-critical/30 bg-critical/[0.07] px-5 py-3.5 text-sm">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-critical/70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-critical" />
          </span>
          <span className="font-semibold text-txt">
            {counts.Critical} components are below the line that keeps production running.
          </span>
          <span className="text-txt-2">
            {overdue} are already past their order-by date.
          </span>
          <button
            onClick={() => onNavigate('reorder')}
            className="ml-auto rounded-lg border border-critical/40 bg-critical/10 px-2.5 py-1 text-xs font-semibold text-critical hover:bg-critical/20"
          >
            View reorders →
          </button>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="Critical components"
          value={`${counts.Critical}`}
          tone="text-critical"
          note="Production-stopping shortfalls"
          onClick={() => onNavigate('health')}
        />
        <Kpi
          label="Below minimum"
          value={`${belowMin}`}
          tone="text-low"
          note="Need a PO to stay safe"
          onClick={() => onNavigate('reorder')}
        />
        <Kpi
          label="Revenue at risk"
          value={fmtMoneyCompact(impact.ordersAtRiskValue)}
          tone="text-critical"
          note={`${impact.ordersAtRiskCount} orders exposed`}
          onClick={() => onNavigate('cost')}
        />
        <Kpi
          label="Capital in overstock"
          value={fmtMoneyCompact(impact.capitalInOverstock)}
          tone="text-overstocked"
          note="Cash idle on the shelf"
          onClick={() => onNavigate('cost')}
        />
      </div>

      {/* status tiles */}
      <div>
        <div className="mb-2 flex items-end justify-between">
          <h2 className="text-sm font-bold tracking-tight text-txt-2">Inventory health</h2>
          <button
            onClick={() => onNavigate('health')}
            className="text-xs font-medium text-accent hover:underline"
          >
            Open full table →
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TILES.map((t) => (
            <StatusTile
              key={t.status}
              status={t.status}
              count={counts[t.status]}
              sublabel={t.sublabel}
              active={false}
              onClick={() => onNavigate('health')}
            />
          ))}
        </div>
      </div>

      {/* two-column: priorities + leveling teaser */}
      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight">Top priorities</h2>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs font-medium text-accent hover:underline"
            >
              Procurement timeline →
            </button>
          </div>
          <div className="divide-y divide-line/40">
            {topPriorities.map((it) => {
              const m = PRIORITY_META[it.priority]
              const slack = daysBetween(TODAY, it.orderByDate)
              return (
                <div key={it.skuCode} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-txt">{it.name}</div>
                    <div className="text-[11px] text-txt-3">
                      order {fmtNum(it.recommendedOrderQty)} u · {it.supplierLeadTimeDays}d lead
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={slack < 0 ? 'text-xs font-semibold text-critical' : 'text-xs text-txt-2'}>
                      {formatDate(it.orderByDate)}
                    </div>
                    <div className="text-[10px] text-txt-3">
                      {slack < 0 ? `${Math.abs(slack)}d overdue` : `in ${slack}d`}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${m.chipBg} ${m.chipBorder} ${m.text}`}
                  >
                    {it.priority}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => onNavigate('leveling')}
          className="card group relative flex flex-col overflow-hidden p-4 text-left transition-colors hover:border-mint/40"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-mint/70" />
          <div className="text-sm font-bold tracking-tight">Capital leveling</div>
          <p className="mt-1 text-xs leading-relaxed text-txt-3">
            Back-schedule a production run by lead time and defer cash until each part is needed.
          </p>
          <div className="mt-auto pt-5">
            <div className="text-4xl font-extrabold tnum text-mint">
              {fmtMoneyCompact(leveling.impact.capitalDeferred)}
            </div>
            <div className="mt-0.5 text-xs text-txt-2">working capital deferred on the sample run</div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent group-hover:underline">
              Open the leveling planner →
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

function Kpi({
  label,
  value,
  tone,
  note,
  onClick,
}: {
  label: string
  value: string
  tone: string
  note: string
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="card p-4 text-left transition-colors hover:border-line">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-txt-3">{label}</div>
      <div className={`mt-1.5 text-3xl font-extrabold tnum ${tone}`}>{value}</div>
      <div className="mt-1 text-[11px] text-txt-3">{note}</div>
    </button>
  )
}
