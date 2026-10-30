// src/lib/assets.ts
import type { Asset } from '../types'

export const ASSETS: Asset[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', basePrice: 198.5, sector: 'Tech' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock', basePrice: 420.1, sector: 'Tech' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock', basePrice: 925.3, sector: 'Semis' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', basePrice: 248.7, sector: 'Auto' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', basePrice: 182.4, sector: 'Retail' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', basePrice: 168.2, sector: 'Tech' },
  { symbol: 'META', name: 'Meta Platforms', type: 'stock', basePrice: 512.9, sector: 'Tech' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', basePrice: 67420.0, sector: 'Crypto' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', basePrice: 3520.0, sector: 'Crypto' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto', basePrice: 148.6, sector: 'Crypto' },
  { symbol: 'BNB', name: 'BNB', type: 'crypto', basePrice: 598.4, sector: 'Crypto' },
  { symbol: 'XRP', name: 'Ripple', type: 'crypto', basePrice: 0.62, sector: 'Crypto' },
]

export const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'BTC', 'ETH']

export function getAsset(symbol: string): Asset | undefined {
  return ASSETS.find((a) => a.symbol === symbol)
}
