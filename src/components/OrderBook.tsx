// src/components/OrderBook.tsx
import { useStore } from '../store/useStore'
import { generateOrderBook } from '../lib/orderBook'
import { fmtPrice, fmtQty } from '../lib/format'
import { useMemo } from 'react'

export default function OrderBook() {
  const selectedSymbol = useStore((s) => s.selectedSymbol)
  const prices = useStore((s) => s.prices)
  const price = prices[selectedSymbol]

  const orderBook = useMemo(() => generateOrderBook(price ?? 0), [price, selectedSymbol])

  const maxTotal = useMemo(
    () => Math.max(...orderBook.bids.map((b) => b.total), ...orderBook.asks.map((a) => a.total)),
    [orderBook],
  )

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Order Book</span>
        <span className="text-[10px] text-dim">{selectedSymbol}</span>
      </div>
      <div className="grid grid-cols-3 text-[10px] text-dim px-3 py-1 border-b border-border/50 uppercase tracking-wider">
        <span>Prix</span>
        <span className="text-right">Taille</span>
        <span className="text-right">Total</span>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Asks (reversed so lowest at bottom) */}
        <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col-reverse">
          {orderBook.asks.slice().reverse().map((a, i) => (
            <div key={i} className="relative grid grid-cols-3 px-3 py-0.5 text-xs num">
              <div
                className="absolute inset-y-0 right-0 bg-red/10"
                style={{ width: `${(a.total / maxTotal) * 100}%` }}
              />
              <span className="relative text-red">{fmtPrice(a.price)}</span>
              <span className="relative text-right">{fmtQty(a.size)}</span>
              <span className="relative text-right text-muted">{fmtQty(a.total)}</span>
            </div>
          ))}
        </div>
        <div className="px-3 py-1.5 border-y border-border bg-panel/40 flex items-center justify-between">
          <span className="num text-sm font-bold text-accent">{fmtPrice(price ?? 0)}</span>
          <span className="text-[10px] text-muted">Spread</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {orderBook.bids.map((b, i) => (
            <div key={i} className="relative grid grid-cols-3 px-3 py-0.5 text-xs num">
              <div
                className="absolute inset-y-0 right-0 bg-emerald/10"
                style={{ width: `${(b.total / maxTotal) * 100}%` }}
              />
              <span className="relative text-emerald">{fmtPrice(b.price)}</span>
              <span className="relative text-right">{fmtQty(b.size)}</span>
              <span className="relative text-right text-muted">{fmtQty(b.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
