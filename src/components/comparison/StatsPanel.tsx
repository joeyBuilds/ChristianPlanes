import { useMemo, useCallback, useState } from 'react'
import type { AircraftSpec, DualUnit } from '@/types/aircraft'
import { useUnits } from '@/hooks/useUnits'
import { useFleetPulse } from '@/hooks/useFleetPulse'
import { InlineSelector } from '@/components/aircraft-selector/InlineSelector'
import { FleetPulseBadge } from './FleetPulseBadge'
import { aircraftCatalog } from '@/data/aircraft-catalog'
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

type StatsTab = 'overview' | 'performance' | 'details'

export function StatsPanel({
  aircraft1,
  aircraft2,
  aircraft1Slug,
  aircraft2Slug,
  onSelectAircraft1,
  onSelectAircraft2,
}: StatsPanelProps) {
  const { formatValue, getValue } = useUnits()
  const { count1, count2, isLoading: pulseLoading } = useFleetPulse(aircraft1Slug, aircraft2Slug)
  const [spinning, setSpinning] = useState(false)
  const [activeTab, setActiveTab] = useState<StatsTab>('overview')

  const randomize = useCallback(() => {
    if (spinning) return
    setSpinning(true)
    setTimeout(() => {
      const slugs = aircraftCatalog.map((a) => a.slug)
      const pick1 = slugs[Math.floor(Math.random() * slugs.length)]
      let pick2 = slugs[Math.floor(Math.random() * slugs.length)]
      while (pick2 === pick1 && slugs.length > 1) {
        pick2 = slugs[Math.floor(Math.random() * slugs.length)]
      }
      onSelectAircraft1(pick1)
      onSelectAircraft2(pick2)
      setSpinning(false)
    }, 600)
  }, [onSelectAircraft1, onSelectAircraft2, spinning])

  // ── Computed metrics ──
  const thrustToWeight1 = aircraft1.totalThrust.metric > 0 && aircraft1.mtow.metric > 0
    ? (aircraft1.totalThrust.metric / (aircraft1.mtow.metric * 9.81 / 1000)) : 0
  const thrustToWeight2 = aircraft2.totalThrust.metric > 0 && aircraft2.mtow.metric > 0
    ? (aircraft2.totalThrust.metric / (aircraft2.mtow.metric * 9.81 / 1000)) : 0

  const wingLoading1 = aircraft1.mtow.metric > 0 && aircraft1.wingArea.metric > 0
    ? aircraft1.mtow.metric / aircraft1.wingArea.metric : 0
  const wingLoading2 = aircraft2.mtow.metric > 0 && aircraft2.wingArea.metric > 0
    ? aircraft2.mtow.metric / aircraft2.wingArea.metric : 0

  // ── Stats by tab ──
  const overviewStats: StatDef[] = [
    { label: 'Length', value1: aircraft1.length, value2: aircraft2.length },
    { label: 'Height', value1: aircraft1.height, value2: aircraft2.height },
    { label: 'Wingspan', value1: aircraft1.wingspan, value2: aircraft2.wingspan },
    { label: 'Wing Area', value1: aircraft1.wingArea, value2: aircraft2.wingArea, decimals: 0 },
  ]

  const performanceStats: StatDef[] = [
    { label: 'MTOW', value1: aircraft1.mtow, value2: aircraft2.mtow, decimals: 0 },
    { label: 'Range', value1: aircraft1.range, value2: aircraft2.range, decimals: 0 },
    { label: 'Thrust / Eng', value1: aircraft1.thrustPerEngine, value2: aircraft2.thrustPerEngine, decimals: 0 },
    { label: 'Total Thrust', value1: aircraft1.totalThrust, value2: aircraft2.totalThrust, decimals: 0 },
  ]

  const currentStats = activeTab === 'overview' ? overviewStats : performanceStats

  const tally = useMemo(() => {
    // Tally across ALL stats for the current tab
    const allStats = [...currentStats]
    let ac1 = 0, ac2 = 0
    for (const s of allStats) {
      const v1 = getValue(s.value1)
      const v2 = getValue(s.value2)
      const hib = s.higherIsBetter !== false
      if (hib ? v1 > v2 : v1 < v2) ac1++
      else if (hib ? v2 > v1 : v2 < v1) ac2++
    }
    return { ac1, ac2 }
  }, [currentStats, getValue])

  const tabs: { key: StatsTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'performance', label: 'Performance' },
    { key: 'details', label: 'Details' },
  ]

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* ── Row 1: aircraft selectors + random button ── */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-border/40 bg-muted/20 min-h-[40px]">
        <div className="flex flex-col items-center justify-center px-2 py-1.5">
          <InlineSelector
            selectedSlug={aircraft1Slug}
            onSelect={onSelectAircraft1}
            accentColor="blue"
            align="left"
          />
          <FleetPulseBadge count={count1} isLoading={pulseLoading} />
        </div>
        <button
          onClick={randomize}
          className="group flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg cursor-pointer select-none transition-all duration-300 hover:scale-105"
          title="Random matchup"
        >
          <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-muted-foreground/25 group-hover:text-amber-400/70 transition-colors duration-300">
            Random
          </span>
          <div className="relative rounded-md border-2 border-amber-700/30 group-hover:border-amber-400/60 bg-gradient-to-b from-neutral-900/80 to-neutral-800/80 dark:from-neutral-900 dark:to-neutral-950 p-[3px] transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(251,191,36,0.3)]">
            <div className="h-[2px] rounded-full bg-gradient-to-r from-transparent via-amber-500/40 to-transparent group-hover:via-amber-400/80 mb-[2px] transition-all" />
            <div className="flex gap-[2px]">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'w-[16px] h-[20px] rounded-[2px] flex items-center justify-center overflow-hidden transition-all duration-300',
                    'bg-gradient-to-b from-neutral-800 to-neutral-900 dark:from-black/60 dark:to-black/80',
                    'border border-amber-900/20 group-hover:border-amber-400/30',
                    !spinning && 'group-hover:shadow-[inset_0_0_8px_rgba(251,191,36,0.15)]',
                  )}
                >
                  <span
                    className={cn(
                      'text-[12px] font-black font-mono leading-none transition-all duration-200',
                      spinning
                        ? 'animate-slot-spin'
                        : 'text-amber-600/40 group-hover:animate-slot-rainbow',
                    )}
                    style={{
                      ...(spinning ? { animationDelay: `${i * 80}ms` } : {}),
                      ...(!spinning ? { animationDelay: `${i * 150}ms` } : {}),
                      textShadow: 'none',
                    }}
                  >
                    7
                  </span>
                </div>
              ))}
            </div>
            <div className="h-[2px] rounded-full bg-gradient-to-r from-transparent via-amber-500/40 to-transparent group-hover:via-amber-400/80 mt-[2px] transition-all" />
          </div>
          <div className="w-[4px] h-[4px] rounded-full bg-red-600/30 group-hover:bg-red-500 group-hover:shadow-[0_0_6px_rgba(239,68,68,0.5)] transition-all duration-300" />
          <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-muted-foreground/25 group-hover:text-amber-400/70 transition-colors duration-300">
            Pull
          </span>
          <style>{`
            @keyframes slot-spin {
              0% { transform: translateY(0); opacity: 1; color: #f59e0b; }
              15% { transform: translateY(-14px); opacity: 0; }
              30% { transform: translateY(14px); opacity: 0; }
              50% { transform: translateY(-8px); opacity: 0.4; color: #ef4444; }
              70% { transform: translateY(3px); opacity: 0.8; color: #22c55e; }
              85% { transform: translateY(-1px); opacity: 1; color: #f59e0b; }
              100% { transform: translateY(0); opacity: 1; color: #f59e0b; }
            }
            .animate-slot-spin {
              animation: slot-spin 0.55s ease-in-out;
            }
            @keyframes slot-rainbow {
              0%, 100% { color: #ef4444; text-shadow: 0 0 6px rgba(239,68,68,0.6); }
              14% { color: #f97316; text-shadow: 0 0 6px rgba(249,115,22,0.6); }
              28% { color: #eab308; text-shadow: 0 0 6px rgba(234,179,8,0.6); }
              42% { color: #22c55e; text-shadow: 0 0 6px rgba(34,197,94,0.6); }
              57% { color: #3b82f6; text-shadow: 0 0 6px rgba(59,130,246,0.6); }
              71% { color: #8b5cf6; text-shadow: 0 0 6px rgba(139,92,246,0.6); }
              85% { color: #ec4899; text-shadow: 0 0 6px rgba(236,72,153,0.6); }
            }
            .group:hover .group-hover\\:animate-slot-rainbow {
              animation: slot-rainbow 1.2s ease-in-out infinite;
            }
          `}</style>
        </button>
        <div className="flex flex-col items-center justify-center px-2 py-1.5">
          <InlineSelector
            selectedSlug={aircraft2Slug}
            onSelect={onSelectAircraft2}
            accentColor="red"
            align="right"
          />
          <FleetPulseBadge count={count2} isLoading={pulseLoading} />
        </div>
      </div>

      {/* ── Row 2: tally score ── */}
      <div className="flex items-center justify-center gap-3 py-1.5 border-b border-border/40 bg-muted/10 min-h-[40px]">
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

      {/* ── Row 3: tabs ── */}
      <div className="flex border-b border-border/40 bg-muted/5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] transition-colors cursor-pointer',
              activeTab === tab.key
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground/40 hover:text-muted-foreground/70'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Stat rows for current tab ── */}
      {activeTab !== 'details' ? (
        <>
          <div className="divide-y divide-border/40">
            {currentStats.map((stat) => {
              const v1 = getValue(stat.value1)
              const v2 = getValue(stat.value2)
              const f1 = formatValue(stat.value1, stat.decimals ?? 1)
              const f2 = formatValue(stat.value2, stat.decimals ?? 1)
              const hib = stat.higherIsBetter !== false
              const w1 = hib ? v1 > v2 : v1 < v2
              const w2 = hib ? v2 > v1 : v2 < v1
              const tie = v1 === v2

              const diff = Math.abs(v1 - v2)
              const min = Math.min(v1, v2)
              const pctDiff = min > 0 ? (diff / min) * 100 : 0
              const pctStr = pctDiff < 0.1 ? '' : pctDiff < 10 ? `+${pctDiff.toFixed(1)}%` : `+${Math.round(pctDiff)}%`

              const maxVal = Math.max(v1, v2)
              const bar1Pct = maxVal > 0 ? (v1 / maxVal) * 100 : 0
              const bar2Pct = maxVal > 0 ? (v2 / maxVal) * 100 : 0

              return (
                <div key={stat.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-0 px-3 sm:px-5 py-1 sm:py-1.5 min-h-[38px] group hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className={cn(
                      'text-xs sm:text-sm font-mono tabular-nums font-medium tracking-tight',
                      w1 && !tie ? 'text-blue-500' : 'text-muted-foreground/70'
                    )}>
                      {f1}
                    </span>
                    <div className="w-full flex justify-end">
                      <div
                        className={cn(
                          'h-[2px] rounded-full transition-all duration-500',
                          w1 && !tie ? 'bg-blue-500/50' : 'bg-muted-foreground/15'
                        )}
                        style={{ width: `${bar1Pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center px-1.5 sm:px-3 min-w-[60px] sm:min-w-[85px]">
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
                  <div className="flex flex-col items-start gap-0.5">
                    <span className={cn(
                      'text-xs sm:text-sm font-mono tabular-nums font-medium tracking-tight',
                      w2 && !tie ? 'text-red-500' : 'text-muted-foreground/70'
                    )}>
                      {f2}
                    </span>
                    <div className="w-full flex justify-start">
                      <div
                        className={cn(
                          'h-[2px] rounded-full transition-all duration-500',
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

          {/* Text stats — shown on both overview and performance */}
          <div className="divide-y divide-border/40 border-t border-border/40">
            {activeTab === 'overview' && (
              <>
                <TextStatRow
                  label="Engines"
                  v1={String(aircraft1.engines)}
                  v2={String(aircraft2.engines)}
                  w1={aircraft1.engines > aircraft2.engines}
                  w2={aircraft2.engines > aircraft1.engines}
                />
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
                {(() => {
                  const cap1 = aircraft1.capacity || '—'
                  const cap2 = aircraft2.capacity || '—'
                  const c1 = parseInt(cap1.replace(/[^0-9]/g, '') || '0')
                  const c2 = parseInt(cap2.replace(/[^0-9]/g, '') || '0')
                  const sameUnit = cap1.includes('passenger') === cap2.includes('passenger')
                  const validCompare = sameUnit && c1 > 0 && c2 > 0
                  return (
                    <TextStatRow
                      label="Capacity"
                      v1={cap1}
                      v2={cap2}
                      w1={validCompare && c1 > c2}
                      w2={validCompare && c2 > c1}
                      delta={validCompare && c1 !== c2 ? `+${(Math.abs(c1 - c2) / Math.min(c1, c2) * 100).toFixed(0)}%` : undefined}
                      deltaBlue={validCompare && c1 > c2}
                    />
                  )
                })()}
              </>
            )}
            {activeTab === 'performance' && (
              <>
                <TextStatRow
                  label="T/W Ratio"
                  v1={thrustToWeight1 > 0 ? thrustToWeight1.toFixed(2) : '—'}
                  v2={thrustToWeight2 > 0 ? thrustToWeight2.toFixed(2) : '—'}
                  w1={thrustToWeight1 > thrustToWeight2 && thrustToWeight1 > 0}
                  w2={thrustToWeight2 > thrustToWeight1 && thrustToWeight2 > 0}
                  delta={thrustToWeight1 > 0 && thrustToWeight2 > 0 && thrustToWeight1 !== thrustToWeight2
                    ? `+${(Math.abs(thrustToWeight1 - thrustToWeight2) / Math.min(thrustToWeight1, thrustToWeight2) * 100).toFixed(0)}%`
                    : undefined}
                  deltaBlue={thrustToWeight1 > thrustToWeight2}
                />
                <TextStatRow
                  label="Wing Load"
                  v1={wingLoading1 > 0 ? `${Math.round(wingLoading1)} kg/m²` : '—'}
                  v2={wingLoading2 > 0 ? `${Math.round(wingLoading2)} kg/m²` : '—'}
                  w1={false}
                  w2={false}
                />
                <TextStatRow
                  label="Engines"
                  v1={String(aircraft1.engines)}
                  v2={String(aircraft2.engines)}
                  w1={aircraft1.engines > aircraft2.engines}
                  w2={aircraft2.engines > aircraft1.engines}
                />
              </>
            )}
          </div>
        </>
      ) : (
        /* ── Details tab: all stats combined ── */
        <div className="divide-y divide-border/40">
          {[...overviewStats, ...performanceStats].map((stat) => {
            const v1 = getValue(stat.value1)
            const v2 = getValue(stat.value2)
            const f1 = formatValue(stat.value1, stat.decimals ?? 1)
            const f2 = formatValue(stat.value2, stat.decimals ?? 1)
            const hib = stat.higherIsBetter !== false
            const w1 = hib ? v1 > v2 : v1 < v2
            const w2 = hib ? v2 > v1 : v2 < v1
            const tie = v1 === v2
            const maxVal = Math.max(v1, v2)
            const bar1Pct = maxVal > 0 ? (v1 / maxVal) * 100 : 0
            const bar2Pct = maxVal > 0 ? (v2 / maxVal) * 100 : 0

            return (
              <div key={stat.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-0 px-3 sm:px-5 py-0.5 sm:py-1 min-h-[32px] hover:bg-muted/30 transition-colors">
                <div className="flex flex-col items-end gap-0.5">
                  <span className={cn(
                    'text-[11px] sm:text-xs font-mono tabular-nums font-medium tracking-tight',
                    w1 && !tie ? 'text-blue-500' : 'text-muted-foreground/70'
                  )}>
                    {f1}
                  </span>
                  <div className="w-full flex justify-end">
                    <div className={cn('h-[1.5px] rounded-full transition-all duration-500', w1 && !tie ? 'bg-blue-500/50' : 'bg-muted-foreground/15')}
                      style={{ width: `${bar1Pct}%` }} />
                  </div>
                </div>
                <div className="flex flex-col items-center px-1.5 sm:px-3 min-w-[55px] sm:min-w-[80px]">
                  <span className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-widest leading-none">
                    {stat.label}
                  </span>
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className={cn(
                    'text-[11px] sm:text-xs font-mono tabular-nums font-medium tracking-tight',
                    w2 && !tie ? 'text-red-500' : 'text-muted-foreground/70'
                  )}>
                    {f2}
                  </span>
                  <div className="w-full flex justify-start">
                    <div className={cn('h-[1.5px] rounded-full transition-all duration-500', w2 && !tie ? 'bg-red-500/50' : 'bg-muted-foreground/15')}
                      style={{ width: `${bar2Pct}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
          <TextStatRow label="Engines" v1={String(aircraft1.engines)} v2={String(aircraft2.engines)} w1={aircraft1.engines > aircraft2.engines} w2={aircraft2.engines > aircraft1.engines} />
          <TextStatRow label="Cruise" v1={aircraft1.cruiseSpeed} v2={aircraft2.cruiseSpeed} w1={false} w2={false} />
          <TextStatRow label="Capacity" v1={aircraft1.capacity || '—'} v2={aircraft2.capacity || '—'} w1={false} w2={false} />
          <TextStatRow
            label="T/W Ratio"
            v1={thrustToWeight1 > 0 ? thrustToWeight1.toFixed(2) : '—'}
            v2={thrustToWeight2 > 0 ? thrustToWeight2.toFixed(2) : '—'}
            w1={thrustToWeight1 > thrustToWeight2 && thrustToWeight1 > 0}
            w2={thrustToWeight2 > thrustToWeight1 && thrustToWeight2 > 0}
          />
          <TextStatRow
            label="Wing Load"
            v1={wingLoading1 > 0 ? `${Math.round(wingLoading1)} kg/m²` : '—'}
            v2={wingLoading2 > 0 ? `${Math.round(wingLoading2)} kg/m²` : '—'}
            w1={false} w2={false}
          />
        </div>
      )}
    </div>
  )
}

function TextStatRow({ label, v1, v2, w1, w2, delta, deltaBlue }: {
  label: string; v1: string; v2: string; w1: boolean; w2: boolean
  delta?: string; deltaBlue?: boolean
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-0 px-3 sm:px-5 py-1 sm:py-1.5 min-h-[38px] hover:bg-muted/30 transition-colors">
      <div className="flex justify-end">
        <span className={cn(
          'text-xs sm:text-sm font-mono tabular-nums font-medium tracking-tight',
          w1 ? 'text-blue-500' : 'text-muted-foreground/70'
        )}>
          {v1}
        </span>
      </div>
      <div className="flex flex-col items-center px-1.5 sm:px-3 min-w-[60px] sm:min-w-[85px]">
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
