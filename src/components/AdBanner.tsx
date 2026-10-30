// src/components/AdBanner.tsx
import { Megaphone } from 'lucide-react'

type Props = {
  label?: string
  className?: string
}

export default function AdBanner({ label = 'Espace publicitaire', className = '' }: Props) {
  return (
    <div
      className={`flex items-center justify-center gap-2 border border-dashed border-border/70 bg-panel/40 text-muted text-xs font-semibold uppercase tracking-wider rounded-xl ${className}`}
    >
      <Megaphone className="w-3.5 h-3.5" />
      {label}
    </div>
  )
}
