import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X, Camera } from 'lucide-react'
import { aircraftCatalog } from '@/data/aircraft-catalog'
import { hasAircraftImage } from '@/data/aircraft-images'
import { cn } from '@/lib/utils'

interface InlineSelectorProps {
  selectedSlug: string | null
  onSelect: (slug: string | null) => void
  accentColor: 'blue' | 'red'
  align?: 'left' | 'right'
}

export function InlineSelector({ selectedSlug, onSelect, accentColor, align = 'left' }: InlineSelectorProps) {
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

  const textColor = accentColor === 'blue' ? 'text-blue-500' : 'text-red-500'
  const hoverColor = accentColor === 'blue' ? 'hover:text-blue-400' : 'hover:text-red-400'

  return (
    <div ref={containerRef} className={cn('relative flex w-full', align === 'right' ? 'justify-end' : 'justify-start')}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold transition-colors cursor-pointer rounded-md',
          textColor,
          hoverColor,
          accentColor === 'blue' ? 'hover:bg-blue-500/5' : 'hover:bg-red-500/5'
        )}
      >
        <span className="truncate">{selected ? selected.displayName : 'Select...'}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 shrink-0 opacity-50 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className={cn(
          'absolute z-50 top-full mt-1 w-72 rounded-lg border border-border bg-popover shadow-xl max-h-80 overflow-hidden flex flex-col',
          align === 'right' ? 'right-0' : 'left-0'
        )}>
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
