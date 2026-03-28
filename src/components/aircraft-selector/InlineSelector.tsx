import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, X, Filter } from 'lucide-react'
import { aircraftCatalog } from '@/data/aircraft-catalog'
import { hasAircraftBlueprint } from '@/data/aircraft-blueprints'
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
  const [cadFirst, setCadFirst] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selected = aircraftCatalog.find((a) => a.slug === selectedSlug)

  const filtered = useMemo(() => {
    let result = aircraftCatalog.filter((a) =>
      a.displayName.toLowerCase().includes(search.toLowerCase()) ||
      a.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase())
    )
    if (cadFirst) {
      result = [
        ...result.filter((a) => hasAircraftBlueprint(a.slug)),
        ...result.filter((a) => !hasAircraftBlueprint(a.slug)),
      ]
    }
    return result
  }, [search, cadFirst])

  // Flat list of all visible items for keyboard navigation
  const flatItems = useMemo(() => {
    if (cadFirst) return filtered
    const grouped = filtered.reduce(
      (acc, entry) => {
        const key = entry.manufacturer
        if (!acc[key]) acc[key] = []
        acc[key].push(entry)
        return acc
      },
      {} as Record<string, typeof filtered>
    )
    const items: typeof filtered = []
    Object.keys(grouped).sort().forEach((mfr) => {
      items.push(...grouped[mfr])
    })
    return items
  }, [filtered, cadFirst])

  const grouped = filtered.reduce(
    (acc, entry) => {
      const key = entry.manufacturer
      if (!acc[key]) acc[key] = []
      acc[key].push(entry)
      return acc
    },
    {} as Record<string, typeof filtered>
  )

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
        setHighlightIndex(-1)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  // Auto-focus search on open
  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      setHighlightIndex(-1)
    }
  }, [open])

  // Reset highlight when search changes
  useEffect(() => {
    setHighlightIndex(-1)
  }, [search])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-aircraft-item]')
      items[highlightIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightIndex])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => Math.min(prev + 1, flatItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && highlightIndex >= 0 && highlightIndex < flatItems.length) {
      e.preventDefault()
      onSelect(flatItems[highlightIndex].slug)
      setOpen(false)
      setSearch('')
      setHighlightIndex(-1)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setSearch('')
      setHighlightIndex(-1)
    }
  }

  function handleSelect(slug: string) {
    onSelect(slug)
    setOpen(false)
    setSearch('')
    setHighlightIndex(-1)
  }

  const textColor = accentColor === 'blue' ? 'text-blue-500' : 'text-red-500'
  const hoverColor = accentColor === 'blue' ? 'hover:text-blue-400' : 'hover:text-red-400'

  // Track flat index for highlighting
  let flatIndex = -1

  return (
    <div ref={containerRef} className={cn('relative flex w-full', align === 'right' ? 'justify-end' : 'justify-start')}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center justify-center gap-1 sm:gap-1.5 w-full py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer rounded-md border',
          textColor,
          hoverColor,
          accentColor === 'blue'
            ? 'border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5'
            : 'border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5'
        )}
      >
        <span className="truncate">{selected ? selected.displayName : 'Select...'}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 shrink-0 opacity-50 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className={cn(
          'absolute z-50 top-full mt-1 w-[calc(100vw-2rem)] sm:w-72 max-w-72 rounded-lg border border-border bg-popover shadow-xl max-h-80 overflow-hidden flex flex-col',
          align === 'right' ? 'right-0' : 'left-0'
        )}>
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              className={cn(
                'p-1 rounded transition-colors',
                cadFirst
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-muted-foreground/50 hover:text-muted-foreground'
              )}
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
          <div ref={listRef} className="overflow-y-auto flex-1">
            {cadFirst ? (
              // CAD-first mode: flat list, CAD aircraft at top
              <>
                {filtered.map((entry) => {
                  flatIndex++
                  const idx = flatIndex
                  const hasCad = hasAircraftBlueprint(entry.slug)
                  return (
                    <button
                      key={entry.slug}
                      data-aircraft-item
                      onClick={() => handleSelect(entry.slug)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center justify-between',
                        entry.slug === selectedSlug ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground',
                        idx === highlightIndex && 'bg-accent'
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        {entry.displayName}
                        {hasCad && (
                          <span className="text-[10px] font-bold leading-none px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">CAD</span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">{entry.category}</span>
                    </button>
                  )
                })}
              </>
            ) : (
              // Grouped by manufacturer (default)
              Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([manufacturer, entries]) => (
                <div key={manufacturer}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                    {manufacturer}
                  </div>
                  {entries.map((entry) => {
                    flatIndex++
                    const idx = flatIndex
                    return (
                      <button
                        key={entry.slug}
                        data-aircraft-item
                        onClick={() => handleSelect(entry.slug)}
                        className={cn(
                          'w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center justify-between',
                          entry.slug === selectedSlug ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground',
                          idx === highlightIndex && 'bg-accent'
                        )}
                      >
                        <span className="flex items-center gap-1.5">
                          {entry.displayName}
                          {hasAircraftBlueprint(entry.slug) && (
                            <span className="text-[10px] font-bold leading-none px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">CAD</span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">{entry.category}</span>
                      </button>
                    )
                  })}
                </div>
              ))
            )}
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
