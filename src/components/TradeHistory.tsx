// src/components/TradeHistory.tsx
import { useState } from 'react'
import { useStore } from '../store/useStore'
import { fmtMoney, fmtPrice, fmtQty } from '../lib/format'
import { X } from 'lucide-react'

export default function TradeHistory() {
  const [tab, setTab] = useState<'trades' | 'orders'>('trades')
  const trades = useStore((s) => s.trades)
  const pendingOrders = useStore((s) => s.pendingOrders)
  const cancelOrder = useStore((s) => s.cancelOrder)
  const prices = useStore((s) => s.prices)

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab('trades')}
          className={`flex-1 px-3 py-2.5 text-xs font-bold transition ${
            tab === 'trades' ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-muted'
          }`}
        >
          Historique ({trades.length})
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`flex-1 px-3 py-2.5 text-xs font-bold transition ${
            tab === 'orders' ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-muted'
          }`}
        >
          En attente ({pendingOrders.length})
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tab === 'trades' ? (
          trades.length === 0 ? (
            <div className="text-center text-muted py-8 text-sm">
              Pas encore de trades. Lance-toi !
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {trades.slice(0, 30).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between bg-panel/60 rounded-2xl px-3 py-2 border border-border"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${t.side === 'buy' ? 'bg-emerald/15 text-emerald' : 'bg-red/15 text-red'}`}>
                      {t.side === 'buy' ? 'ACHAT' : 'VENTE'}
                    </span>
                    <div>
                      <div className="font-bold text-xs">
                        {t.side === 'buy' ? 'Achat' : 'Vente'} {t.symbol}
                      </div>
                      <div className="text-[10px] text-muted">
                        {new Date(t.time * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · {fmtQty(t.qty)} à {fmtPrice(t.price)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="num text-xs font-bold">{fmtMoney(t.total)}</div>
                    {t.realizedPnl !== undefined && (
                      <div className={`num text-[10px] font-bold ${t.realizedPnl >= 0 ? 'text-emerald' : 'text-red'}`}>
                        {t.realizedPnl >= 0 ? '▲' : '▼'} {fmtMoney(t.realizedPnl)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : pendingOrders.length === 0 ? (
          <div className="text-center text-muted py-8 text-sm">Aucun ordre en attente.</div>
        ) : (
          <div className="p-2 space-y-2">
            {pendingOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between bg-panel/60 rounded-2xl px-3 py-2 border border-border"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${o.side === 'buy' ? 'bg-emerald/15 text-emerald' : 'bg-red/15 text-red'}`}>
                    {o.side === 'buy' ? 'ACHAT' : 'VENTE'}
                  </span>
                  <div>
                    <div className="font-bold text-xs">
                      {o.side === 'buy' ? 'Achat' : 'Vente'} {o.symbol}
                    </div>
                    <div className="text-[10px] text-muted">
                      Limite {fmtPrice(o.limitPrice ?? 0)} · marché {fmtPrice(prices[o.symbol])}
                    </div>
                  </div>
                </div>
                <button onClick={() => cancelOrder(o.id)} className="text-dim hover:text-red">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
