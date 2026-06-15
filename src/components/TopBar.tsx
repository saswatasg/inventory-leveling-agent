import { formatDate } from '../lib'
import { Icon } from './Icon'
import { NAV, type ViewId } from './nav'

export function TopBar({
  active,
  onChange,
  today,
}: {
  active: ViewId
  onChange: (id: ViewId) => void
  today: string
}) {
  const item = NAV.find((n) => n.id === active)!

  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-navy-900/95">
      <div className="flex items-center gap-4 px-5 py-3.5 md:px-7">
        {/* mobile logo */}
        <img src="/upcore-logo.svg" alt="Upcore" className="h-7 w-auto shrink-0 lg:hidden" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-extrabold tracking-tight md:text-lg">
            {item.title}
          </h1>
          <p className="hidden truncate text-xs text-txt-3 sm:block">{item.subtitle}</p>
        </div>

        <div className="hidden shrink-0 items-stretch gap-2 sm:flex">
          <div className="rounded-xl border border-line bg-card/50 px-3 py-1.5 text-right">
            <div className="text-[10px] font-medium uppercase tracking-wider text-txt-3">
              Data source
            </div>
            <div className="text-sm font-semibold text-txt">Demo CSV</div>
          </div>
          <div className="rounded-xl border border-line bg-card/50 px-3 py-1.5 text-right">
            <div className="text-[10px] font-medium uppercase tracking-wider text-txt-3">
              Planning date
            </div>
            <div className="text-sm font-semibold text-txt">{formatDate(today)}</div>
          </div>
        </div>
      </div>

      {/* mobile / tablet tab strip */}
      <div className="scrollbar-thin flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden">
        {NAV.map((n) => {
          const isActive = n.id === active
          return (
            <button
              key={n.id}
              onClick={() => onChange(n.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive ? 'bg-accent/12 text-accent' : 'text-txt-2 hover:text-txt'
              }`}
            >
              <Icon name={n.icon} className="h-4 w-4" />
              {n.label}
            </button>
          )
        })}
      </div>
    </header>
  )
}
