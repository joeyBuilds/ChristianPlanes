import { useState, useRef, useEffect, useMemo, type RefObject } from 'react'
import {
  Layers,
  ArrowLeftRight,
  AlignVerticalJustifyStart,
  Ghost,
  Search,
  X,
  Ruler,
  Grid3X3,
  Sun,
  Moon,
  Filter,
  // Paintbrush, // ready for render style toggle
} from 'lucide-react'
import { useComparisonStore } from '@/stores/comparison-store'
import { useIsDarkMode } from '@/hooks/useIsDarkMode'
import { hasAircraftBlueprint, hasFullBlueprint } from '@/data/aircraft-blueprints'
import { aircraftCatalog } from '@/data/aircraft-catalog'
import { cn } from '@/lib/utils'
import { ExportButton } from './ExportButton'

interface CanvasControlsProps {
  canvasRef: RefObject<HTMLDivElement | null>
  statsRef: RefObject<HTMLDivElement | null>
}

export function CanvasControls({ canvasRef, statsRef }: CanvasControlsProps) {
  const {
    viewMode,
    setViewMode,
    viewAngle,
    setViewAngle,
    ghostAircraftSlug,
    setGhostAircraft,
    stackAlignment,
    cycleStackAlignment,
    showMeasurements,
    toggleMeasurements,
    showGrid,
    toggleGrid,
    // renderStyle, toggleRenderStyle, // ready for render style toggle
    unitSystem,
    setUnitSystem,
  } = useComparisonStore()
  const isDarkMode = useIsDarkMode()

  const btn = 'p-2 sm:p-1.5 rounded-md transition-all cursor-pointer'
  const ico = 'w-4 h-4 sm:w-3.5 sm:h-3.5'

  const on = 'bg-blue-500/15 text-blue-400 border-blue-500/25'
  const off = 'text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-muted/40 border-transparent'
  const groupLabel = 'text-[8px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/30 mb-1 text-center'

  return (
    <div className="flex flex-wrap items-start justify-center gap-3 sm:gap-6 py-2 px-2">
      {/* ── View ── */}
      <div className="flex flex-col items-center">
        <span className={groupLabel}>Layout</span>
        <div className="flex items-center gap-0.5 rounded-lg border border-border/30 bg-muted/10 p-0.5">
          {/* Stacked button with alignment sub-mode indicator */}
          <div className="relative flex flex-col items-center">
            <button
              onClick={() => viewMode === 'stacked' ? cycleStackAlignment() : setViewMode('stacked')}
              className={cn(btn, 'border', viewMode === 'stacked' ? on : off)}
              title={viewMode === 'stacked' ? `Stacked · ${stackAlignment} (click to cycle)` : 'Stacked'}
            >
              <AlignVerticalJustifyStart className={cn(ico, 'transition-transform',
                viewMode === 'stacked' && stackAlignment === 'right' && 'scale-x-[-1]'
              )} />
            </button>
            {/* Alignment dots — only visible when stacked is active */}
            {viewMode === 'stacked' && (
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-[3px]">
                {(['left', 'center', 'right'] as const).map((a) => (
                  <span
                    key={a}
                    className={cn(
                      'block w-1 h-1 rounded-full transition-colors',
                      stackAlignment === a ? 'bg-blue-400' : 'bg-muted-foreground/25',
                    )}
                  />
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={cn(btn, 'border', viewMode === 'side-by-side' ? on : off)}
            title="Parked"
          >
            <ArrowLeftRight className={ico} />
          </button>
          <button
            onClick={() => setViewMode('overlay')}
            className={cn(btn, 'border', viewMode === 'overlay' ? on : off)}
            title="Overlay"
          >
            <Layers className={ico} />
          </button>
        </div>
      </div>

      {/* ── Angle ── */}
      <div className="flex flex-col items-center">
        <span className={groupLabel}>Angle</span>
        <div className="flex items-center gap-0.5 rounded-lg border border-border/30 bg-muted/10 p-0.5">
          {(['side', 'front', 'top'] as const).map((angle) => (
            <button
              key={angle}
              onClick={() => setViewAngle(angle)}
              className={cn(btn, 'border text-[10px] font-semibold font-mono uppercase px-2.5',
                viewAngle === angle ? on : off
              )}
              title={`${angle} view`}
            >
              {angle}
            </button>
          ))}
        </div>
      </div>

      {/* ── Display ── */}
      <div className="flex flex-col items-center">
        <span className={groupLabel}>Display</span>
        <div className="flex items-center gap-0.5 rounded-lg border border-border/30 bg-muted/10 p-0.5">
          <button
            onClick={toggleMeasurements}
            className={cn(btn, 'border', showMeasurements ? on : off)}
            title="Measurements"
          >
            <Ruler className={ico} />
          </button>
          <button
            onClick={toggleGrid}
            className={cn(btn, 'border', showGrid ? on : off)}
            title="Grid"
          >
            <Grid3X3 className={ico} />
          </button>
          {/* Render style toggle — hidden until filled silhouette assets are ready
          <button
            onClick={toggleRenderStyle}
            className={cn(btn, 'border', renderStyle === 'silhouette'
              ? 'bg-purple-500/15 text-purple-400 border-purple-500/25'
              : off
            )}
            title={renderStyle === 'blueprint' ? 'Switch to filled silhouette' : 'Switch to CAD blueprint'}
          >
            <Paintbrush className={ico} />
          </button>
          */}
          <GhostSelector
            selectedSlug={ghostAircraftSlug}
            onSelect={setGhostAircraft}
            btn={btn}
            ico={ico}
          />
        </div>
      </div>

      {/* ── Settings ── */}
      <div className="flex flex-col items-center">
        <span className={groupLabel}>Settings</span>
        <div className="flex items-center gap-0.5 rounded-lg border border-border/30 bg-muted/10 p-0.5">
          <button
            onClick={() => setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
            className={cn(btn, 'border text-[10px] font-bold font-mono px-2', off)}
            title={unitSystem === 'metric' ? 'Switch to Imperial' : 'Switch to Metric'}
          >
            {unitSystem === 'metric' ? 'M' : 'FT'}
          </button>
          <button
            onClick={() => {
              document.documentElement.classList.toggle('dark')
              localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light')
            }}
            className={cn(btn, 'border', off)}
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className={ico} /> : <Moon className={ico} />}
          </button>
          <ExportButton canvasRef={canvasRef} statsRef={statsRef} />
        </div>
      </div>
    </div>
  )
}

// --- Ghost aircraft inline selector ---
function GhostSelector({ selectedSlug, onSelect, btn, ico }: {
  selectedSlug: string | null; onSelect: (slug: string | null) => void; btn: string; ico: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [cadFirst, setCadFirst] = useState(true)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selected = selectedSlug ? aircraftCatalog.find(a => a.slug === selectedSlug) : null

  const filtered = useMemo(() => {
    let result = aircraftCatalog.filter(a =>
      a.displayName.toLowerCase().includes(search.toLowerCase()) ||
      a.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase())
    )
    if (cadFirst) {
      result = [
        ...result.filter(a => hasAircraftBlueprint(a.slug)),
        ...result.filter(a => !hasAircraftBlueprint(a.slug)),
      ]
    }
    return result
  }, [search, cadFirst])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false); setSearch(''); setHighlightIndex(-1)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  useEffect(() => { if (open) { inputRef.current?.focus(); setHighlightIndex(-1) } }, [open])
  useEffect(() => { setHighlightIndex(-1) }, [search])
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-aircraft-item]')
      items[highlightIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightIndex])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex(prev => Math.min(prev + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex(prev => Math.max(prev - 1, 0)) }
    else if (e.key === 'Enter' && highlightIndex >= 0) { e.preventDefault(); onSelect(filtered[highlightIndex].slug); setOpen(false); setSearch(''); setHighlightIndex(-1) }
    else if (e.key === 'Escape') { setOpen(false); setSearch(''); setHighlightIndex(-1) }
  }

  const ghostOn = 'bg-purple-500/15 text-purple-400 border-purple-500/25'
  const ghostOff = 'text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-muted/40 border-transparent'

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => {
          if (selectedSlug && !open) { onSelect(null) } else { setOpen(!open) }
        }}
        className={cn(btn, 'border flex items-center gap-1', selectedSlug ? ghostOn : ghostOff)}
        title={selected ? `Ghost: ${selected.displayName} (click to remove)` : 'Add ghost aircraft'}
      >
        <Ghost className={ico} />
        {selectedSlug && <X className="w-2.5 h-2.5 opacity-50" />}
      </button>

      {open && (
        <div className="absolute z-50 bottom-full mb-1 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto w-[calc(100vw-2rem)] sm:w-72 max-w-72 rounded-lg border border-border bg-popover shadow-xl max-h-72 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search aircraft..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setCadFirst(!cadFirst)}
              title={cadFirst ? 'Show all' : 'CAD blueprints first'}
              className={cn('p-1 rounded transition-colors', cadFirst ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground/50 hover:text-muted-foreground')}
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
          <div ref={listRef} className="overflow-y-auto flex-1">
            {filtered.map((entry, idx) => (
              <button
                key={entry.slug}
                data-aircraft-item
                onClick={() => { onSelect(entry.slug); setOpen(false); setSearch(''); setHighlightIndex(-1) }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center justify-between',
                  entry.slug === selectedSlug ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground',
                  idx === highlightIndex && 'bg-accent'
                )}
              >
                <span className="flex items-center gap-1.5">
                  {entry.displayName}
                  {hasAircraftBlueprint(entry.slug) && (
                    <span className={cn(
                      "text-[10px] font-bold leading-none px-1 py-0.5 rounded",
                      hasFullBlueprint(entry.slug)
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    )}>CAD</span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground capitalize">{entry.category}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-8 text-sm text-muted-foreground text-center">No aircraft found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
