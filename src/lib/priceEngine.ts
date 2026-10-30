// src/lib/priceEngine.ts
import type { Candle, MarketState } from '../types'

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function createInitialState(basePrice: number): MarketState {
  return {
    price: basePrice,
    trend: (Math.random() - 0.5) * 0.6,
    volatility: 0.008 + Math.random() * 0.012,
    momentum: 0,
  }
}

function baseVolume(price: number, type: 'stock' | 'crypto' = 'stock'): number {
  const scale = type === 'crypto' ? 40 : 1
  return (50000 + Math.random() * 100000) * scale * (100 / Math.max(price, 1))
}

export function stepCandle(
  prev: Candle,
  state: MarketState,
  basePrice: number,
  assetType: 'stock' | 'crypto' = 'stock',
): { candle: Candle; state: MarketState } {
  const s: MarketState = { ...state }

  // Slowly evolve trend (regime persistence)
  s.trend += (Math.random() - 0.5) * 0.06
  s.trend = clamp(s.trend, -1, 1)

  // Volatility clustering
  s.volatility += (Math.random() - 0.5) * 0.003
  s.volatility = clamp(s.volatility, 0.002, 0.06)

  // Mean reversion toward base price
  const reversion = ((basePrice - prev.close) / basePrice) * 0.015

  // Occasional gap at open
  let open = prev.close
  if (Math.random() < 0.04) {
    const gapPct = (Math.random() - 0.5) * s.volatility * 2.5
    open = prev.close * (1 + gapPct)
    if (open <= 0) open = prev.close
  }

  // Drift + shock
  const shock = (Math.random() + Math.random() + Math.random()) / 3 - 0.5 // triangular-ish
  const drift = s.trend * s.volatility * 0.6 + reversion
  const change = drift + shock * s.volatility * 1.8
  let close = open * (1 + change)
  if (close <= 0.0001) close = open * 0.99

  // High / low
  const wick = Math.random() * s.volatility * open * (0.4 + Math.random() * 0.8)
  const high = Math.max(open, close) + wick * (0.3 + Math.random() * 0.7)
  const low = Math.min(open, close) - wick * (0.3 + Math.random() * 0.7)
  if (low <= 0) {
    // fix
  }

  const safeLow = Math.max(0.0001, low)
  const safeHigh = Math.max(high, Math.max(open, close))

  const volume = Math.round(
    baseVolume(open, assetType) * (1 + Math.abs(change) * 12 + Math.random() * 0.6),
  )

  const candle: Candle = {
    time: prev.time + 60,
    open: +open.toFixed(priceDecimals(open)),
    high: +safeHigh.toFixed(priceDecimals(open)),
    low: +safeLow.toFixed(priceDecimals(open)),
    close: +close.toFixed(priceDecimals(open)),
    volume,
  }

  s.price = candle.close
  s.momentum = change
  return { candle, state: s }
}

function priceDecimals(price: number): number {
  if (price >= 1000) return 2
  if (price >= 1) return 2
  if (price >= 0.01) return 4
  return 6
}

export function generateInitial(
  basePrice: number,
  count: number,
  assetType: 'stock' | 'crypto' = 'stock',
  startTime?: number,
): { candles: Candle[]; state: MarketState } {
  const state = createInitialState(basePrice)
  const candles: Candle[] = []
  const t0 = startTime ?? Math.floor(Date.now() / 1000) - count * 60
  let prev: Candle = {
    time: t0,
    open: basePrice,
    high: basePrice,
    low: basePrice,
    close: basePrice,
    volume: 0,
  }
  candles.push(prev)
  let curState = state
  for (let i = 1; i < count; i++) {
    const { candle, state: ns } = stepCandle(prev, curState, basePrice, assetType)
    candle.time = t0 + i * 60
    candles.push(candle)
    prev = candle
    curState = ns
  }
  // fix first time
  candles[0].time = t0
  return { candles, state: curState }
}
