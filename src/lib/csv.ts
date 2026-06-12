import type { BomRow } from '../data/types'

// Dependency-free CSV for the BOM upload. Expected header (case-insensitive):
//   name, qtyPerUnit, leadTimeDays, onHand, unitCost
// Quoted fields (with commas) are supported; everything else is a simple split.

export const BOM_CSV_HEADER = 'name,qtyPerUnit,leadTimeDays,onHand,unitCost'

export const BOM_CSV_TEMPLATE = [
  BOM_CSV_HEADER,
  'Item 1,1,120,5,320',
  'Item 2,2,90,40,85',
  'Item 3,4,60,0,18.5',
  'Item 4,8,30,200,0.45',
  'Item 5,6,14,20,0.3',
].join('\n')

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

export interface ParseResult {
  rows: BomRow[]
  errors: string[]
}

/**
 * Parse a BOM CSV into typed rows. Tolerant: skips blank lines, accepts the
 * header in any column order, collects per-row errors instead of throwing.
 */
export function parseBomCsv(text: string): ParseResult {
  const errors: string[] = []
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length === 0) return { rows: [], errors: ['File is empty.'] }

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase())
  const col = (name: string) => header.indexOf(name.toLowerCase())
  const ci = {
    name: col('name'),
    qtyPerUnit: col('qtyPerUnit'),
    leadTimeDays: col('leadTimeDays'),
    onHand: col('onHand'),
    unitCost: col('unitCost'),
  }
  const missing = Object.entries(ci)
    .filter(([, idx]) => idx === -1)
    .map(([k]) => k)
  if (missing.length) {
    return { rows: [], errors: [`Missing column(s): ${missing.join(', ')}. Expected: ${BOM_CSV_HEADER}`] }
  }

  const rows: BomRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const f = splitCsvLine(lines[i])
    const name = f[ci.name] ?? ''
    if (!name) {
      errors.push(`Row ${i + 1}: missing name — skipped.`)
      continue
    }
    const num = (idx: number, label: string, allowZero = true) => {
      const v = Number(f[idx])
      if (!Number.isFinite(v) || v < 0 || (!allowZero && v <= 0)) {
        errors.push(`Row ${i + 1} (${name}): invalid ${label} "${f[idx]}".`)
        return null
      }
      return v
    }
    const qtyPerUnit = num(ci.qtyPerUnit, 'qtyPerUnit', false)
    const leadTimeDays = num(ci.leadTimeDays, 'leadTimeDays', false)
    const onHand = num(ci.onHand, 'onHand')
    const unitCost = num(ci.unitCost, 'unitCost')
    if (qtyPerUnit === null || leadTimeDays === null || onHand === null || unitCost === null) continue

    rows.push({ name, qtyPerUnit, leadTimeDays, onHand, unitCost })
  }

  return { rows, errors }
}

/** Serialize BOM rows back to CSV (used for the downloadable template). */
export function toBomCsv(rows: BomRow[]): string {
  const body = rows.map((r) =>
    [r.name, r.qtyPerUnit, r.leadTimeDays, r.onHand, r.unitCost]
      .map((v) => (typeof v === 'string' && v.includes(',') ? `"${v}"` : String(v)))
      .join(','),
  )
  return [BOM_CSV_HEADER, ...body].join('\n')
}
