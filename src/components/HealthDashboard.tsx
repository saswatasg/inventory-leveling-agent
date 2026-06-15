import { useMemo, useState } from 'react'
import type { SkuAnalysis, Status } from '../data/types'
import { SkuTable } from './SkuTable'
import { StatusTile } from './StatusTile'

const TILES: { status: Status; sublabel: string }[] = [
  { status: 'Critical', sublabel: 'Shortfall halts a build' },
  { status: 'Low', sublabel: 'Eating into safety stock' },
  { status: 'Optimal', sublabel: 'Covered, with buffer' },
  { status: 'Overstocked', sublabel: 'Idle capital on the shelf' },
]

export function HealthDashboard({
  rows,
  onOpenBom,
}: {
  rows: SkuAnalysis[]
  onOpenBom: (r: SkuAnalysis) => void
}) {
  const [filter, setFilter] = useState<Status | null>(null)
  const [search, setSearch] = useState('')

  const counts = useMemo(() => {
    const c: Record<Status, number> = { Critical: 0, Low: 0, Optimal: 0, Overstocked: 0 }
    for (const r of rows) c[r.status]++
    return c
  }, [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (filter && r.status !== filter) return false
      if (!q) return true
      return (
        r.sku.code.toLowerCase().includes(q) ||
        r.sku.name.toLowerCase().includes(q) ||
        r.sku.category.toLowerCase().includes(q)
      )
    })
  }, [rows, filter, search])

  return (
    <section>
      <p className="mb-4 text-sm text-txt-3">
        {rows.length} components across {new Set(rows.map((r) => r.sku.category)).size} categories ·
        click a tile to filter
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {TILES.map((t) => (
          <StatusTile
            key={t.status}
            status={t.status}
            count={counts[t.status]}
            sublabel={t.sublabel}
            active={filter === t.status}
            onClick={() => setFilter((f) => (f === t.status ? null : t.status))}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {filter && (
            <button
              onClick={() => setFilter(null)}
              className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs font-medium text-txt-2 hover:text-txt"
            >
              Clear filter: {filter} ✕
            </button>
          )}
        </div>
        <div className="relative w-full sm:w-72">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-txt-3">
            ⌕
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU, name, category…"
            className="w-full rounded-lg border border-line bg-card/50 py-2 pl-8 pr-3 text-sm text-txt placeholder:text-txt-3 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
          />
        </div>
      </div>

      <div className="mt-3">
        <SkuTable rows={filtered} onOpenBom={onOpenBom} />
      </div>
    </section>
  )
}
