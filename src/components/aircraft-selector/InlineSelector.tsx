import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, X, Filter } from 'lucide-react'
import { aircraftCatalog } from '@/data/aircraft-catalog'
import { hasAircraftBlueprint, hasFullBlueprint } from '@/data/aircraft-blueprints'
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
  const [cadFirst, setCadFirst] = useState(true)
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
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex(p => Math.min(p + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex(p => Math.max(p - 1, 0)) }
    else if (e.key === 'Enter' && highlightIndex >= 0) { e.preventDefault(); handleSelect(filtered[highlightIndex].slug) }
    else if (e.key === 'Escape') { setOpen(false); setSearch(''); setHighlightIndex(-1) }
  }

  function handleSelect(slug: string) {
    onSelect(slug); setOpen(false); setSearch(''); setHighlightIndex(-1)
  }

  const textColor = accentColor === 'blue' ? 'text-blue-500' : 'text-red-500'
  const hoverColor = accentColor === 'blue' ? 'hover:text-blue-400' : 'hover:text-red-400'

  return (
    <div ref={containerRef} className={cn('relative flex w-full', align === 'right' ? 'justify-end' : 'justify-start')}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center justify-center gap-1 sm:gap-1.5 w-full py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer rounded-md border',
          textColor, hoverColor,
          accentColor === 'blue'
            ? 'border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5'
            : 'border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5'
        )}
      >
        <span className="truncate">{selected ? selected.displayName : 'Select...'}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 shrink-0 opacity-50 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => { setOpen(false); setSearch(''); setHighlightIndex(-1) }}
          />
          {/* Panel */}
          <div className={cn(
            'fixed z-50 bottom-0 left-0 right-0',
            'sm:absolute sm:bottom-auto sm:top-full sm:mt-1 sm:left-1/2 sm:-translate-x-1/2',
            'w-full sm:w-[min(560px,90vw)]',
            'rounded-t-2xl sm:rounded-xl border border-border bg-popover shadow-2xl',
            'max-h-[75vh] sm:max-h-[420px] overflow-hidden flex flex-col',
          )}>
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
              <Search className="w-5 h-5 text-muted-foreground/40 shrink-0" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by name, type, or manufacturer..."
                className="flex-1 bg-transparent text-base sm:text-sm text-foreground outline-none placeholder:text-muted-foreground/30"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setCadFirst(!cadFirst)}
                title={cadFirst ? 'Show all' : 'CAD blueprints first'}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  cadFirst
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-muted-foreground/30 hover:text-muted-foreground/60'
                )}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Aircraft list */}
            <div ref={listRef} className="overflow-y-auto flex-1 py-1">
              {filtered.map((entry, idx) => {
                const hasCad = hasAircraftBlueprint(entry.slug)
                const isSelected = entry.slug === selectedSlug
                const catLabel =
                  entry.category === 'widebody' ? 'WB' :
                  entry.category === 'narrowbody' ? 'NB' :
                  entry.category === 'regional' ? 'RJ' :
                  entry.category === 'cargo' ? 'CG' :
                  entry.category === 'military' ? 'ML' :
                  entry.category === 'supersonic' ? 'SS' :
                  entry.category === 'turboprop' ? 'TP' :
                  entry.category === 'general-aviation' ? 'GA' : '??'

                return (
                  <button
                    key={entry.slug}
                    data-aircraft-item
                    onClick={() => handleSelect(entry.slug)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 sm:py-2 transition-all flex items-center gap-3 group',
                      isSelected
                        ? accentColor === 'blue' ? 'bg-blue-500/10' : 'bg-red-500/10'
                        : 'hover:bg-accent/50',
                      idx === highlightIndex && 'bg-accent/50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors',
                      isSelected
                        ? accentColor === 'blue' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                        : 'bg-muted/30 text-muted-foreground/40 group-hover:bg-muted/50'
                    )}>
                      {catLabel}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-sm font-medium truncate',
                          isSelected ? 'text-foreground' : 'text-foreground/80'
                        )}>
                          {entry.displayName}
                        </span>
                        {hasCad && (
                          <span className={cn(
                            'text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0',
                            hasFullBlueprint(entry.slug)
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          )}>CAD</span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground/35">{entry.manufacturer}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/25 capitalize shrink-0 hidden sm:block">
                      {entry.category}
                    </span>
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <div className="px-4 py-12 text-sm text-muted-foreground/40 text-center">
                  No aircraft found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
