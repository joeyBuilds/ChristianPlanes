import { useState, useMemo } from 'react'
import { Command } from 'cmdk'
import { Search, MapPin, X } from 'lucide-react'
import type { Airport } from '@/types/airport'
import { cn } from '@/lib/utils'

interface AirportSearchProps {
  airports: Airport[]
  selectedAirport: Airport | null
  onSelect: (airport: Airport | null) => void
}

export function AirportSearch({ airports, selectedAirport, onSelect }: AirportSearchProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return airports.slice(0, 50)
    const q = search.toLowerCase()
    return airports
      .filter(
        (a) =>
          a.iata.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q),
      )
      .slice(0, 50)
  }, [airports, search])

  if (selectedAirport) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 hover:bg-muted/60 border border-border/40 transition-colors text-sm"
        >
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-mono font-semibold">{selectedAirport.iata}</span>
          <span className="text-muted-foreground truncate max-w-[200px]">
            {selectedAirport.city}
          </span>
        </button>
        <button
          onClick={() => onSelect(null)}
          className="p-1 rounded hover:bg-muted/60 text-muted-foreground transition-colors"
          aria-label="Clear airport"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        {open && (
          <SearchDialog
            filtered={filtered}
            search={search}
            onSearchChange={setSearch}
            onSelect={(a) => {
              onSelect(a)
              setOpen(false)
              setSearch('')
            }}
            onClose={() => {
              setOpen(false)
              setSearch('')
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 hover:bg-muted/60 border border-border/40 border-dashed transition-colors text-sm text-muted-foreground"
        >
          <Search className="w-3.5 h-3.5" />
          Search airports...
        </button>
      ) : (
        <SearchDialog
          filtered={filtered}
          search={search}
          onSearchChange={setSearch}
          onSelect={(a) => {
            onSelect(a)
            setOpen(false)
            setSearch('')
          }}
          onClose={() => {
            setOpen(false)
            setSearch('')
          }}
        />
      )}
    </div>
  )
}

function SearchDialog({
  filtered,
  search,
  onSearchChange,
  onSelect,
  onClose,
}: {
  filtered: Airport[]
  search: string
  onSearchChange: (s: string) => void
  onSelect: (a: Airport) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false} className="flex flex-col">
          <div className="flex items-center gap-2 px-3 border-b border-border/40">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <Command.Input
              value={search}
              onValueChange={onSearchChange}
              placeholder="Search by IATA code, city, or name..."
              className="flex-1 py-2.5 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
              autoFocus
            />
          </div>
          <Command.List className="max-h-[280px] overflow-y-auto p-1">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No airports found.
            </Command.Empty>
            {filtered.map((airport) => (
              <Command.Item
                key={airport.iata}
                value={airport.iata}
                onSelect={() => onSelect(airport)}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer',
                  'data-[selected=true]:bg-muted/60',
                )}
              >
                <span className="font-mono font-semibold w-10 shrink-0 text-foreground">
                  {airport.iata}
                </span>
                <span className="truncate text-muted-foreground">
                  {airport.city}{airport.city && airport.country ? ', ' : ''}{airport.country}
                </span>
                <span className="truncate text-muted-foreground/50 text-xs ml-auto">
                  {airport.name}
                </span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
