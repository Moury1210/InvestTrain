// src/components/ChartPanel.tsx
import { useEffect, useRef } from 'react'
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
} from 'lightweight-charts'
import { useStore } from '../store/useStore'
import { aggregateCandles } from '../lib/aggregate'
import { TIMEFRAMES } from '../types'
import { fmtPrice } from '../lib/format'

export default function ChartPanel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)

  const selectedSymbol = useStore((s) => s.selectedSymbol)
  const selectedTimeframe = useStore((s) => s.selectedTimeframe)
  const candles = useStore((s) => s.candles[selectedSymbol])
  const prices = useStore((s) => s.prices)
  const theme = useStore((s) => s.theme)

  // Create chart once
  useEffect(() => {
    if (!containerRef.current) return
    const isDark = theme === 'dark'
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDark ? '#9CA3AF' : '#4B5563',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: isDark ? '#1F2937' : '#E5E7EB' },
        horzLines: { color: isDark ? '#1F2937' : '#E5E7EB' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: isDark ? '#1F2937' : '#E5E7EB', scaleMargins: { top: 0.08, bottom: 0.22 } },
      timeScale: { borderColor: isDark ? '#1F2937' : '#E5E7EB', timeVisible: true, secondsVisible: false },
      handleScroll: true,
      handleScale: true,
    })
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    })
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#263041',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }
    const ro = new ResizeObserver(handleResize)
    ro.observe(containerRef.current)
    handleResize()

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
    }
  }, [theme])

  // Update data
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !candles) return
    const cfg = TIMEFRAMES.find((t) => t.label === selectedTimeframe)!
    const agg = aggregateCandles(candles, cfg.seconds)
    const candleData = agg.map((c) => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }))
    const volumeData = agg.map((c) => ({
      time: c.time as any,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)',
    }))
    candleSeriesRef.current.setData(candleData)
    volumeSeriesRef.current.setData(volumeData)
    chartRef.current?.timeScale().scrollToRealTime()
  }, [candles, selectedTimeframe, selectedSymbol, theme])

  const price = prices[selectedSymbol]
  const asset = useStore((s) => s.assets.find((a) => a.symbol === selectedSymbol))
  const candlesArr = useStore((s) => s.candles[selectedSymbol])
  const prev = candlesArr && candlesArr.length > 1 ? candlesArr[candlesArr.length - 2].close : price
  const up = (price ?? 0) >= (prev ?? 0)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-panel/40 to-transparent">
        <div className="flex items-center gap-3">
          <span className={`text-2xl ${up ? 'text-emerald' : 'text-red'}`}>{up ? '▲' : '▼'}</span>
          <div>
            <div className="font-display font-bold text-xl">{selectedSymbol}</div>
            <div className="text-xs text-muted">{asset?.name}</div>
          </div>
          <div className={`num text-2xl font-bold ml-2 ${up ? 'text-emerald' : 'text-red'}`}>
            {fmtPrice(price ?? 0)}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.label}
              onClick={() => useStore.getState().setTimeframe(tf.label)}
              className={`px-3 py-1.5 text-xs rounded-xl font-bold transition ${
                selectedTimeframe === tf.label
                  ? 'bg-gradient-to-r from-accent to-fun text-bg shadow-md'
                  : 'text-muted hover:text-text hover:bg-panel border border-border'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="flex-1 min-h-0" />
    </div>
  )
}
