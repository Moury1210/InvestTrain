// src/components/TopBar.tsx
import { useStore } from '../store/useStore'
import { fmtMoney } from '../lib/format'
import { RotateCcw, Sparkles, Trophy } from 'lucide-react'

export default function TopBar() {
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const resetAccount = useStore((s) => s.resetAccount)
  const speed = useStore((s) => s.speed)
  const setSpeed = useStore((s) => s.setSpeed)
  const equity = useStore((s) => s.getEquity())
  const todayPnl = useStore((s) => s.getTodayPnl())
  const initial = useStore((s) => s.initialCapital)
  const trades = useStore((s) => s.trades)

  const pnlPct = ((equity - initial) / initial) * 100
  const happy = todayPnl >= 0

  return (
    <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-panel via-bg-soft to-panel">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fun to-accent flex items-center justify-center shadow-lg">
          <span className="font-display font-bold text-bg text-lg">IT</span>
        </div>
        <div>
          <div className="font-display font-bold text-base tracking-tight flex items-center gap-2">
            Invest Trainer <Sparkles className="w-4 h-4 text-amber" />
          </div>
          <div className="text-[11px] text-muted">Joue a la bourse, sans risque !</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-4 text-sm">
          <div className="bg-panel/60 rounded-2xl px-3 py-1.5 border border-border">
            <div className="text-[10px] text-muted uppercase tracking-wider">Mon argent</div>
            <div className="num font-bold text-emerald">{fmtMoney(equity)}</div>
          </div>
          <div className="bg-panel/60 rounded-2xl px-3 py-1.5 border border-border">
            <div className="text-[10px] text-muted uppercase tracking-wider">Aujourd'hui</div>
            <div className={`num font-bold ${happy ? 'text-emerald' : 'text-red'}`}>
              {happy ? '+' : '-'} {fmtMoney(todayPnl)} ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%)
            </div>
          </div>
          <div className="bg-panel/60 rounded-2xl px-3 py-1.5 border border-border">
            <div className="text-[10px] text-muted uppercase tracking-wider">Trades</div>
            <div className="num font-bold text-accent flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> {trades.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-panel/60 rounded-2xl border border-border px-2 py-1">
            <span className="text-[10px] text-muted uppercase tracking-wider mr-1">Vitesse</span>
            {[1, 2, 5, 10].map((v) => (
              <button
                key={v}
                onClick={() => setSpeed(v)}
                className={`px-2 py-1 rounded-xl text-xs font-bold transition ${
                  speed === v
                    ? 'bg-gradient-to-r from-accent to-fun text-bg'
                    : 'text-muted hover:text-text'
                }`}
              >
                {v}x
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (confirm('Recommencer a zero ?')) resetAccount()
            }}
            className="px-3 py-2 rounded-2xl border border-border bg-panel hover:bg-panel-2 transition text-muted hover:text-text text-sm"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="px-3 py-2 rounded-2xl border border-border bg-panel hover:bg-panel-2 transition text-muted hover:text-text text-sm"
          >
            {theme === 'dark' ? 'Clair' : 'Sombre'}
          </button>
        </div>
      </div>
    </header>
  )
}
