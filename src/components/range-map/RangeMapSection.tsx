import { lazy, Suspense, useMemo } from 'react'
import { ChevronDown, Globe, Loader2, Map } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AircraftSpec } from '@/types/aircraft'
import type { Airport } from '@/types/airport'
import { useComparisonStore } from '@/stores/comparison-store'
import { useAirports } from '@/hooks/useAirports'
import { AirportSearch } from './AirportSearch'
import { RangeMapLegend } from './RangeMapLegend'
import { cn } from '@/lib/utils'

const RangeMap = lazy(() =>
  import('./RangeMap').then((m) => ({ default: m.RangeMap })),
)

interface RangeMapSectionProps {
  aircraft1: AircraftSpec
  aircraft2: AircraftSpec
}

export function RangeMapSection({ aircraft1, aircraft2 }: RangeMapSectionProps) {
  const {
    rangeMapExpanded,
    setRangeMapExpanded,
    selectedAirportIata,
    setSelectedAirport,
    unitSystem,
  } = useComparisonStore()

  const { data: airports = [] } = useAirports(rangeMapExpanded)

  const selectedAirport = useMemo<Airport | null>(() => {
    if (!selectedAirportIata) return null
    return airports.find((a) => a.iata === selectedAirportIata) ?? null
  }, [airports, selectedAirportIata])

  const range1Km = aircraft1.range.metric
  const range2Km = aircraft2.range.metric

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setRangeMapExpanded(!rangeMapExpanded)}
        className={cn(
          'w-full flex items-center justify-between px-4 transition-colors group',
          rangeMapExpanded
            ? 'py-3 hover:bg-muted/20'
            : 'py-4 hover:bg-muted/10',
        )}
      >
        {rangeMapExpanded ? (
          /* ── Compact header when expanded ── */
          <>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Range Map</span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground rotate-180 transition-transform duration-200" />
          </>
        ) : (
          /* ── Rich teaser when collapsed ── */
          <div className="flex flex-col items-center gap-1 w-full">
            <div className="flex items-center gap-2">
              <div className="relative flex-shrink-0">
                <Globe className="w-5 h-5 text-blue-400 transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-card" />
              </div>
              <span className="text-sm font-semibold leading-tight">
                Where can they fly nonstop?
              </span>
            </div>
            <span className="text-xs text-muted-foreground leading-tight">
              Pick any airport &middot; compare {aircraft1.name} vs {aircraft2.name} range
            </span>
          </div>
        )}
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {rangeMapExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-3">
              {/* Airport search + legend row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <AirportSearch
                  airports={airports}
                  selectedAirport={selectedAirport}
                  onSelect={(a) => setSelectedAirport(a?.iata ?? null)}
                />
                {selectedAirport && (
                  <RangeMapLegend
                    aircraft1Name={aircraft1.name}
                    aircraft2Name={aircraft2.name}
                    range1Km={range1Km}
                    range2Km={range2Km}
                    unitSystem={unitSystem}
                  />
                )}
              </div>

              {/* Map */}
              {selectedAirport ? (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading map...
                    </div>
                  }
                >
                  <RangeMap
                    airport={selectedAirport}
                    range1Km={range1Km}
                    range2Km={range2Km}
                    aircraft1Name={aircraft1.name}
                    aircraft2Name={aircraft2.name}
                    airports={airports}
                  />
                </Suspense>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-sm gap-2 rounded-lg border border-dashed border-border/40 bg-muted/10">
                  <Map className="w-8 h-8 opacity-30" />
                  <p>Select a departure airport to visualize range coverage</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
