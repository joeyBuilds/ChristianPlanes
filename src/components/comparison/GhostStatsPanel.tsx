import type { AircraftSpec } from '@/types/aircraft'
import { useUnits } from '@/hooks/useUnits'
import { useFleetPulse } from '@/hooks/useFleetPulse'
import { FleetPulseBadge } from './FleetPulseBadge'
import { getTypeRating } from '@/data/type-ratings'
import { GhostSelector } from './GhostInlineSelector'

interface GhostStatsPanelProps {
  ghostSpec: AircraftSpec
  ghostSlug?: string | null
  onSelectGhost?: (slug: string | null) => void
}

export function GhostStatsPanel({ ghostSpec, ghostSlug, onSelectGhost }: GhostStatsPanelProps) {
  const { formatValue } = useUnits()
  const { count1: ghostCount, isLoading: pulseLoading } = useFleetPulse(ghostSlug ?? null, null)
  const typeRating = ghostSlug ? getTypeRating(ghostSlug) : null

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

  const thrustToWeight = ghostSpec.totalThrust.metric > 0 && ghostSpec.mtow.metric > 0
    ? (ghostSpec.totalThrust.metric / (ghostSpec.mtow.metric * 9.81 / 1000)) : 0
  const wingLoading = ghostSpec.mtow.metric > 0 && ghostSpec.wingArea.metric > 0
    ? ghostSpec.mtow.metric / ghostSpec.wingArea.metric : 0

  const textStats = [
    { label: 'Engines', value: String(ghostSpec.engines) },
    { label: 'Cruise', value: ghostSpec.cruiseSpeed },
    { label: 'Capacity', value: ghostSpec.capacity || '—' },
    { label: 'T/W Ratio', value: thrustToWeight > 0 ? thrustToWeight.toFixed(2) : '—' },
    { label: 'Wing Load', value: wingLoading > 0 ? `${Math.round(wingLoading)} kg/m²` : '—' },
  ]

  const row = 'flex items-center justify-between px-3 sm:px-5 py-1 sm:py-1.5 min-h-[38px] hover:bg-muted/30 transition-colors'

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header with selector */}
      <div className="flex flex-col items-center justify-center px-2 py-1.5 border-b border-border/40 bg-muted/20 min-h-[40px]">
        {onSelectGhost ? (
          <GhostSelector selectedSlug={ghostSlug ?? null} onSelect={onSelectGhost} />
        ) : (
          <span className="text-sm font-semibold text-purple-500 truncate">{ghostSpec.name}</span>
        )}
        <FleetPulseBadge count={ghostCount} isLoading={pulseLoading} />
        {typeRating && (
          <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-full mt-0.5 bg-muted/30 text-muted-foreground/50">
            {typeRating}
          </span>
        )}
      </div>

      {/* Spacer to align with tally row */}
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
