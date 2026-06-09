import { useEffect } from 'react'
import type { Order, SkuAnalysis } from '../data/types'
import { fmtNum } from '../lib'
import { STATUS_META } from './statusMeta'

export function BomExplosionDrawer({
  row,
  orders,
  onClose,
}: {
  row: SkuAnalysis | null
  orders: Order[]
  onClose: () => void
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (row) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [row, onClose])

  if (!row) return null
  const m = STATUS_META[row.status]
  const orderById = new Map(orders.map((o) => [o.id, o]))

  // demand minus supply, shown as a small reconciliation ladder
  const ladder = [
    { label: 'Gross demand', value: row.gross, sign: '' },
    { label: 'On hand', value: -row.sku.onHand, sign: '−' },
    { label: 'Incoming PO', value: -row.sku.incomingPoQty, sign: '−' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside className="scrollbar-thin relative h-full w-full max-w-lg overflow-y-auto border-l border-line bg-navy-800 shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-line bg-navy-800/95 px-6 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-txt-3">
                BOM Explosion · {row.sku.code}
              </div>
              <h3 className="text-lg font-bold text-txt">{row.sku.name}</h3>
              <span
                className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${m.chipBg} ${m.chipBorder} ${m.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
                {m.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg border border-line px-2.5 py-1 text-sm text-txt-2 hover:text-txt"
            >
              Esc ✕
            </button>
          </div>
        </div>

        <div className="space-y-6 px-6 py-5">
          {/* Where the demand comes from */}
          <div>
            <h4 className="mb-2 text-sm font-bold text-txt">
              Demand drivers
              <span className="ml-2 font-normal text-txt-3">
                {row.contributions.length} order{row.contributions.length === 1 ? '' : 's'}
              </span>
            </h4>
            <div className="card divide-y divide-line/50">
              {row.contributions.map((c) => {
                const o = orderById.get(c.orderId)!
                const perUnit = c.units / o.quantity
                return (
                  <div key={c.orderId} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-txt">{o.product}</div>
                      <div className="text-xs text-txt-3">
                        {o.id} · {o.customer}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="tnum text-sm font-semibold text-txt">
                        {fmtNum(c.units)} u
                      </div>
                      <div className="text-[11px] text-txt-3">
                        {fmtNum(o.quantity)} × {perUnit} / unit
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-between bg-white/[0.02] px-4 py-3">
                <span className="text-sm font-semibold text-txt-2">Consolidated gross</span>
                <span className="tnum text-sm font-bold text-accent">{fmtNum(row.gross)} u</span>
              </div>
            </div>
          </div>

          {/* The netting math */}
          <div>
            <h4 className="mb-2 text-sm font-bold text-txt">Net position</h4>
            <div className="card px-4 py-3">
              <div className="space-y-1.5 text-sm">
                {ladder.map((l) => (
                  <div key={l.label} className="flex justify-between">
                    <span className="text-txt-2">
                      {l.sign && <span className="mr-1 text-txt-3">{l.sign}</span>}
                      {l.label}
                    </span>
                    <span className="tnum text-txt">{fmtNum(Math.abs(l.value))}</span>
                  </div>
                ))}
                <div className="my-2 border-t border-line/60" />
                <div className="flex justify-between font-semibold">
                  <span className="text-txt">Net</span>
                  <span className={`tnum ${row.net > 0 ? 'text-critical' : 'text-optimal'}`}>
                    {row.net > 0 ? `−${fmtNum(row.net)} short` : `+${fmtNum(-row.net)} cover`}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <Stat label="Safety stock" value={fmtNum(row.sku.safetyStock)} />
              <Stat label="Min level" value={fmtNum(row.minLevel)} accent />
              <Stat label="Lead time" value={`${row.sku.supplierLeadTimeDays}d`} />
            </div>

            <p className="mt-3 text-xs leading-relaxed text-txt-3">
              Minimum level = gross demand ({fmtNum(row.gross)}) + safety stock (
              {fmtNum(row.sku.safetyStock)}) − incoming PO ({fmtNum(row.sku.incomingPoQty)}) ={' '}
              <span className="font-semibold text-txt-2">{fmtNum(row.minLevel)}</span>. On hand is{' '}
              {fmtNum(row.sku.onHand)} →{' '}
              {row.belowMinBy > 0 ? (
                <span className="font-semibold text-critical">
                  {fmtNum(row.belowMinBy)} below minimum.
                </span>
              ) : (
                <span className="font-semibold text-optimal">
                  {fmtNum(-row.belowMinBy)} above minimum.
                </span>
              )}
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card px-2 py-3">
      <div className={`text-lg font-bold tnum ${accent ? 'text-accent' : 'text-txt'}`}>{value}</div>
      <div className="text-[11px] text-txt-3">{label}</div>
    </div>
  )
}
