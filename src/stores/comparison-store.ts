import { create } from 'zustand'
import type { ViewMode, ViewAngle, OverlayAlignment, UnitSystem, RenderStyle } from '@/types/canvas'

interface ComparisonState {
  aircraft1Slug: string | null
  aircraft2Slug: string | null
  viewMode: ViewMode
  viewAngle: ViewAngle
  overlayAlignment: OverlayAlignment
  unitSystem: UnitSystem
  showReferences: boolean
  renderStyle: RenderStyle
  ghostAircraftSlug: string | null

  setAircraft1: (slug: string | null) => void
  setAircraft2: (slug: string | null) => void
  setViewMode: (mode: ViewMode) => void
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
  unitSystem: 'metric',
  showReferences: false,
  renderStyle: 'photo',
  ghostAircraftSlug: null,

  setAircraft1: (slug) => set({ aircraft1Slug: slug }),
  setAircraft2: (slug) => set({ aircraft2Slug: slug }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setViewAngle: (angle) => set({ viewAngle: angle }),
  setOverlayAlignment: (alignment) => set({ overlayAlignment: alignment }),
  setUnitSystem: (system) => set({ unitSystem: system }),
  toggleReferences: () => set((s) => ({ showReferences: !s.showReferences })),
  setRenderStyle: (style) => set({ renderStyle: style }),
  setGhostAircraft: (slug) => set({ ghostAircraftSlug: slug }),
}))
