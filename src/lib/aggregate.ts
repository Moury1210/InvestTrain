// src/lib/aggregate.ts
import type { Candle } from '../types'

export function aggregateCandles(candles: Candle[], tfSeconds: number): Candle[] {
  if (tfSeconds <= 60) return candles.slice()
  const map = new Map<number, Candle>()
  for (const c of candles) {
    const bucket = Math.floor(c.time / tfSeconds) * tfSeconds
    const existing = map.get(bucket)
    if (!existing) {
      map.set(bucket, {
        time: bucket,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      })
    } else {
      existing.high = Math.max(existing.high, c.high)
      existing.low = Math.min(existing.low, c.low)
      existing.close = c.close
      existing.volume += c.volume
    }
  }
  return Array.from(map.values()).sort((a, b) => a.time - b.time)
}
