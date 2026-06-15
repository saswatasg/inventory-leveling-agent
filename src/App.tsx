import { useMemo, useState } from 'react'
import { TODAY, boms, orders, skus } from './data'
import type { SkuAnalysis } from './data/types'
import { costImpact, netRequirements, procurementSchedule } from './lib'
import { BomExplosionDrawer } from './components/BomExplosionDrawer'
import { CostImpact } from './components/CostImpact'
import { HealthDashboard } from './components/HealthDashboard'
import { InventoryLeveling } from './components/InventoryLeveling'
import { Overview } from './components/Overview'
import { ProcurementGantt } from './components/ProcurementGantt'
import { ReorderRecommendations } from './components/ReorderRecommendations'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import type { ViewId } from './components/nav'

export default function App() {
  const [view, setView] = useState<ViewId>('overview')
  const [openRow, setOpenRow] = useState<SkuAnalysis | null>(null)

  // The whole agent runs once from the mock data. Swap skus/orders/boms for live
  // D365 reads and nothing below this line changes.
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={view} onChange={setView} badges={{ health: criticalCount }} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar active={view} onChange={setView} today={TODAY} />

        <main className="scrollbar-thin flex-1 overflow-y-auto px-5 py-6 md:px-7">
          <div className="mx-auto flex min-h-full max-w-7xl flex-col">
            <div className="flex-1">
              {view === 'overview' && (
                <Overview rows={rows} schedule={schedule} impact={impact} onNavigate={setView} />
              )}
              {view === 'health' && <HealthDashboard rows={rows} onOpenBom={setOpenRow} />}
              {view === 'reorder' && <ReorderRecommendations items={schedule} today={TODAY} />}
              {view === 'schedule' && <ProcurementGantt items={schedule} today={TODAY} />}
              {view === 'leveling' && <InventoryLeveling />}
              {view === 'cost' && <CostImpact impact={impact} />}
            </div>

            <footer className="mt-10 border-t border-line/50 pt-5 text-center text-xs text-txt-3">
              Upcore Technologies · Inventory Leveling &amp; Procurement Intelligence Agent ·
              demonstration on mock data — production reads live from Microsoft Dynamics 365.
            </footer>
          </div>
        </main>
      </div>

      <BomExplosionDrawer row={openRow} orders={orders} onClose={() => setOpenRow(null)} />
    </div>
  )
}
