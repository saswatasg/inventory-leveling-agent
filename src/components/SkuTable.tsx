import { useMemo, useState } from 'react'
import type { SkuAnalysis } from '../data/types'
import { fmtNum } from '../lib'
import { STATUS_META } from './statusMeta'

type SortKey = 'code' | 'name' | 'category' | 'onHand' | 'minLevel' | 'net' | 'leadTime' | 'status'
type Dir = 'asc' | 'desc'

const STATUS_RANK: Record<string, number> = { Critical: 0, Low: 1, Optimal: 2, Overstocked: 3 }

function valueFor(r: SkuAnalysis, key: SortKey): number | string {
  switch (key) {
    case 'code':
      return r.sku.code
    case 'name':
      return r.sku.name
    case 'category':
      return r.sku.category
    case 'onHand':
      return r.sku.onHand
    case 'minLevel':
      return r.minLevel
    case 'net':
      return r.net
    case 'leadTime':
      return r.sku.supplierLeadTimeDays
    case 'status':
      return STATUS_RANK[r.status]
  }
}

const COLUMNS: { key: SortKey; label: string; align: 'left' | 'right' }[] = [
  { key: 'code', label: 'SKU', align: 'left' },
  { key: 'name', label: 'Component', align: 'left' },
  { key: 'category', label: 'Category', align: 'left' },
  { key: 'onHand', label: 'On hand', align: 'right' },
  { key: 'minLevel', label: 'Min level', align: 'right' },
  { key: 'net', label: 'Net', align: 'right' },
  { key: 'leadTime', label: 'Lead (d)', align: 'right' },
  { key: 'status', label: 'Status', align: 'left' },
]

export function SkuTable({
  rows,
  onOpenBom,
}: {
  rows: SkuAnalysis[]
  onOpenBom: (r: SkuAnalysis) => void
}) {
  const [sortKey, setSortKey] = useState<SortKey>('status')
  const [dir, setDir] = useState<Dir>('asc')

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = valueFor(a, sortKey)
      const bv = valueFor(b, sortKey)
      let cmp = typeof av === 'string' ? av.localeCompare(bv as string) : av - (bv as number)
      if (cmp === 0) cmp = b.belowMinBy - a.belowMinBy // stable tiebreak: worst first
      return dir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, sortKey, dir])

  function toggleSort(key: SortKey) {
    if (key === sortKey) setDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setDir(key === 'net' || key === 'onHand' || key === 'minLevel' ? 'desc' : 'asc')
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-txt-3">
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className={`cursor-pointer select-none whitespace-nowrap px-4 py-3 font-semibold hover:text-txt-2 ${
                    c.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    <span className={sortKey === c.key ? 'text-accent' : 'text-txt-3/40'}>
                      {sortKey === c.key ? (dir === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </span>
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const m = STATUS_META[r.status]
              return (
                <tr
                  key={r.sku.code}
                  className="border-b border-line/40 transition-colors last:border-0 hover:bg-white/[0.025]"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-txt-2">
                    {r.sku.code}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-txt">{r.sku.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-txt-2">{r.sku.category}</td>
                  <td className="px-4 py-3 text-right tnum text-txt">{fmtNum(r.sku.onHand)}</td>
                  <td className="px-4 py-3 text-right tnum text-txt-2">{fmtNum(r.minLevel)}</td>
                  <td
                    className={`px-4 py-3 text-right tnum font-semibold ${
                      r.net > 0 ? 'text-critical' : 'text-txt-2'
                    }`}
                  >
                    {r.net > 0 ? `−${fmtNum(r.net)}` : `+${fmtNum(-r.net)}`}
                  </td>
                  <td className="px-4 py-3 text-right tnum text-txt-2">
                    {r.sku.supplierLeadTimeDays}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${m.chipBg} ${m.chipBorder} ${m.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
                      {m.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onOpenBom(r)}
                      className="whitespace-nowrap rounded-lg border border-line bg-white/[0.02] px-2.5 py-1 text-xs font-medium text-txt-2 transition-colors hover:border-accent/50 hover:text-accent"
                      title="See which orders drive this requirement"
                    >
                      BOM ↗
                    </button>
                  </td>
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-4 py-10 text-center text-txt-3">
                  No components match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-line/60 px-4 py-2.5 text-xs text-txt-3">
        Showing {sorted.length} component{sorted.length === 1 ? '' : 's'} · <span className="text-txt-2">Net</span> ={' '}
        on-hand + open POs − demand (negative = shortfall) · <span className="text-txt-2">Min level</span> ={' '}
        demand + safety stock − incoming PO
      </div>
    </div>
  )
}
