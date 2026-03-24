import { create } from 'zustand'
import type { ViewMode, ViewAngle, OverlayAlignment, StackAlignment, UnitSystem, RenderStyle } from '@/types/canvas'

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
  renderStyle: RenderStyle
  ghostAircraftSlug: string | null

  setAircraft1: (slug: string | null) => void
  setAircraft2: (slug: string | null) => void
  setViewMode: (mode: ViewMode) => void
  cycleStackAlignment: () => void
  setViewAngle: (angle: ViewAngle) => void
  setOverlayAlignment: (alignment: OverlayAlignment) => void
  setUnitSystem: (system: UnitSystem) => void
  toggleReferences: () => void
  setRenderStyle: (style: RenderStyle) => void
  setGhostAircraft: (slug: string | null) => void
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  aircraft1Slug: 'A220-100',
  aircraft2Slug: 'A320-200',
  viewMode: 'stacked',
  viewAngle: 'side',
  overlayAlignment: 'nose',
  stackAlignment: 'left',
  unitSystem: 'metric',
  showReferences: false,
  renderStyle: 'photo',
  ghostAircraftSlug: null,

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
  setRenderStyle: (style) => set({ renderStyle: style }),
  setGhostAircraft: (slug) => set({ ghostAircraftSlug: slug }),
}))
