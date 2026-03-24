import { useState, useRef, useEffect, type RefObject } from 'react'
import {
  Layers,
  ArrowLeftRight,
  AlignVerticalJustifyStart,
  Eye,
  PenTool,
  Image,
  Ghost,
  Search,
  X,
  Camera,
} from 'lucide-react'
import { useComparisonStore } from '@/stores/comparison-store'
import { aircraftCatalog } from '@/data/aircraft-catalog'
import { hasAircraftImage } from '@/data/aircraft-images'
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
    renderStyle,
    setRenderStyle,
    ghostAircraftSlug,
    setGhostAircraft,
  } = useComparisonStore()

  const pill = 'px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium rounded-full transition-all flex items-center gap-1 sm:gap-1.5 border cursor-pointer whitespace-nowrap'
  const ico = 'w-3 h-3 sm:w-3.5 sm:h-3.5'
  const divider = 'hidden sm:block w-px h-5 bg-border/60 shrink-0'

  // Render style — amber
  const renderActive = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
  const renderInactive = 'text-amber-700/50 dark:text-amber-500/40 border-transparent hover:bg-amber-500/8 hover:border-amber-500/20'

  // Layout mode — indigo
  const layoutActive = 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
  const layoutInactive = 'text-indigo-700/50 dark:text-indigo-500/40 border-transparent hover:bg-indigo-500/8 hover:border-indigo-500/20'

  // View angle — emerald
  const angleActive = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  const angleInactive = 'text-emerald-700/50 dark:text-emerald-500/40 border-transparent hover:bg-emerald-500/8 hover:border-emerald-500/20'


  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 py-2 px-2">
      {/* Render style */}
      <div className="flex gap-1">
        <button
          onClick={() => setRenderStyle('blueprint')}
          className={cn(pill, renderStyle === 'blueprint' ? renderActive : renderInactive)}
        >
          <PenTool className={ico} />
          <span className="hidden xs:inline">Blueprint</span>
          <span className="xs:hidden">BP</span>
        </button>
        <button
          onClick={() => setRenderStyle('photo')}
          className={cn(pill, renderStyle === 'photo' ? renderActive : renderInactive)}
        >
          <Image className={ico} />
          Photo
        </button>
      </div>

      <div className={divider} />

      {/* Layout mode */}
      <div className="flex gap-1">
        <button
          onClick={() => setViewMode('stacked')}
          className={cn(pill, viewMode === 'stacked' ? layoutActive : layoutInactive)}
        >
          <AlignVerticalJustifyStart className={ico} />
          <span className="hidden sm:inline">Stacked</span>
          <span className="sm:hidden">Stack</span>
        </button>
        <button
          onClick={() => setViewMode('side-by-side')}
          className={cn(pill, viewMode === 'side-by-side' ? layoutActive : layoutInactive)}
        >
          <ArrowLeftRight className={ico} />
          <span className="hidden sm:inline">Parked</span>
          <span className="sm:hidden">Park</span>
        </button>
        <button
          onClick={() => setViewMode('overlay')}
          className={cn(pill, viewMode === 'overlay' ? layoutActive : layoutInactive)}
        >
          <Layers className={ico} />
          <span className="hidden sm:inline">Overlay</span>
          <span className="sm:hidden">Over</span>
        </button>
      </div>

      <div className={divider} />

      {/* View angle */}
      <div className="flex gap-1">
        <button
          onClick={() => setViewAngle('side')}
          className={cn(pill, viewAngle === 'side' ? angleActive : angleInactive)}
        >
          <Eye className={ico} />
          Side
        </button>
        <button
          onClick={() => setViewAngle('top')}
          className={cn(pill, viewAngle === 'top' ? angleActive : angleInactive)}
        >
          <Eye className={ico} />
          Top
        </button>
      </div>

      <div className={divider} />

      {/* Ghost 3rd aircraft */}
      <GhostSelector
        selectedSlug={ghostAircraftSlug}
        onSelect={setGhostAircraft}
        pill={pill}
        ico={ico}
      />

      <div className={divider} />

      {/* Export */}
      <ExportButton canvasRef={canvasRef} statsRef={statsRef} />
    </div>
  )
}

// --- Ghost aircraft inline selector ---
function GhostSelector({ selectedSlug, onSelect, pill, ico }: {
  selectedSlug: string | null; onSelect: (slug: string | null) => void; pill: string; ico: string
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

  // Purple theme for ghost
  const ghostActive = 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
  const ghostInactive = 'text-purple-700/50 dark:text-purple-500/40 border-transparent hover:bg-purple-500/8 hover:border-purple-500/20'

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
        className={cn(pill, selectedSlug ? ghostActive : ghostInactive)}
      >
        <Ghost className={ico} />
        {selected ? selected.displayName : 'Ghost'}
        {selectedSlug && (
          <X className="w-3 h-3 opacity-50" />
        )}
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
                    <span className="flex items-center gap-1.5">
                      {entry.displayName}
                      {hasAircraftImage(entry.slug) && (
                        <Camera className="w-3 h-3 text-amber-500 shrink-0" />
                      )}
                    </span>
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
