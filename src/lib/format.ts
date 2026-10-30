// src/lib/format.ts
export function fmtMoney(v: number, currency = '€'): string {
  const sign = v < 0 ? '-' : ''
  const abs = Math.abs(v)
  return sign + abs.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency
}

export function fmtPrice(v: number): string {
  if (v >= 1000) return v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (v >= 1) return v.toFixed(2)
  if (v >= 0.01) return v.toFixed(4)
  return v.toFixed(6)
}

export function fmtPct(v: number): string {
  const sign = v >= 0 ? '+' : ''
  return sign + v.toFixed(2) + '%'
}

export function fmtQty(v: number): string {
  if (Number.isInteger(v)) return v.toString()
  return v.toFixed(4).replace(/\.?0+$/, '')
}

export function fmtVolume(v: number): string {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return v.toString()
}
