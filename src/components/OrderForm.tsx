// src/components/OrderForm.tsx
import { useState } from 'react'
import confetti from 'canvas-confetti'
import { useStore } from '../store/useStore'
import { fmtMoney, fmtPrice, fmtQty } from '../lib/format'

export default function OrderForm() {
  const selectedSymbol = useStore((s) => s.selectedSymbol)
  const prices = useStore((s) => s.prices)
  const capital = useStore((s) => s.capital)
  const positions = useStore((s) => s.positions)
  const buy = useStore((s) => s.buy)
  const sell = useStore((s) => s.sell)

  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [qty, setQty] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok')

  const price = prices[selectedSymbol]
  const pos = positions[selectedSymbol]
  const maxBuyQty = price ? capital / price : 0
  const maxSellQty = pos?.qty ?? 0

  const fireConfetti = (big = false) => {
    confetti({
      particleCount: big ? 120 : 60,
      spread: big ? 90 : 60,
      origin: { y: 0.7 },
      colors: ['#22D3EE', '#F472B6', '#34D399', '#FBBF24'],
    })
  }

  const handleQtyPct = (pct: number) => {
    const base = side === 'buy' ? maxBuyQty : maxSellQty
    setQty((base * pct).toFixed(4))
  }

  const submit = (qOverride?: number) => {
    setMsg(null)
    const q = qOverride ?? parseFloat(qty)
    if (!q || q <= 0) {
      setMsg('Entre une quantite valide')
      setMsgType('err')
      return
    }
    const err =
      side === 'buy'
        ? buy(selectedSymbol, q, 'market')
        : sell(selectedSymbol, q, 'market')
    if (err) {
      setMsg(err)
      setMsgType('err')
    } else {
      const profit = side === 'sell' && pos ? (price! - pos.avgPrice) * q : 0
      if (side === 'sell' && profit > 0) {
        setMsg('Bravo ! Tu as gagne de l argent !')
        fireConfetti(true)
      } else if (side === 'buy') {
        setMsg('Achat reussi !')
        fireConfetti(false)
      } else {
        setMsg('Vente effectuee')
        fireConfetti(false)
      }
      setMsgType('ok')
      setQty('')
    }
  }

  const estimated = price ? (parseFloat(qty) || 0) * price : 0

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex rounded-2xl overflow-hidden border border-border bg-panel">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 py-3 text-sm font-bold transition ${
            side === 'buy'
              ? 'bg-gradient-to-r from-emerald to-accent text-bg'
              : 'text-muted hover:text-text'
          }`}
        >
          Acheter
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 py-3 text-sm font-bold transition ${
            side === 'sell'
              ? 'bg-gradient-to-r from-red to-fun text-white'
              : 'text-muted hover:text-text'
          }`}
        >
          Vendre
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted font-semibold">Quantité</label>
          <span className="text-xs text-dim">
            Max : {fmtQty(side === 'buy' ? maxBuyQty : maxSellQty)}
          </span>
        </div>
        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="0"
          className="w-full mt-1.5 bg-panel border border-border rounded-2xl px-4 py-3 text-lg num focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
        />
        <div className="flex gap-1.5 mt-2">
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <button
              key={p}
              onClick={() => handleQtyPct(p)}
              className="flex-1 py-1.5 text-xs rounded-xl border border-border text-muted hover:text-text hover:bg-panel transition font-semibold"
            >
              {p * 100}%
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm bg-panel/60 rounded-2xl px-3 py-2">
        <span className="text-muted">Prix actuel</span>
        <span className="num font-bold">{fmtPrice(price ?? 0)}</span>
      </div>
      <div className="flex items-center justify-between text-sm bg-panel/60 rounded-2xl px-3 py-2">
        <span className="text-muted">Total</span>
        <span className="num font-bold text-accent">{fmtMoney(estimated)}</span>
      </div>

      {pos && (
        <div className="text-xs text-dim bg-panel/40 rounded-2xl px-3 py-2">
          Tu possèdes {fmtQty(pos.qty)} à {fmtPrice(pos.avgPrice)} ·{' '}
          <span className={(price! - pos.avgPrice) * pos.qty >= 0 ? 'text-emerald' : 'text-red'}>
            {(price! - pos.avgPrice) * pos.qty >= 0 ? '▲' : '▼'}{' '}
            {fmtMoney((price! - pos.avgPrice) * pos.qty)}
          </span>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2">
        {side === 'buy' ? (
          <>
            <button
              onClick={() => submit(maxBuyQty > 0 ? Math.max(0.0001, Math.floor(maxBuyQty * 0.1 * 1e4) / 1e4) : 0)}
              className="py-2 rounded-xl border border-border text-xs font-semibold hover:bg-panel transition"
            >
              Achat rapide
            </button>
            <button
              onClick={() => submit(maxBuyQty)}
              className="py-2 rounded-xl border border-border text-xs font-semibold hover:bg-panel transition"
            >
              Tout investir
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => submit(maxSellQty * 0.5)}
              className="py-2 rounded-xl border border-border text-xs font-semibold hover:bg-panel transition"
            >
              Vendre 50%
            </button>
            <button
              onClick={() => submit(maxSellQty)}
              className="py-2 rounded-xl border border-border text-xs font-semibold hover:bg-panel transition"
            >
              Tout vendre
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => submit()}
        className={`w-full py-3.5 rounded-2xl font-bold text-base transition shadow-lg ${
          side === 'buy'
            ? 'bg-gradient-to-r from-emerald to-accent text-bg hover:opacity-90'
            : 'bg-gradient-to-r from-red to-fun text-white hover:opacity-90'
        }`}
      >
        {side === 'buy' ? 'Acheter' : 'Vendre'} {selectedSymbol}
      </button>

      {msg && (
        <div
          className={`text-sm text-center py-2 rounded-2xl bounce-in ${
            msgType === 'ok' ? 'text-emerald bg-emerald/15' : 'text-red bg-red/15'
          }`}
        >
          {msg}
        </div>
      )}
    </div>
  )
}
