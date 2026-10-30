// src/store/useStore.ts
import { create } from 'zustand'
import type { Asset, Candle, MarketState, PendingOrder, Position, Timeframe, Trade } from '../types'
import { ASSETS } from '../lib/assets'
import { generateInitial, stepCandle } from '../lib/priceEngine'
import { generateOrderBook } from '../lib/orderBook'
import { aggregateCandles } from '../lib/aggregate'
import { TIMEFRAMES } from '../types'

const INITIAL_CAPITAL = 10000
const BASE_COUNT = 5000

interface StoreState {
  theme: 'dark' | 'light'
  toggleTheme: () => void

  assets: Asset[]
  prices: Record<string, number>
  candles: Record<string, Candle[]>
  marketState: Record<string, MarketState>

  selectedSymbol: string
  selectedTimeframe: Timeframe
  watchlist: string[]

  capital: number
  initialCapital: number
  positions: Record<string, Position>
  trades: Trade[]
  pendingOrders: PendingOrder[]

  running: boolean
  speed: number
  setSpeed: (n: number) => void

  setSelectedSymbol: (s: string) => void
  setTimeframe: (t: Timeframe) => void
  addToWatchlist: (s: string) => void
  removeFromWatchlist: (s: string) => void

  buy: (symbol: string, qty: number, type: 'market' | 'limit', limitPrice?: number) => string | null
  sell: (symbol: string, qty: number, type: 'market' | 'limit', limitPrice?: number) => string | null
  cancelOrder: (id: string) => void
  resetAccount: () => void

  tick: () => void
  start: () => void
  stop: () => void

  getOrderBook: (symbol: string) => ReturnType<typeof generateOrderBook>
  getAggregatedCandles: (symbol: string, tf: Timeframe) => Candle[]
  getEquity: () => number
  getUnrealizedPnl: () => number
  getRealizedPnl: () => number
  getTodayPnl: () => number
}

function initMarket() {
  const prices: Record<string, number> = {}
  const candles: Record<string, Candle[]> = {}
  const marketState: Record<string, MarketState> = {}
  for (const a of ASSETS) {
    const { candles: cs, state } = generateInitial(a.basePrice, BASE_COUNT, a.type)
    candles[a.symbol] = cs
    marketState[a.symbol] = state
    prices[a.symbol] = cs[cs.length - 1].close
  }
  return { prices, candles, marketState }
}

const initial = initMarket()

