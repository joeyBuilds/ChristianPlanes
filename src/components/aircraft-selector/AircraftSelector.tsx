import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import { aircraftCatalog } from '@/data/aircraft-catalog'
import { cn } from '@/lib/utils'

interface AircraftSelectorProps {
  label: string
  selectedSlug: string | null
  onSelect: (slug: string | null) => void
  accentColor: 'blue' | 'red'
}

export function AircraftSelector({ label, selectedSlug, onSelect, accentColor }: AircraftSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = aircraftCatalog.find((a) => a.slug === selectedSlug)
  const filtered = aircraftCatalog.filter((a) =>
    a.displayName.toLowerCase().includes(search.toLowerCase()) ||
    a.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
    a.slug.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce(
    (acc, entry) => {
      const key = entry.manufacturer
      if (!acc[key]) acc[key] = []
      acc[key].push(entry)
      return acc
    },
    {} as Record<string, typeof filtered>
  )

  // Close on click outside
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

  // Focus input when opening
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const borderColor = accentColor === 'blue'
    ? 'border-blue-400/60 dark:border-blue-500/40'
    : 'border-red-400/60 dark:border-red-500/40'

  const accentBg = accentColor === 'blue'
    ? 'bg-blue-50 dark:bg-blue-950/30'
    : 'bg-red-50 dark:bg-red-950/30'

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg border-2 bg-card text-left transition-all',
          selected ? borderColor : 'border-border',
          selected && accentBg
        )}
      >
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
          <div className="text-sm font-semibold text-foreground truncate">
            {selected ? selected.displayName : 'Select aircraft...'}
          </div>
          {selected && (
            <div className="text-xs text-muted-foreground capitalize">{selected.category}</div>
          )}
        </div>
        <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-border bg-popover shadow-xl max-h-80 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                {entries.map((entry) => (
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
