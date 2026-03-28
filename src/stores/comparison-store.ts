import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ViewMode, ViewAngle, OverlayAlignment, StackAlignment, UnitSystem } from '@/types/canvas'

const STACK_CYCLE: StackAlignment[] = ['left', 'center', 'right']

interface ComparisonState {
  aircraft1Slug: string | null
  aircraft2Slug: string | null
  viewMode: ViewMode
  viewAngle: ViewAngle
  overlayAlignment: OverlayAlignment
  stackAlignment: StackAlignment
  unitSystem: UnitSystem
  showReferences: boolean
  showMeasurements: boolean
  showGrid: boolean
  ghostAircraftSlug: string | null
  selectedAirportIata: string | null
  rangeMapExpanded: boolean

  setAircraft1: (slug: string | null) => void
  setAircraft2: (slug: string | null) => void
  setViewMode: (mode: ViewMode) => void
  cycleStackAlignment: () => void
  setViewAngle: (angle: ViewAngle) => void
  setOverlayAlignment: (alignment: OverlayAlignment) => void
  setUnitSystem: (system: UnitSystem) => void
  toggleReferences: () => void
  toggleMeasurements: () => void
  toggleGrid: () => void
  setGhostAircraft: (slug: string | null) => void
  setSelectedAirport: (iata: string | null) => void
  setRangeMapExpanded: (expanded: boolean) => void
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set) => ({
      aircraft1Slug: 'A220-100',
      aircraft2Slug: 'A320-200',
      viewMode: 'stacked',
      viewAngle: 'side',
      overlayAlignment: 'nose',
      stackAlignment: 'left',
      unitSystem: 'metric',
      showReferences: false,
      showMeasurements: true,
      showGrid: true,
      ghostAircraftSlug: null,
      selectedAirportIata: null,
      rangeMapExpanded: false,

      setAircraft1: (slug) => set({ aircraft1Slug: slug }),
      setAircraft2: (slug) => set({ aircraft2Slug: slug }),
      setViewMode: (mode) => set({ viewMode: mode }),
      cycleStackAlignment: () => set((s) => {
        const idx = STACK_CYCLE.indexOf(s.stackAlignment)
        return { stackAlignment: STACK_CYCLE[(idx + 1) % STACK_CYCLE.length] }
      }),
      setViewAngle: (angle) => set({ viewAngle: angle }),
      setOverlayAlignment: (alignment) => set({ overlayAlignment: alignment }),
      setUnitSystem: (system) => set({ unitSystem: system }),
      toggleReferences: () => set((s) => ({ showReferences: !s.showReferences })),
      toggleMeasurements: () => set((s) => ({ showMeasurements: !s.showMeasurements })),
      toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
      setGhostAircraft: (slug) => set({ ghostAircraftSlug: slug }),
      setSelectedAirport: (iata) => set({ selectedAirportIata: iata }),
      setRangeMapExpanded: (expanded) => set({ rangeMapExpanded: expanded }),
    }),
    {
      name: 'aircraft-compare-state',
      partialize: (state) => ({
        aircraft1Slug: state.aircraft1Slug,
        aircraft2Slug: state.aircraft2Slug,
        viewMode: state.viewMode,
        viewAngle: state.viewAngle,
        stackAlignment: state.stackAlignment,
        unitSystem: state.unitSystem,
        showMeasurements: state.showMeasurements,
        showGrid: state.showGrid,
        ghostAircraftSlug: state.ghostAircraftSlug,
        selectedAirportIata: state.selectedAirportIata,
      }),
    }
  )
)
