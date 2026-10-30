// src/lib/orderBook.ts
import type { OrderBook, OrderBookLevel } from '../types'

export function generateOrderBook(price: number, levels = 14): OrderBook {
  const bids: OrderBookLevel[] = []
  const asks: OrderBookLevel[] = []
  const tick = price >= 100 ? 0.01 : price >= 1 ? 0.01 : 0.0001
  let bidTotal = 0
  let askTotal = 0
  for (let i = 0; i < levels; i++) {
    const bp = price - (i + 1) * tick * (1 + Math.random() * 3)
    const bs = Math.round((Math.random() * 800 + 100) * (1 + (levels - i) / levels))
    bidTotal += bs
    bids.push({ price: +bp.toFixed(6), size: bs, total: bidTotal })
    const ap = price + (i + 1) * tick * (1 + Math.random() * 3)
    const as = Math.round((Math.random() * 800 + 100) * (1 + (levels - i) / levels))
    askTotal += as
    asks.push({ price: +ap.toFixed(6), size: as, total: askTotal })
  }
  return { bids, asks }
}
