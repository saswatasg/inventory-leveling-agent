import { useMemo, useRef, useState } from 'react'
import {
  DEFAULT_ORDER_QTY,
  DEFAULT_PRODUCTION_DATE,
  SAMPLE_PRODUCT,
  TODAY,
  sampleBom,
} from '../data'
import type { BomRow } from '../data/types'
import {
  BOM_CSV_TEMPLATE,
  daysBetween,
  fmtMoney,
  fmtMoneyCompact,
  fmtNum,
  formatDate,
  levelProductionRun,
  parseBomCsv,
} from '../lib'
import { Gantt } from './Gantt'

function downloadCsv(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function InventoryLeveling() {
  const [bom, setBom] = useState<BomRow[]>(sampleBom)
  const [orderQty, setOrderQty] = useState(DEFAULT_ORDER_QTY)
  const [productionDate, setProductionDate] = useState(DEFAULT_PRODUCTION_DATE)
  const [sourceLabel, setSourceLabel] = useState(SAMPLE_PRODUCT)
  const [uploadMsg, setUploadMsg] = useState('')
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const { rows, impact, gantt } = useMemo(
    () => levelProductionRun(bom, Math.max(1, orderQty || 1), productionDate, TODAY),
    [bom, orderQty, productionDate],
  )

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const { rows: parsed, errors } = parseBomCsv(String(reader.result ?? ''))
      if (parsed.length) {
        setBom(parsed)
        setSourceLabel(file.name)
        setUploadMsg(`Loaded ${parsed.length} component${parsed.length === 1 ? '' : 's'} from ${file.name}.`)
      } else {
        setUploadMsg('')
      }
      setUploadErrors(errors)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function loadSample() {
    setBom(sampleBom)
    setOrderQty(DEFAULT_ORDER_QTY)
    setProductionDate(DEFAULT_PRODUCTION_DATE)
    setSourceLabel(SAMPLE_PRODUCT)
    setUploadMsg('')
    setUploadErrors([])
  }

  const runway = daysBetween(TODAY, productionDate)
  const pctDeferred =
    impact.totalProcurementCost > 0
      ? Math.round((impact.capitalDeferred / impact.totalProcurementCost) * 100)
      : 0

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-tight">
          Inventory Leveling <span className="text-txt-3">· plan a production run</span>
        </h2>
        <p className="max-w-3xl text-sm text-txt-3">
          Give it a BOM (quantity + lead time per part) and a build date — it back-schedules every
          purchase order so parts arrive <span className="text-txt-2">just-in-time</span>: long-lead
          items ordered first, short-lead last. You commit cash only as each part is actually needed,
          instead of tying up working capital months early.
        </p>
      </div>

      {/* controls */}
      <div className="card mb-3 flex flex-wrap items-end gap-x-5 gap-y-3 p-4">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-txt-3">
            Order quantity
          </label>
          <input
            type="number"
            min={1}
            value={orderQty}
            onChange={(e) => setOrderQty(Number(e.target.value))}
            className="w-28 rounded-lg border border-line bg-card/60 px-3 py-2 text-sm text-txt focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-txt-3">
            Production / required-by date
          </label>
          <input
            type="date"
            min={TODAY}
            value={productionDate}
            onChange={(e) => e.target.value && setProductionDate(e.target.value)}
            className="rounded-lg border border-line bg-card/60 px-3 py-2 text-sm text-txt [color-scheme:dark] focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
          />
          <div className="mt-1 text-[11px] text-txt-3">{runway} days of runway</div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
          >
            ⤴ Upload BOM (CSV)
          </button>
          <button
            onClick={loadSample}
            className="rounded-lg border border-line bg-white/[0.03] px-3 py-2 text-sm font-medium text-txt-2 hover:text-txt"
          >
            Load sample
          </button>
          <button
            onClick={() => downloadCsv('bom-template.csv', BOM_CSV_TEMPLATE)}
            className="rounded-lg border border-line bg-white/[0.03] px-3 py-2 text-sm font-medium text-txt-2 hover:text-txt"
          >
            ↓ Template
          </button>
        </div>

        <div className="w-full text-xs text-txt-3">
          Source: <span className="font-medium text-txt-2">{sourceLabel}</span>
          {uploadMsg && <span className="ml-2 text-optimal">· {uploadMsg}</span>}
        </div>
        {uploadErrors.length > 0 && (
          <div className="w-full rounded-lg border border-low/30 bg-low/10 px-3 py-2 text-xs text-low">
            {uploadErrors.slice(0, 4).map((e, i) => (
              <div key={i}>{e}</div>
            ))}
            {uploadErrors.length > 4 && <div>…and {uploadErrors.length - 4} more.</div>}
          </div>
        )}
      </div>

      {/* hero: order-everything-today vs. leveled */}
      <div className="card mb-3 p-4 md:p-5">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-txt-3">
          What leveling is worth on this run
        </div>
        <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
          {/* order everything today */}
          <div className="rounded-xl border border-critical/30 bg-critical/[0.06] p-4">
            <div className="text-xs font-semibold text-critical">Order everything today</div>
            <div className="mt-1 text-2xl font-extrabold tnum text-txt">
              {fmtMoneyCompact(impact.totalProcurementCost)}
              <span className="ml-1 text-sm font-medium text-txt-3">committed now</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-txt-2">
              {fmtMoneyCompact(impact.capitalDeferred)} of it sits idle for weeks before it&rsquo;s
              needed — roughly {fmtMoney(impact.holdingCostAvoided)}/yr in carrying cost.
            </p>
          </div>

          {/* delta */}
          <div className="flex flex-row items-center justify-center gap-3 px-2 md:flex-col">
            <div className="text-2xl text-txt-3">→</div>
            <div className="text-center">
              <div className="text-2xl font-extrabold tnum text-mint">
                {fmtMoneyCompact(impact.capitalDeferred)}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-txt-3">
                freed up front · {pctDeferred}%
              </div>
            </div>
          </div>

          {/* leveled */}
          <div className="rounded-xl border border-mint/40 bg-mint/[0.07] p-4">
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-mint">Leveled schedule</div>
              <span className="rounded-full border border-mint/40 bg-mint/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-mint">
                recommended
              </span>
            </div>
            <div className="mt-1 text-2xl font-extrabold tnum text-txt">
              {fmtMoneyCompact(impact.dueNowCost)}
              <span className="ml-1 text-sm font-medium text-txt-3">committed now</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-txt-2">
              The remaining {fmtMoneyCompact(impact.capitalDeferred)} is ordered only as each part is
              needed — no early stock, near-zero idle carrying cost.
            </p>
          </div>
        </div>
      </div>

      {/* compact stat row */}
      <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Order value" value={fmtMoneyCompact(impact.totalProcurementCost)} note="Total components to procure" />
        <Stat
          label="Must pre-stock"
          value={`${impact.mustPreStockCount}`}
          note="Lead time exceeds the runway"
          tone={impact.mustPreStockCount > 0 ? 'text-critical' : 'text-optimal'}
        />
        <Stat label="Critical path" value={`${impact.criticalPathDays}d`} note="Longest lead — the constraint" tone="text-accent" />
        <Stat label="Carrying cost avoided" value={`${fmtMoneyCompact(impact.holdingCostAvoided)}/yr`} note="On stock that would sit idle" tone="text-optimal" />
      </div>

      {/* gantt */}
      <Gantt
        rows={gantt}
        today={TODAY}
        markerDate={productionDate}
        markerLabel="Build"
        emptyLabel="Every component is fully stocked for this run."
      />

      {/* component table */}
      <div className="card mt-3 scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-txt-3">
              <th className="px-4 py-3 font-semibold">Component</th>
              <th className="px-4 py-3 text-right font-semibold">Lead (d)</th>
              <th className="px-4 py-3 text-right font-semibold">Required</th>
              <th className="px-4 py-3 text-right font-semibold">On hand</th>
              <th className="px-4 py-3 text-right font-semibold">Shortage</th>
              <th className="px-4 py-3 font-semibold">Order by</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const covered = r.shortage === 0
              return (
                <tr
                  key={r.name}
                  className="border-b border-line/40 last:border-0 hover:bg-white/[0.025]"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-txt">{r.name}</div>
                    <div className="text-[11px] text-txt-3">
                      {r.qtyPerUnit}/unit · {fmtMoney(r.unitCost)} ea
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tnum text-txt-2">{r.leadTimeDays}</td>
                  <td className="px-4 py-3 text-right tnum text-txt">{fmtNum(r.required)}</td>
                  <td className="px-4 py-3 text-right tnum text-txt-2">{fmtNum(r.onHand)}</td>
                  <td
                    className={`px-4 py-3 text-right tnum font-semibold ${
                      covered ? 'text-optimal' : 'text-critical'
                    }`}
                  >
                    {covered ? '—' : fmtNum(r.shortage)}
                  </td>
                  <td className="px-4 py-3 tnum text-txt-2">
                    {covered ? <span className="text-txt-3">—</span> : formatDate(r.orderByDate)}
                  </td>
                  <td className="px-4 py-3">
                    {covered ? (
                      <Badge tone="optimal">Covered</Badge>
                    ) : r.feasible ? (
                      <Badge tone="accent">Order on schedule</Badge>
                    ) : (
                      <Badge tone="critical">Pre-stock / expedite</Badge>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  note,
  tone = 'text-txt',
}: {
  label: string
  value: string
  note: string
  tone?: string
}) {
  return (
    <div className="card p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-txt-3">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold tnum ${tone}`}>{value}</div>
      <div className="mt-1 text-[11px] text-txt-3">{note}</div>
    </div>
  )
}

function Badge({
  tone,
  children,
}: {
  tone: 'optimal' | 'accent' | 'critical'
  children: React.ReactNode
}) {
  const map = {
    optimal: 'bg-optimal/10 border-optimal/30 text-optimal',
    accent: 'bg-accent/10 border-accent/30 text-accent',
    critical: 'bg-critical/10 border-critical/30 text-critical',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[tone]}`}
    >
      {children}
    </span>
  )
}
