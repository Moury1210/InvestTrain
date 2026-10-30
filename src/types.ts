// src/types.ts
export type AssetType = 'stock' | 'crypto'

export interface Asset {
  symbol: string
  name: string
  type: AssetType
  basePrice: number
  sector?: string
}

export interface Candle {
  time: number // unix seconds
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type Timeframe = '1m' | '5m' | '15m' | '1H' | '4H' | '1D'

export interface TimeframeConfig {
  label: Timeframe
  minutes: number
  seconds: number
}

export const TIMEFRAMES: TimeframeConfig[] = [
  { label: '1m', minutes: 1, seconds: 60 },
  { label: '5m', minutes: 5, seconds: 300 },
  { label: '15m', minutes: 15, seconds: 900 },
  { label: '1H', minutes: 60, seconds: 3600 },
  { label: '4H', minutes: 240, seconds: 14400 },
  { label: '1D', minutes: 1440, seconds: 86400 },
]

export interface Position {
  symbol: string
  qty: number
  avgPrice: number
}

export interface Trade {
  id: string
  time: number
  symbol: string
  side: 'buy' | 'sell'
  qty: number
  price: number
  total: number
  realizedPnl?: number
}

export type OrderSide = 'buy' | 'sell'
export type OrderType = 'market' | 'limit'

export interface PendingOrder {
  id: string
  symbol: string
  side: OrderSide
  type: OrderType
  qty: number
  limitPrice?: number
  createdAt: number
}

export interface OrderBookLevel {
  price: number
  size: number
  total: number
}

export interface OrderBook {
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
}

export interface MarketState {
  price: number
  trend: number // -1..1
  volatility: number
  momentum: number
}
