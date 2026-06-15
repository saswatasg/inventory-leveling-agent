import type { CostImpact as Impact } from '../data/types'
import { fmtMoneyCompact } from '../lib'

export function CostImpact({ impact }: { impact: Impact }) {
  return (
    <section>
      <div className="grid gap-3 md:grid-cols-3">
        {/* Stockout exposure */}
        <div className="card relative overflow-hidden p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-critical" />
          <div className="text-xs font-semibold uppercase tracking-wider text-txt-3">
            Revenue at risk
          </div>
          <div className="mt-2 text-3xl font-extrabold tnum text-critical">
            {fmtMoneyCompact(impact.ordersAtRiskValue)}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-txt-2">
            <span className="font-semibold text-txt">{impact.ordersAtRiskCount} orders</span> share
            at least one critical component. Acting now protects their ship dates.
          </p>
        </div>

        {/* Capital in overstock */}
        <div className="card relative overflow-hidden p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-overstocked" />
          <div className="text-xs font-semibold uppercase tracking-wider text-txt-3">
            Capital in overstock
          </div>
          <div className="mt-2 text-3xl font-extrabold tnum text-overstocked">
            {fmtMoneyCompact(impact.capitalInOverstock)}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-txt-2">
            Cash sitting in excess stock beyond demand + safety. Drawing it down releases working
            capital.
          </p>
        </div>

        {/* Holding cost freed */}
        <div className="card relative overflow-hidden p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-optimal" />
          <div className="text-xs font-semibold uppercase tracking-wider text-txt-3">
            Holding cost / yr freed
          </div>
          <div className="mt-2 text-3xl font-extrabold tnum text-optimal">
            {fmtMoneyCompact(impact.holdingCostFreed)}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-txt-2">
            Annual carrying cost (storage, capital, obsolescence @ 25%/yr) on that excess — recovered
            once it clears.
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-txt-3">
        Component-level shortage exposure across all critical SKUs:{' '}
        <span className="font-semibold text-txt-2">{fmtMoneyCompact(impact.shortageExposure)}</span>{' '}
        of parts currently un-coverable. All figures derive from the mock unit costs.
      </p>
    </section>
  )
}
