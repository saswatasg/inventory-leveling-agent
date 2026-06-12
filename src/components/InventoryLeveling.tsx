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
    setSourceLabel(SAMPLE_PRODUCT)
    setUploadMsg('')
    setUploadErrors([])
  }

  const runway = daysBetween(TODAY, productionDate)

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-tight">
          Inventory Leveling <span className="text-txt-3">· plan a production run</span>
        </h2>
        <p className="text-sm text-txt-3">
          Upload a BOM (quantity + lead time), set the build date, and the agent back-schedules every
          purchase so parts arrive just-in-time — ordering long-lead items first and short-lead last,
          so capital isn&rsquo;t tied up early.
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

      {/* impact cards */}
      <div className="mb-3 grid gap-3 md:grid-cols-4">
        <ImpactCard
          accent="text-overstocked"
          bar="bg-overstocked"
          label="Capital deferred"
          value={fmtMoneyCompact(impact.capitalDeferred)}
          note="Scheduled for later — not committed today."
        />
        <ImpactCard
          accent="text-critical"
          bar="bg-critical"
          label="Commit now"
          value={fmtMoneyCompact(impact.dueNowCost)}
          note={`${impact.mustPreStockCount} part${impact.mustPreStockCount === 1 ? '' : 's'} must be pre-stocked (lead > runway).`}
        />
        <ImpactCard
          accent="text-optimal"
          bar="bg-optimal"
          label="Carrying cost avoided /yr"
          value={fmtMoneyCompact(impact.holdingCostAvoided)}
          note="By staggering vs. ordering everything today."
        />
        <ImpactCard
          accent="text-accent"
          bar="bg-accent"
          label="Critical path"
          value={`${impact.criticalPathDays}d`}
          note="Longest lead time — the binding constraint."
        />
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

function ImpactCard({
  accent,
  bar,
  label,
  value,
  note,
}: {
  accent: string
  bar: string
  label: string
  value: string
  note: string
}) {
  return (
    <div className="card relative overflow-hidden p-4">
      <div className={`absolute inset-x-0 top-0 h-1 ${bar}`} />
      <div className="text-[11px] font-semibold uppercase tracking-wider text-txt-3">{label}</div>
      <div className={`mt-1.5 text-2xl font-extrabold tnum ${accent}`}>{value}</div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-txt-2">{note}</p>
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
