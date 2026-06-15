import { Icon } from './Icon'
import { NAV, type ViewId } from './nav'

/**
 * Desktop vertical nav. Logo at top, view list in the middle, a "Dynamics
 * 365-ready" footer at the bottom. The active view is highlighted; an optional
 * badge count surfaces urgency (e.g. Critical components) on a nav item.
 */
export function Sidebar({
  active,
  onChange,
  badges,
}: {
  active: ViewId
  onChange: (id: ViewId) => void
  badges?: Partial<Record<ViewId, number>>
}) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line/60 bg-navy-900/80 lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <img src="/upcore-logo.svg" alt="Upcore" className="h-8 w-auto" />
        <div className="h-7 w-px bg-line" />
        <div className="leading-tight">
          <div className="text-[11px] font-bold tracking-tight text-txt">Inventory Agent</div>
          <div className="flex items-center gap-1 text-[10px] text-txt-3">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> live
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item) => {
          const isActive = item.id === active
          const badge = badges?.[item.id]
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/12 text-accent'
                  : 'text-txt-2 hover:bg-white/[0.03] hover:text-txt'
              }`}
            >
              <Icon name={item.icon} className={`h-[18px] w-[18px] ${isActive ? 'text-accent' : 'text-txt-3 group-hover:text-txt-2'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {badge ? (
                <span className="rounded-full bg-critical/15 px-1.5 py-0.5 text-[10px] font-bold text-critical">
                  {badge}
                </span>
              ) : null}
              {isActive && <span className="h-4 w-0.5 rounded-full bg-accent" />}
            </button>
          )
        })}
      </nav>

      <div className="m-3 rounded-xl border border-mint/20 bg-mint/[0.06] p-3">
        <div className="text-[11px] font-semibold text-mint">Dynamics 365-ready</div>
        <p className="mt-1 text-[10px] leading-relaxed text-txt-3">
          Running on demo CSV. Production reads live Sales Orders, BOMs, Inventory & POs from D365.
        </p>
      </div>
    </aside>
  )
}
