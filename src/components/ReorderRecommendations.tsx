import type { ProcurementItem } from '../data/types'
import { fmtMoney, fmtNum, formatDate, daysBetween } from '../lib'
import { PRIORITY_META } from './statusMeta'

export function ReorderRecommendations({
  items,
  today,
}: {
  items: ProcurementItem[]
  today: string
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-tight">Reorder Recommendations</h2>
        <p className="text-sm text-txt-3">
          What to buy to bring every short component back to its minimum level — and the last day to
          place each PO.
        </p>
      </div>

      <div className="card scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-txt-3">
              <th className="px-4 py-3 font-semibold">Component</th>
              <th className="px-4 py-3 text-right font-semibold">Order qty</th>
              <th className="px-4 py-3 text-right font-semibold">Est. cost</th>
              <th className="px-4 py-3 text-right font-semibold">Lead (d)</th>
              <th className="px-4 py-3 font-semibold">Order by</th>
              <th className="px-4 py-3 font-semibold">Priority</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const m = PRIORITY_META[it.priority]
              const slack = daysBetween(today, it.orderByDate)
              const overdue = slack < 0
              return (
                <tr
                  key={it.skuCode}
                  className="border-b border-line/40 last:border-0 hover:bg-white/[0.025]"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-txt">{it.name}</div>
                    <div className="font-mono text-xs text-txt-3">{it.skuCode}</div>
                  </td>
                  <td className="px-4 py-3 text-right tnum font-semibold text-txt">
                    {fmtNum(it.recommendedOrderQty)}
                  </td>
                  <td className="px-4 py-3 text-right tnum text-txt-2">{fmtMoney(it.orderCost)}</td>
                  <td className="px-4 py-3 text-right tnum text-txt-2">
                    {it.supplierLeadTimeDays}
                  </td>
                  <td className="px-4 py-3">
                    <div className={overdue ? 'font-semibold text-critical' : 'text-txt'}>
                      {formatDate(it.orderByDate)}
                    </div>
                    <div className="text-xs text-txt-3">
                      {overdue
                        ? `${Math.abs(slack)}d overdue`
                        : slack === 0
                          ? 'today'
                          : `in ${slack}d`}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${m.chipBg} ${m.chipBorder} ${m.text}`}
                    >
                      {it.priority}
                    </span>
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
