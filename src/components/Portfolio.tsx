// src/components/Portfolio.tsx
import { useStore } from '../store/useStore'
import { fmtMoney, fmtPrice, fmtQty } from '../lib/format'

export default function Portfolio() {
  const positions = useStore((s) => s.positions)
  const prices = useStore((s) => s.prices)
  const capital = useStore((s) => s.capital)
  const equity = useStore((s) => s.getEquity())
  const unrealized = useStore((s) => s.getUnrealizedPnl())
  const realized = useStore((s) => s.getRealizedPnl())
  const initial = useStore((s) => s.initialCapital)
  const setSelectedSymbol = useStore((s) => s.setSelectedSymbol)

  const posList = Object.values(positions)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-bold">Mon portefeuille</span>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        <div className="bg-gradient-to-br from-panel to-panel-2 rounded-2xl p-3 border border-border">
          <div className="text-[10px] text-muted uppercase">Total</div>
          <div className="num text-base font-bold text-accent">{fmtMoney(equity)}</div>
        </div>
        <div className="bg-gradient-to-br from-panel to-panel-2 rounded-2xl p-3 border border-border">
          <div className="text-[10px] text-muted uppercase">Cash</div>
          <div className="num text-base font-bold">{fmtMoney(capital)}</div>
        </div>
        <div className="bg-gradient-to-br from-panel to-panel-2 rounded-2xl p-3 border border-border">
          <div className="text-[10px] text-muted uppercase">Gains latents</div>
          <div className={`num text-base font-bold ${unrealized >= 0 ? 'text-emerald' : 'text-red'}`}>
            {unrealized >= 0 ? '▲' : '▼'} {fmtMoney(unrealized)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-panel to-panel-2 rounded-2xl p-3 border border-border">
          <div className="text-[10px] text-muted uppercase">Gains réalisés</div>
          <div className={`num text-base font-bold ${realized >= 0 ? 'text-emerald' : 'text-red'}`}>
            {realized >= 0 ? '▲' : '▼'} {fmtMoney(realized)}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
        {posList.length === 0 ? (
          <div className="text-center text-muted py-8 text-sm">
            Aucune position pour l’instant.
            <br />
            Achete ton premier actif !
          </div>
        ) : (
          posList.map((p) => {
            const cp = prices[p.symbol] ?? p.avgPrice
            const pnl = (cp - p.avgPrice) * p.qty
            return (
              <div
                key={p.symbol}
                onClick={() => setSelectedSymbol(p.symbol)}
                className="flex items-center justify-between bg-panel/60 rounded-2xl px-3 py-2 mb-2 border border-border cursor-pointer hover:border-accent/40 transition"
              >
                <div>
                  <div className="font-bold text-sm">{p.symbol}</div>
                  <div className="text-[10px] text-muted">
                    {fmtQty(p.qty)} × {fmtPrice(p.avgPrice)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="num text-sm font-bold">{fmtPrice(cp)}</div>
                  <div className={`num text-xs font-bold ${pnl >= 0 ? 'text-emerald' : 'text-red'}`}>
                    {pnl >= 0 ? '▲' : '▼'} {fmtMoney(pnl)}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
      <div className="px-4 py-2 border-t border-border text-xs text-muted flex justify-between">
        <span>Performance globale</span>
        <span className={equity - initial >= 0 ? 'text-emerald font-bold' : 'text-red font-bold'}>
          {equity - initial >= 0 ? '▲' : '▼'}{' '}
          {((equity - initial) / initial * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  )
}
