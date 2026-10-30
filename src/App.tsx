// src/App.tsx
import { useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import TopBar from './components/TopBar'
import Watchlist from './components/Watchlist'
import ChartPanel from './components/ChartPanel'
import OrderForm from './components/OrderForm'
import Portfolio from './components/Portfolio'
import TradeHistory from './components/TradeHistory'
import AdBanner from './components/AdBanner'

export default function App() {
  const [showHistory, setShowHistory] = useState(true)
  const theme = useStore((s) => s.theme)
  const running = useStore((s) => s.running)
  const speed = useStore((s) => s.speed)
  const tick = useStore((s) => s.tick)
  const start = useStore((s) => s.start)

  useEffect(() => {
    start()
  }, [start])

  useEffect(() => {
    if (!running) return
    const interval = Math.max(250, Math.round(1500 / speed))
    const id = setInterval(() => tick(), interval)
    return () => clearInterval(id)
  }, [running, tick, speed])

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="min-h-screen w-full bg-bg text-text">
      <TopBar />
      <div className="px-3 py-2 border-b border-border bg-bg-soft/40">
        <AdBanner className="h-24 md:h-28" label="Banniere publicitaire (728x90)" />
      </div>

      <div className="max-w-7xl mx-auto px-3 py-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-3">
          <div className="sticky top-4 space-y-4">
            <div className="h-[600px] border border-border rounded-2xl overflow-hidden bg-bg-soft/40">
              <Watchlist />
            </div>
            <AdBanner className="h-64" label="Encart publicitaire (300x250)" />
          </div>
        </div>

        <div className="col-span-12 md:col-span-9 space-y-4">
          <div className="h-[460px] border border-border rounded-2xl overflow-hidden bg-bg-soft/40">
            <ChartPanel />
          </div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-5">
              <div className="h-[420px] border border-border rounded-2xl overflow-hidden bg-bg-soft/40">
                <OrderForm />
              </div>
            </div>
            <div className="col-span-12 md:col-span-7">
              <div className="h-[420px] border border-border rounded-2xl overflow-hidden bg-bg-soft/40">
                <Portfolio />
              </div>
            </div>
          </div>
          <AdBanner className="h-28" label="Banniere publicitaire (728x90)" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 pb-4">
        <div className="h-[400px] border border-border rounded-2xl overflow-hidden bg-bg-soft/40">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-bg-soft/60">
            <span className="text-xs font-semibold text-muted">Historique des trades</span>
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="text-xs font-semibold px-3 py-1 rounded-xl border border-border hover:bg-panel transition"
            >
              {showHistory ? 'Masquer' : 'Afficher'}
            </button>
          </div>
          {showHistory && <TradeHistory />}
        </div>
      </div>

      <div className="px-3 py-2 border-t border-border bg-bg-soft/40">
        <AdBanner className="h-24 md:h-28" label="Banniere publicitaire (728x90)" />
      </div>

      <div className="md:hidden px-3 py-2 border-t border-border bg-bg-soft flex items-center gap-2 overflow-x-auto scrollbar-thin">
        {useStore.getState().watchlist.map((sym) => (
          <button
            key={sym}
            onClick={() => useStore.getState().setSelectedSymbol(sym)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border font-bold ${
              useStore.getState().selectedSymbol === sym
                ? 'bg-gradient-to-r from-accent to-fun text-bg border-transparent'
                : 'border-border text-muted'
            }`}
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  )
}
