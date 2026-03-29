import { type RefObject } from 'react'
import {
  Layers,
  ArrowLeftRight,
  AlignVerticalJustifyStart,
  Ruler,
  Grid3X3,
  Sun,
  Moon,
} from 'lucide-react'
import { useComparisonStore } from '@/stores/comparison-store'
import { useIsDarkMode } from '@/hooks/useIsDarkMode'
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
    stackAlignment,
    cycleStackAlignment,
    showMeasurements,
    toggleMeasurements,
    showGrid,
    toggleGrid,
    // renderStyle, toggleRenderStyle, // ready for render style toggle
    unitSystem,
    setUnitSystem,
  } = useComparisonStore()
  const isDarkMode = useIsDarkMode()

  const btn = 'p-2 sm:p-1.5 rounded-md transition-all cursor-pointer'
  const ico = 'w-4 h-4 sm:w-3.5 sm:h-3.5'

  const on = 'bg-blue-500/15 text-blue-400 border-blue-500/25'
  const off = 'text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-muted/40 border-transparent'
  const groupLabel = 'text-[8px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/30 mb-1 text-center'

  return (
    <div className="flex flex-wrap items-start justify-center gap-3 sm:gap-6 py-2 px-2">
      {/* ── View ── */}
      <div className="flex flex-col items-center">
        <span className={groupLabel}>Layout</span>
        <div className="flex items-center gap-0.5 rounded-lg border border-border/30 bg-muted/10 p-0.5">
          {/* Stacked button with alignment sub-mode indicator */}
          <div className="relative flex flex-col items-center">
            <button
              onClick={() => viewMode === 'stacked' ? cycleStackAlignment() : setViewMode('stacked')}
              className={cn(btn, 'border', viewMode === 'stacked' ? on : off)}
              title={viewMode === 'stacked' ? `Stacked · ${stackAlignment} (click to cycle)` : 'Stacked'}
            >
              <AlignVerticalJustifyStart className={cn(ico, 'transition-transform',
                viewMode === 'stacked' && stackAlignment === 'right' && 'scale-x-[-1]'
              )} />
            </button>
            {/* Alignment dots — only visible when stacked is active */}
            {viewMode === 'stacked' && (
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-[3px]">
                {(['left', 'center', 'right'] as const).map((a) => (
                  <span
                    key={a}
                    className={cn(
                      'block w-1 h-1 rounded-full transition-colors',
                      stackAlignment === a ? 'bg-blue-400' : 'bg-muted-foreground/25',
                    )}
                  />
                ))}
              </div>
            )}
          </div>
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

