import { useMemo } from 'react'
import type { AircraftSpec, DualUnit } from '@/types/aircraft'
import { useUnits } from '@/hooks/useUnits'
import { InlineSelector } from '@/components/aircraft-selector/InlineSelector'
import { cn } from '@/lib/utils'

interface StatsPanelProps {
  aircraft1: AircraftSpec
  aircraft2: AircraftSpec
  aircraft1Slug: string | null
  aircraft2Slug: string | null
  onSelectAircraft1: (slug: string | null) => void
  onSelectAircraft2: (slug: string | null) => void
}

interface StatDef {
  label: string
  value1: DualUnit
  value2: DualUnit
  decimals?: number
  higherIsBetter?: boolean
}

export function StatsPanel({
  aircraft1,
  aircraft2,
  aircraft1Slug,
  aircraft2Slug,
  onSelectAircraft1,
  onSelectAircraft2,
}: StatsPanelProps) {
  const { formatValue, getValue } = useUnits()

  const stats: StatDef[] = [
    { label: 'Length', value1: aircraft1.length, value2: aircraft2.length },
    { label: 'Height', value1: aircraft1.height, value2: aircraft2.height },
    { label: 'Wingspan', value1: aircraft1.wingspan, value2: aircraft2.wingspan },
    { label: 'Wing Area', value1: aircraft1.wingArea, value2: aircraft2.wingArea, decimals: 0 },
    { label: 'MTOW', value1: aircraft1.mtow, value2: aircraft2.mtow, decimals: 0 },
    { label: 'Range', value1: aircraft1.range, value2: aircraft2.range, decimals: 0 },
    { label: 'Thrust / Eng', value1: aircraft1.thrustPerEngine, value2: aircraft2.thrustPerEngine, decimals: 0 },
    { label: 'Total Thrust', value1: aircraft1.totalThrust, value2: aircraft2.totalThrust, decimals: 0 },
  ]

  const tally = useMemo(() => {
    let ac1 = 0, ac2 = 0
    for (const s of stats) {
      const v1 = getValue(s.value1)
      const v2 = getValue(s.value2)
      const hib = s.higherIsBetter !== false
      if (hib ? v1 > v2 : v1 < v2) ac1++
      else if (hib ? v2 > v1 : v2 < v1) ac2++
    }
    return { ac1, ac2 }
  }, [stats, getValue])

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* ── Header: aircraft selectors + tally ── */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-border/60 bg-muted/20">
        <div className="flex items-center justify-center px-2">
          <InlineSelector
            selectedSlug={aircraft1Slug}
            onSelect={onSelectAircraft1}
            accentColor="blue"
            align="left"
          />
        </div>
        <div className="flex items-center gap-2.5 px-4 py-3">
          <span className={cn(
            'text-lg font-bold tabular-nums font-mono',
            tally.ac1 >= tally.ac2 ? 'text-blue-500' : 'text-muted-foreground/30'
          )}>
            {tally.ac1}
          </span>
          <span className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-[0.2em]">vs</span>
          <span className={cn(
            'text-lg font-bold tabular-nums font-mono',
            tally.ac2 >= tally.ac1 ? 'text-red-500' : 'text-muted-foreground/30'
          )}>
            {tally.ac2}
          </span>
        </div>
        <div className="flex items-center justify-center px-2">
          <InlineSelector
            selectedSlug={aircraft2Slug}
            onSelect={onSelectAircraft2}
            accentColor="red"
            align="right"
          />
        </div>
      </div>

      {/* ── Vertical stat rows ── */}
      <div className="divide-y divide-border/40">
        {stats.map((stat) => {
          const v1 = getValue(stat.value1)
          const v2 = getValue(stat.value2)
          const f1 = formatValue(stat.value1, stat.decimals ?? 1)
          const f2 = formatValue(stat.value2, stat.decimals ?? 1)
          const hib = stat.higherIsBetter !== false
          const w1 = hib ? v1 > v2 : v1 < v2
          const w2 = hib ? v2 > v1 : v2 < v1
          const tie = v1 === v2

          // Delta percentage
          const diff = Math.abs(v1 - v2)
          const min = Math.min(v1, v2)
          const pctDiff = min > 0 ? (diff / min) * 100 : 0
          const pctStr = pctDiff < 0.1 ? '' : pctDiff < 10 ? `+${pctDiff.toFixed(1)}%` : `+${Math.round(pctDiff)}%`

          // Bar widths (relative to max)
          const maxVal = Math.max(v1, v2)
          const bar1Pct = maxVal > 0 ? (v1 / maxVal) * 100 : 0
          const bar2Pct = maxVal > 0 ? (v2 / maxVal) * 100 : 0

          return (
            <div key={stat.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-0 px-3 sm:px-5 py-2 sm:py-2.5 group hover:bg-muted/30 transition-colors">
              {/* Left: ac1 value + bar */}
              <div className="flex flex-col items-end gap-1">
                <span className={cn(
                  'text-xs sm:text-sm font-mono tabular-nums font-medium tracking-tight',
                  w1 && !tie ? 'text-blue-500' : 'text-muted-foreground/70'
                )}>
                  {f1}
                </span>
                <div className="w-full flex justify-end">
                  <div
                    className={cn(
                      'h-[3px] rounded-full transition-all duration-500',
                      w1 && !tie ? 'bg-blue-500/50' : 'bg-muted-foreground/15'
                    )}
                    style={{ width: `${bar1Pct}%` }}
                  />
                </div>
              </div>

              {/* Center: label + delta */}
              <div className="flex flex-col items-center px-2 sm:px-4 min-w-[70px] sm:min-w-[100px]">
                <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest leading-none">
                  {stat.label}
                </span>
                {!tie && pctStr && (
                  <span className={cn(
                    'text-[9px] font-mono tabular-nums mt-0.5 leading-none',
                    w1 ? 'text-blue-500/50' : 'text-red-500/50'
                  )}>
                    {pctStr}
                  </span>
                )}
              </div>

              {/* Right: ac2 value + bar */}
              <div className="flex flex-col items-start gap-1">
                <span className={cn(
                  'text-xs sm:text-sm font-mono tabular-nums font-medium tracking-tight',
                  w2 && !tie ? 'text-red-500' : 'text-muted-foreground/70'
                )}>
                  {f2}
                </span>
                <div className="w-full flex justify-start">
                  <div
                    className={cn(
                      'h-[3px] rounded-full transition-all duration-500',
                      w2 && !tie ? 'bg-red-500/50' : 'bg-muted-foreground/15'
                    )}
                    style={{ width: `${bar2Pct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Bottom stats: Engines, Cruise, Capacity — same vertical alignment ── */}
      <div className="divide-y divide-border/40 border-t border-border/40">
        {/* Engines */}
        <TextStatRow
          label="Engines"
          v1={String(aircraft1.engines)}
          v2={String(aircraft2.engines)}
          w1={aircraft1.engines > aircraft2.engines}
          w2={aircraft2.engines > aircraft1.engines}
        />
        {/* Cruise */}
        {(() => {
          const m1 = parseFloat(aircraft1.cruiseSpeed.replace('M', ''))
          const m2 = parseFloat(aircraft2.cruiseSpeed.replace('M', ''))
          const validCompare = !isNaN(m1) && !isNaN(m2)
          return (
            <TextStatRow
              label="Cruise"
              v1={aircraft1.cruiseSpeed}
              v2={aircraft2.cruiseSpeed}
              w1={validCompare && m1 > m2}
              w2={validCompare && m2 > m1}
              delta={validCompare && m1 !== m2 ? `+${(Math.abs(m1 - m2) / Math.min(m1, m2) * 100).toFixed(1)}%` : undefined}
              deltaBlue={validCompare && m1 > m2}
            />
          )
        })()}
        {/* Capacity */}
        {(aircraft1.capacity || aircraft2.capacity) && (() => {
          const c1 = parseInt(aircraft1.capacity?.replace(/[^0-9]/g, '') || '0')
          const c2 = parseInt(aircraft2.capacity?.replace(/[^0-9]/g, '') || '0')
          const validCompare = c1 > 0 && c2 > 0
          return (
            <TextStatRow
              label="Capacity"
              v1={aircraft1.capacity || '—'}
              v2={aircraft2.capacity || '—'}
              w1={validCompare && c1 > c2}
              w2={validCompare && c2 > c1}
              delta={validCompare && c1 !== c2 ? `+${(Math.abs(c1 - c2) / Math.min(c1, c2) * 100).toFixed(0)}%` : undefined}
              deltaBlue={validCompare && c1 > c2}
            />
          )
        })()}
      </div>
    </div>
  )
}

/** A text-based stat row that follows the same 3-column vertical alignment */
function TextStatRow({ label, v1, v2, w1, w2, delta, deltaBlue }: {
  label: string; v1: string; v2: string; w1: boolean; w2: boolean
  delta?: string; deltaBlue?: boolean
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-0 px-3 sm:px-5 py-2 sm:py-2.5 hover:bg-muted/30 transition-colors">
      <div className="flex justify-end">
        <span className={cn(
          'text-xs sm:text-sm font-mono tabular-nums font-medium tracking-tight',
          w1 ? 'text-blue-500' : 'text-muted-foreground/70'
        )}>
          {v1}
        </span>
      </div>
      <div className="flex flex-col items-center px-2 sm:px-4 min-w-[70px] sm:min-w-[100px]">
        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest leading-none">
          {label}
        </span>
        {delta && (
          <span className={cn(
            'text-[9px] font-mono tabular-nums mt-0.5 leading-none',
            deltaBlue ? 'text-blue-500/50' : 'text-red-500/50'
          )}>
            {delta}
          </span>
        )}
      </div>
      <div className="flex justify-start">
        <span className={cn(
          'text-xs sm:text-sm font-mono tabular-nums font-medium tracking-tight',
          w2 ? 'text-red-500' : 'text-muted-foreground/70'
        )}>
          {v2}
        </span>
      </div>
    </div>
  )
}
