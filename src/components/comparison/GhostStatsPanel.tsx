import type { AircraftSpec } from '@/types/aircraft'
import { useUnits } from '@/hooks/useUnits'

interface GhostStatsPanelProps {
  ghostSpec: AircraftSpec
}

export function GhostStatsPanel({ ghostSpec }: GhostStatsPanelProps) {
  const { formatValue } = useUnits()

  const stats = [
    { label: 'Length', value: ghostSpec.length },
    { label: 'Height', value: ghostSpec.height },
    { label: 'Wingspan', value: ghostSpec.wingspan },
    { label: 'Wing Area', value: ghostSpec.wingArea, decimals: 0 },
    { label: 'MTOW', value: ghostSpec.mtow, decimals: 0 },
    { label: 'Range', value: ghostSpec.range, decimals: 0 },
    { label: 'Thrust / Eng', value: ghostSpec.thrustPerEngine, decimals: 0 },
    { label: 'Total Thrust', value: ghostSpec.totalThrust, decimals: 0 },
  ]

  const textStats = [
    { label: 'Engines', value: String(ghostSpec.engines) },
    { label: 'Cruise', value: ghostSpec.cruiseSpeed },
    { label: 'Capacity', value: ghostSpec.capacity || '—' },
  ]

  // Row style matching StatsPanel exactly — same height as value+bar rows
  const row = 'flex items-center justify-between px-3 sm:px-5 py-1 sm:py-1.5 min-h-[38px] hover:bg-muted/30 transition-colors'

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header — match StatsPanel selector row */}
      <div className="flex items-center justify-center px-3 py-2 border-b border-border/40 bg-muted/20 min-h-[40px]">
        <span className="text-sm font-semibold text-purple-500 truncate">
          {ghostSpec.name}
        </span>
        <span className="ml-2 text-[9px] font-semibold text-purple-500/50 uppercase tracking-wider">ref</span>
      </div>

      {/* Spacer — match StatsPanel tally row */}
      <div className="flex items-center justify-center py-1.5 border-b border-border/40 bg-muted/10 min-h-[40px]">
        <span className="text-[9px] font-semibold text-muted-foreground/30 uppercase tracking-[0.2em]">reference</span>
      </div>

      {/* Stat rows */}
      <div className="divide-y divide-border/40">
        {stats.map((stat) => (
          <div key={stat.label} className={row}>
            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest leading-none">
              {stat.label}
            </span>
            <span className="text-xs sm:text-sm font-mono tabular-nums font-medium tracking-tight text-purple-500">
              {formatValue(stat.value, stat.decimals ?? 1)}
            </span>
          </div>
        ))}
      </div>

      {/* Text stats */}
      <div className="divide-y divide-border/40 border-t border-border/40">
        {textStats.map((stat) => (
          <div key={stat.label} className={row}>
            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest leading-none">
              {stat.label}
            </span>
            <span className="text-xs sm:text-sm font-mono tabular-nums font-medium tracking-tight text-purple-500">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