export const useStore = create<StoreState>((set, get) => ({
  theme: 'dark',
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

  assets: ASSETS,
  prices: initial.prices,
  candles: initial.candles,
  marketState: initial.marketState,

  selectedSymbol: 'AAPL',
  selectedTimeframe: '1m',
  watchlist: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'BTC', 'ETH'],

  capital: INITIAL_CAPITAL,
  initialCapital: INITIAL_CAPITAL,
  positions: {},
  trades: [],
  pendingOrders: [],

  running: false,
  speed: 1,
  setSpeed: (n) => set({ speed: n }),

  setSelectedSymbol: (s) => set({ selectedSymbol: s }),
  setTimeframe: (t) => set({ selectedTimeframe: t }),
  addToWatchlist: (s) =>
    set((st) => (st.watchlist.includes(s) ? st : { watchlist: [...st.watchlist, s] })),
  removeFromWatchlist: (s) =>
    set((st) => ({ watchlist: st.watchlist.filter((x) => x !== s) })),

  buy: (symbol, qty, type, limitPrice) => {
    if (qty <= 0) return 'Quantité invalide'
    const id = 'ord_' + Math.random().toString(36).slice(2, 10)
    if (type === 'market') {
      const price = get().prices[symbol]
      const cost = price * qty
      if (cost > get().capital) return 'Capital insuffisant'
      set((st) => {
        const pos = st.positions[symbol]
        const newQty = (pos?.qty ?? 0) + qty
        const newAvg = pos
          ? (pos.avgPrice * pos.qty + price * qty) / newQty
          : price
        const trade: Trade = {
          id,
          time: Math.floor(Date.now() / 1000),
          symbol,
          side: 'buy',
          qty,
          price,
          total: cost,
        }
        return {
          capital: st.capital - cost,
          positions: { ...st.positions, [symbol]: { symbol, qty: newQty, avgPrice: newAvg } },
          trades: [trade, ...st.trades].slice(0, 500),
        }
      })
      return null
    }
    // limit
    const order: PendingOrder = {
      id,
      symbol,
      side: 'buy',
      type: 'limit',
      qty,
      limitPrice,
      createdAt: Math.floor(Date.now() / 1000),
    }
    set((st) => ({ pendingOrders: [order, ...st.pendingOrders] }))
    return null
  },

  sell: (symbol, qty, type, limitPrice) => {
    if (qty <= 0) return 'Quantité invalide'
    const pos = get().positions[symbol]
    if (!pos || pos.qty < qty) return 'Position insuffisante'
    const id = 'ord_' + Math.random().toString(36).slice(2, 10)
    if (type === 'market') {
      const price = get().prices[symbol]
      const proceeds = price * qty
      const realized = (price - pos.avgPrice) * qty
      set((st) => {
        const p = st.positions[symbol]!
        const newQty = p.qty - qty
        const positions = { ...st.positions }
        if (newQty <= 1e-9) delete positions[symbol]
        else positions[symbol] = { ...p, qty: newQty }
        const trade: Trade = {
          id,
          time: Math.floor(Date.now() / 1000),
          symbol,
          side: 'sell',
          qty,
          price,
          total: proceeds,
          realizedPnl: realized,
        }
        return {
          capital: st.capital + proceeds,
          positions,
          trades: [trade, ...st.trades].slice(0, 500),
        }
      })
      return null
    }
    const order: PendingOrder = {
      id,
      symbol,
      side: 'sell',
      type: 'limit',
      qty,
      limitPrice,
      createdAt: Math.floor(Date.now() / 1000),
    }
    set((st) => ({ pendingOrders: [order, ...st.pendingOrders] }))
    return null
  },

  cancelOrder: (id) => set((st) => ({ pendingOrders: st.pendingOrders.filter((o) => o.id !== id) })),

  resetAccount: () => {
    const fresh = initMarket()
    set({
      prices: fresh.prices,
      candles: fresh.candles,
      marketState: fresh.marketState,
      capital: INITIAL_CAPITAL,
      initialCapital: INITIAL_CAPITAL,
      positions: {},
      trades: [],
      pendingOrders: [],
    })
  },

  tick: () => {
    const st = get()
    const newPrices = { ...st.prices }
    const newCandles = { ...st.candles }
    const newMarketState = { ...st.marketState }

    for (const a of st.assets) {
      const sym = a.symbol
      const cs = st.candles[sym]
      const last = cs[cs.length - 1]
      const ms = st.marketState[sym]
      const { candle, state: ns } = stepCandle(last, ms, a.basePrice, a.type)
      newCandles[sym] = [...cs, candle].slice(-5000)
      newMarketState[sym] = ns
      newPrices[sym] = candle.close
    }

    // Check pending orders
    const remaining: PendingOrder[] = []
    let capital = st.capital
    const positions = { ...st.positions }
    const trades = [...st.trades]
    for (const o of st.pendingOrders) {
      const price = newPrices[o.symbol]
      let execute = false
      if (o.side === 'buy') {
        if (o.limitPrice !== undefined && price <= o.limitPrice) execute = true
      } else {
        if (o.limitPrice !== undefined && price >= o.limitPrice) execute = true
      }
      if (execute) {
        if (o.side === 'buy') {
          const cost = price * o.qty
          if (cost <= capital) {
            capital -= cost
            const pos = positions[o.symbol]
            const newQty = (pos?.qty ?? 0) + o.qty
            const newAvg = pos ? (pos.avgPrice * pos.qty + price * o.qty) / newQty : price
            positions[o.symbol] = { symbol: o.symbol, qty: newQty, avgPrice: newAvg }
            trades.unshift({
              id: o.id,
              time: Math.floor(Date.now() / 1000),
              symbol: o.symbol,
              side: 'buy',
              qty: o.qty,
              price,
              total: cost,
            })
          } else {
            remaining.push(o)
          }
        } else {
          const pos = positions[o.symbol]
          if (pos && pos.qty >= o.qty) {
            const proceeds = price * o.qty
            const realized = (price - pos.avgPrice) * o.qty
            capital += proceeds
            const newQty = pos.qty - o.qty
            if (newQty <= 1e-9) delete positions[o.symbol]
            else positions[o.symbol] = { ...pos, qty: newQty }
            trades.unshift({
              id: o.id,
              time: Math.floor(Date.now() / 1000),
              symbol: o.symbol,
              side: 'sell',
              qty: o.qty,
              price,
              total: proceeds,
              realizedPnl: realized,
            })
          } else {
            remaining.push(o)
          }
        }
      } else {
        remaining.push(o)
      }
    }

    set({
      prices: newPrices,
      candles: newCandles,
      marketState: newMarketState,
      capital,
      positions,
      trades: trades.slice(0, 500),
      pendingOrders: remaining,
    })
  },

  start: () => set({ running: true }),
  stop: () => set({ running: false }),

  getOrderBook: (symbol) => generateOrderBook(get().prices[symbol] ?? 0),

  getAggregatedCandles: (symbol, tf) => {
    const cfg = TIMEFRAMES.find((t) => t.label === tf)!
    return aggregateCandles(get().candles[symbol] ?? [], cfg.seconds)
  },

  getEquity: () => {
    const st = get()
    let val = st.capital
    for (const sym of Object.keys(st.positions)) {
      val += (st.prices[sym] ?? 0) * st.positions[sym].qty
    }
    return val
  },

  getUnrealizedPnl: () => {
    const st = get()
    let pnl = 0
    for (const sym of Object.keys(st.positions)) {
      const p = st.positions[sym]
      pnl += ((st.prices[sym] ?? p.avgPrice) - p.avgPrice) * p.qty
    }
    return pnl
  },

  getRealizedPnl: () => {
    return get().trades.reduce((acc, t) => acc + (t.realizedPnl ?? 0), 0)
  },

  getTodayPnl: () => {
    const st = get()
    return st.getEquity() - st.initialCapital
  },
}))
