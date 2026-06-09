// Display formatters (used by the UI only — logic stays in raw numbers).

export function fmtNum(n: number): string {
  return n.toLocaleString('en-US')
}

/** Compact money for headline tiles: $11.4K, $1.2M */
export function fmtMoneyCompact(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${Math.round(n)}`
}

/** Full money for tables: $1,348.75 */
export function fmtMoney(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  })
}
