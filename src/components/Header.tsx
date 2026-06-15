import { formatDate } from '../lib'

export function Header({ today }: { today: string }) {
  return (
    <header className="border-b border-line/60 bg-navy-900/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between md:py-7">
        <div className="flex items-start gap-4">
          <img
            src="/upcore-logo.svg"
            alt="Upcore Technologies"
            className="h-9 w-auto shrink-0 md:h-10"
          />
          <div className="hidden h-10 w-px bg-line md:block" />
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                Agent · Live
              </span>
              <span className="inline-flex items-center rounded-full border border-mint/30 bg-mint/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-mint">
                Dynamics 365-ready
              </span>
            </div>
            <h1 className="text-xl font-extrabold leading-tight tracking-tight md:text-2xl">
              Inventory Leveling &amp; Procurement Intelligence Agent
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-txt-2">
              Explodes every order through its BOM, nets demand against live stock, and back-schedules
              each purchase by supplier lead time &mdash; so you hold the minimum, protect every ship
              date, and never tie up working capital early.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-stretch gap-2">
          <div className="rounded-xl border border-line bg-card/50 px-4 py-2.5 text-right">
            <div className="text-[11px] font-medium uppercase tracking-wider text-txt-3">
              Data source
            </div>
            <div className="font-semibold text-txt">Demo CSV</div>
            <div className="text-[10px] text-txt-3">live: Dynamics 365</div>
          </div>
          <div className="rounded-xl border border-line bg-card/50 px-4 py-2.5 text-right">
            <div className="text-[11px] font-medium uppercase tracking-wider text-txt-3">
              Planning date
            </div>
            <div className="font-semibold text-txt">{formatDate(today)}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
