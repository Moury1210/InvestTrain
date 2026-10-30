// src/components/Watchlist.tsx
import { useStore } from '../store/useStore'
import { ASSETS } from '../lib/assets'
import { fmtPrice, fmtPct } from '../lib/format'

export default function Watchlist() {
  const watchlist = useStore((s) => s.watchlist)
  const prices = useStore((s) => s.prices)
  const candles = useStore((s) => s.candles)
  const selectedSymbol = useStore((s) => s.selectedSymbol)
  const setSelectedSymbol = useStore((s) => s.setSelectedSymbol)
  const addToWatchlist = useStore((s) => s.addToWatchlist)
  const removeFromWatchlist = useStore((s) => s.removeFromWatchlist)

  const available = ASSETS.filter((a) => !watchlist.includes(a.symbol))

  return (
    <aside className="flex flex-col h-full bg-bg-soft/40 border-r border-border">
      <div className="px-3 py-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-bold">Ma liste</span>
        <select
          className="text-xs bg-panel border border-border rounded-xl px-2 py-1.5 text-text"
          value=""
          onChange={(e) => {
            if (e.target.value) addToWatchlist(e.target.value)
            e.target.value = ''
          }}
        >
          <option value="">Ajouter</option>
          {available.map((a) => (
            <option key={a.symbol} value={a.symbol}>
              {a.symbol} — {a.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {watchlist.map((sym) => {
          const asset = ASSETS.find((a) => a.symbol === sym)!
          const price = prices[sym]
          const cs = candles[sym]
          const prev = cs && cs.length > 1 ? cs[cs.length - 2].close : price
          const changePct = prev ? ((price - prev) / prev) * 100 : 0
          const selected = sym === selectedSymbol
          const up = changePct >= 0
          return (
            <div
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              className={`group flex items-center justify-between px-3 py-3 cursor-pointer border-b border-border/40 transition rounded-none ${
                selected
                  ? 'bg-gradient-to-r from-accent/20 to-fun/10 border-l-4 border-l-fun'
                  : 'hover:bg-panel/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-panel-2 border border-border flex items-center justify-center text-xs font-bold text-accent">
                  {sym.slice(0, 2)}
                </div>
                <div>
                  <div className="font-bold text-sm">{sym}</div>
                  <div className="text-[10px] text-muted">{asset.name}</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="num text-sm font-bold">{fmtPrice(price)}</span>
                <span className={`num text-xs font-semibold ${up ? 'text-emerald' : 'text-red'}`}>
                  {up ? '▲' : '▼'} {fmtPct(changePct)}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFromWatchlist(sym)
                }}
                className="ml-2 opacity-0 group-hover:opacity-100 text-dim hover:text-red text-lg"
              >
                x
              </button>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
