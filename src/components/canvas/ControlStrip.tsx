import {
  Layers,
  ArrowLeftRight,
  Eye,
  EyeOff,
  Ruler,
  PenTool,
  Image,
} from 'lucide-react'
import { useComparisonStore } from '@/stores/comparison-store'
import { AircraftSelector } from '@/components/aircraft-selector/AircraftSelector'
import { cn } from '@/lib/utils'

interface ControlStripProps {
  aircraft1Slug: string | null
  aircraft2Slug: string | null
  onSelectAircraft1: (slug: string | null) => void
  onSelectAircraft2: (slug: string | null) => void
}

export function ControlStrip({
  aircraft1Slug,
  aircraft2Slug,
  onSelectAircraft1,
  onSelectAircraft2,
}: ControlStripProps) {
  const {
    viewMode,
    setViewMode,
    viewAngle,
    setViewAngle,
    showReferences,
    toggleReferences,
    renderStyle,
    setRenderStyle,
    unitSystem,
    setUnitSystem,
  } = useComparisonStore()

  const btn = 'p-1 rounded transition-colors flex items-center justify-center shrink-0'
  const btnActive = 'bg-blue-500/20 text-blue-400'
  const btnDim = 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
  const ico = 'w-3.5 h-3.5'
  const sep = 'w-px h-4 bg-slate-700/50 shrink-0'

  return (
    <div className="shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 bg-[#091525] border-y border-slate-800 relative z-10">
      {/* Aircraft selectors — capped width so buttons always fit */}
      <div className="flex items-center gap-1 min-w-0 flex-1 max-w-[60%]">
        <AircraftSelector
          label=""
          selectedSlug={aircraft1Slug}
          onSelect={onSelectAircraft1}
          accentColor="blue"
        />
        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest shrink-0">vs</span>
        <AircraftSelector
          label=""
          selectedSlug={aircraft2Slug}
          onSelect={onSelectAircraft2}
          accentColor="red"
        />
      </div>

      <div className={sep} />

      {/* Mode toggles */}
      <button
        onClick={() => setRenderStyle(renderStyle === 'blueprint' ? 'photo' : 'blueprint')}
        className={cn(btn, renderStyle === 'blueprint' ? btnActive : btnDim)}
        title={renderStyle === 'blueprint' ? 'Photo mode' : 'Blueprint mode'}
      >
        {renderStyle === 'blueprint' ? <PenTool className={ico} /> : <Image className={ico} />}
      </button>

      <button
        onClick={() => setViewMode(viewMode === 'side-by-side' ? 'overlay' : 'side-by-side')}
        className={cn(btn, viewMode === 'overlay' ? btnActive : btnDim)}
        title={viewMode === 'side-by-side' ? 'Overlay' : 'Side by side'}
      >
        {viewMode === 'side-by-side' ? <ArrowLeftRight className={ico} /> : <Layers className={ico} />}
      </button>

      <button
        onClick={() => setViewAngle(viewAngle === 'side' ? 'top' : 'side')}
        className={cn(btn, viewAngle === 'top' ? btnActive : btnDim)}
        title={viewAngle === 'side' ? 'Top view' : 'Side view'}
      >
        {viewAngle === 'side' ? <Eye className={ico} /> : <EyeOff className={ico} />}
      </button>

      <button
        onClick={toggleReferences}
        className={cn(btn, showReferences ? btnActive : btnDim)}
        title="References"
      >
        <Ruler className={ico} />
      </button>

      <div className={sep} />

      <button
        onClick={() => setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
        className={cn(btn, btnDim, 'text-[10px] font-mono font-bold px-1')}
        title={unitSystem === 'metric' ? 'Imperial' : 'Metric'}
      >
        {unitSystem === 'metric' ? 'M' : 'ft'}
      </button>
    </div>
  )
}
