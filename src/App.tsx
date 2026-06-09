import { useMemo, useState } from 'react'
import { TODAY, boms, orders, skus } from './data'
import type { SkuAnalysis } from './data/types'
import { costImpact, netRequirements, procurementSchedule } from './lib'
import { BomExplosionDrawer } from './components/BomExplosionDrawer'
import { CostImpact } from './components/CostImpact'
import { Header } from './components/Header'
import { HealthDashboard } from './components/HealthDashboard'
import { ProcurementTimeline } from './components/ProcurementTimeline'
import { ReorderRecommendations } from './components/ReorderRecommendations'

export default function App() {
  const [openRow, setOpenRow] = useState<SkuAnalysis | null>(null)

  // The entire agent runs here, once, from the mock data. Swap `skus/orders/boms`
  // for live D365 reads and nothing below this line changes.
  const { rows, schedule, impact } = useMemo(() => {
    const rows = netRequirements(skus, orders, boms)
    return {
      rows,
      schedule: procurementSchedule(rows, orders, TODAY),
      impact: costImpact(rows, orders),
    }
  }, [])

  const criticalCount = rows.filter((r) => r.status === 'Critical').length

  return (
    <div className="min-h-full">
      <Header today={TODAY} />

      <main className="mx-auto max-w-7xl space-y-10 px-6 py-8">
        {criticalCount > 0 && (
          <div className="card flex flex-wrap items-center gap-x-3 gap-y-1 border-critical/30 bg-critical/[0.07] px-5 py-3.5 text-sm">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-critical/70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-critical" />
            </span>
            <span className="font-semibold text-txt">
              {criticalCount} components are below the line that keeps production running.
            </span>
            <span className="text-txt-2">
              Shared parts compound across orders — the earliest ship date (O-1001) is already
              exposed.
            </span>
          </div>
        )}

        <HealthDashboard rows={rows} onOpenBom={setOpenRow} />
        <ReorderRecommendations items={schedule} today={TODAY} />
        <ProcurementTimeline items={schedule} today={TODAY} />
        <CostImpact impact={impact} />
      </main>

      <footer className="border-t border-line/60 px-6 py-6 text-center text-xs text-txt-3">
        Upcore Technologies · Inventory Leveling &amp; Procurement Intelligence Agent · demonstration
        on mock data — production reads live from Microsoft Dynamics 365.
      </footer>

      <BomExplosionDrawer row={openRow} orders={orders} onClose={() => setOpenRow(null)} />
    </div>
  )
}
