import type { Status } from '../data/types'
import { STATUS_META } from './statusMeta'

interface Props {
  status: Status
  count: number
  sublabel: string
  active: boolean
  onClick: () => void
}

export function StatusTile({ status, count, sublabel, active, onClick }: Props) {
  const m = STATUS_META[status]
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`card group relative overflow-hidden p-5 text-left transition-all duration-150 hover:border-line ${
        active ? 'ring-2 ring-accent/70' : ''
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${m.dot}`} />
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-txt-2">
          <span className={`h-2.5 w-2.5 rounded-full ${m.dot}`} />
          {m.label}
        </span>
      </div>
      <div className={`mt-3 text-4xl font-extrabold tnum ${m.text}`}>{count}</div>
      <div className="mt-1 text-xs text-txt-3">{sublabel}</div>
    </button>
  )
}
