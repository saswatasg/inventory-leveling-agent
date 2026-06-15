export type IconName =
  | 'overview'
  | 'health'
  | 'reorder'
  | 'schedule'
  | 'leveling'
  | 'cost'

const PATHS: Record<IconName, React.ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  health: <path d="M3 12h4l2.5-7 4 14 2.5-7H21" />,
  reorder: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </>
  ),
  schedule: (
    <>
      <rect x="3" y="5" width="9" height="3" rx="1.5" />
      <rect x="8" y="10.5" width="12" height="3" rx="1.5" />
      <rect x="5" y="16" width="7" height="3" rx="1.5" />
    </>
  ),
  leveling: (
    <>
      <path d="M4 7h8M16 7h4" />
      <circle cx="14" cy="7" r="2" />
      <path d="M4 12h3M11 12h9" />
      <circle cx="9" cy="12" r="2" />
      <path d="M4 17h11M19 17h1" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  cost: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M14.2 9.3c-.5-.8-1.4-1.1-2.4-1.1-1.4 0-2.4.7-2.4 1.8 0 2.4 5 1.1 5 3.6 0 1.1-1.1 1.8-2.6 1.8-1.1 0-2-.4-2.5-1.2" />
    </>
  ),
}

export function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  )
}
