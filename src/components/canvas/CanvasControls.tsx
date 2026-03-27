import { useState, useRef, useEffect, type RefObject } from 'react'
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
} from 'lucide-react'
import { useComparisonStore } from '@/stores/comparison-store'
import { useIsDarkMode } from '@/hooks/useIsDarkMode'
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
    unitSystem,
    setUnitSystem,
  } = useComparisonStore()
  const isDarkMode = useIsDarkMode()

  const btn = 'p-1.5 rounded-md transition-all cursor-pointer'
  const ico = 'w-3.5 h-3.5'

  const on = 'bg-blue-500/15 text-blue-400 border-blue-500/25'
  const off = 'text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-muted/40 border-transparent'
  const groupLabel = 'text-[8px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/30 mb-1 text-center'

  return (
    <div className="flex items-start justify-center gap-4 sm:gap-6 py-2 px-2">
      {/* ── View ── */}
      <div className="flex flex-col items-center">
        <span className={groupLabel}>Layout</span>
        <div className="flex items-center gap-0.5 rounded-lg border border-border/30 bg-muted/10 p-0.5">
          <button
            onClick={() => viewMode === 'stacked' ? cycleStackAlignment() : setViewMode('stacked')}
            className={cn(btn, 'border', viewMode === 'stacked' ? on : off)}
            title={viewMode === 'stacked' ? `Stacked · ${stackAlignment}` : 'Stacked'}
          >
            <AlignVerticalJustifyStart className={cn(ico, 'transition-transform',
              viewMode === 'stacked' && stackAlignment === 'right' && 'scale-x-[-1]'
            )} />
          </button>
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
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = selectedSlug ? aircraftCatalog.find(a => a.slug === selectedSlug) : null
  const filtered = aircraftCatalog.filter(a =>
    a.displayName.toLowerCase().includes(search.toLowerCase()) ||
    a.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
    a.slug.toLowerCase().includes(search.toLowerCase())
  )
  const grouped = filtered.reduce((acc, entry) => {
    if (!acc[entry.manufacturer]) acc[entry.manufacturer] = []
    acc[entry.manufacturer].push(entry)
    return acc
  }, {} as Record<string, typeof filtered>)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const ghostOn = 'bg-purple-500/15 text-purple-400 border-purple-500/25'
  const ghostOff = 'text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-muted/40 border-transparent'

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => {
          if (selectedSlug && !open) {
            onSelect(null)
          } else {
            setOpen(!open)
          }
        }}
        className={cn(btn, 'border flex items-center gap-1', selectedSlug ? ghostOn : ghostOff)}
        title={selected ? `Ghost: ${selected.displayName} (click to remove)` : 'Add ghost aircraft'}
      >
        <Ghost className={ico} />
        {selectedSlug && <X className="w-2.5 h-2.5 opacity-50" />}
      </button>

      {open && (
        <div className="absolute z-50 bottom-full mb-1 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto w-72 rounded-lg border border-border bg-popover shadow-xl max-h-72 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search aircraft..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([manufacturer, entries]) => (
              <div key={manufacturer}>
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                  {manufacturer}
                </div>
                {entries.map(entry => (
                  <button
                    key={entry.slug}
                    onClick={() => {
                      onSelect(entry.slug)
                      setOpen(false)
                      setSearch('')
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center justify-between',
                      entry.slug === selectedSlug ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground'
                    )}
                  >
                    <span>{entry.displayName}</span>
                    <span className="text-xs text-muted-foreground capitalize">{entry.category}</span>
                  </button>
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-8 text-sm text-muted-foreground text-center">
                No aircraft found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
