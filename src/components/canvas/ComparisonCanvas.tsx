import { useRef, useMemo } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { AnimatePresence } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import type { AircraftSpec } from '@/types/aircraft'
import { useComparisonStore } from '@/stores/comparison-store'
import { useSilhouette } from '@/hooks/useSilhouette'
import { getAircraftImageUrl } from '@/data/aircraft-images'
import { AircraftSilhouette } from './AircraftSilhouette'
import { GhostAircraft } from './GhostAircraft'
import { useGhostAircraft } from '@/hooks/useGhostAircraft'

interface ComparisonCanvasProps {
  aircraft1: AircraftSpec
  aircraft2: AircraftSpec
}

const AIRCRAFT1_COLOR = '#60a5fa' // blue-400
const AIRCRAFT2_COLOR = '#f87171' // red-400

// Ruler margin size
const RULER_MARGIN = 32

// Graduated ruler grid with labeled edges
function RulerGrid({ width, height, pixelsPerMeter, groundY, isPhoto }: {
  width: number; height: number; pixelsPerMeter: number; groundY: number; isPhoto: boolean
}) {
  const elements: React.JSX.Element[] = []
  let key = 0

  // Pick nice step sizes based on zoom level
  const niceSteps = [1, 2, 5, 10, 20, 25, 50, 100]
  const minorStepM = niceSteps.find(s => s * pixelsPerMeter >= 30) || 10
  const majorStepM = minorStepM * (minorStepM >= 10 ? 5 : (minorStepM >= 5 ? 2 : 5))

  // Colors
  const rulerBg = isPhoto ? '#e2e8f0' : '#0d1f35'
  const rulerBorder = isPhoto ? '#cbd5e1' : '#1e4d7a'
  const tickColor = isPhoto ? '#64748b' : '#3b82f6'
  const labelColor = isPhoto ? '#475569' : '#60a5fa'
  const gridMinor = isPhoto ? 'rgba(100,116,139,0.06)' : 'rgba(30,77,122,0.3)'
  const gridMajor = isPhoto ? 'rgba(100,116,139,0.12)' : 'rgba(59,130,246,0.15)'
  const font = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace"

  // --- Ruler backgrounds ---
  elements.push(
    <rect key={key++} x={0} y={0} width={width} height={RULER_MARGIN}
      fill={rulerBg} />
  )
  elements.push(
    <rect key={key++} x={0} y={RULER_MARGIN} width={RULER_MARGIN} height={height - RULER_MARGIN}
      fill={rulerBg} />
  )
  elements.push(
    <rect key={key++} x={0} y={0} width={RULER_MARGIN} height={RULER_MARGIN}
      fill={rulerBg} />
  )
  elements.push(
    <line key={key++} x1={RULER_MARGIN} y1={0} x2={RULER_MARGIN} y2={height}
      stroke={rulerBorder} strokeWidth={0.5} />
  )
  elements.push(
    <line key={key++} x1={0} y1={RULER_MARGIN} x2={width} y2={RULER_MARGIN}
      stroke={rulerBorder} strokeWidth={0.5} />
  )

  // --- Horizontal ruler (top) ---
  for (let m = 0; m * pixelsPerMeter + RULER_MARGIN < width; m += minorStepM) {
    const x = RULER_MARGIN + m * pixelsPerMeter
    const isMajor = m % majorStepM === 0

    if (m > 0) {
      elements.push(
        <line key={key++} x1={x} y1={RULER_MARGIN} x2={x} y2={height}
          stroke={isMajor ? gridMajor : gridMinor} strokeWidth={isMajor ? 0.6 : 0.3} />
      )
    }

    const tickLen = isMajor ? 10 : 5
    elements.push(
      <line key={key++} x1={x} y1={RULER_MARGIN - tickLen} x2={x} y2={RULER_MARGIN}
        stroke={tickColor} strokeWidth={isMajor ? 0.8 : 0.4} opacity={isMajor ? 0.8 : 0.4} />
    )

    if (isMajor && m > 0) {
      elements.push(
        <text key={key++} x={x} y={RULER_MARGIN - tickLen - 3}
          textAnchor="middle" fill={labelColor} fontSize={7.5} fontFamily={font} opacity={0.9}>
          {m}m
        </text>
      )
    }
  }

  // --- Vertical ruler (left) ---
  for (let m = 0; groundY - m * pixelsPerMeter > RULER_MARGIN; m += minorStepM) {
    const y = groundY - m * pixelsPerMeter
    const isMajor = m % majorStepM === 0

    if (m > 0) {
      elements.push(
        <line key={key++} x1={RULER_MARGIN} y1={y} x2={width} y2={y}
          stroke={isMajor ? gridMajor : gridMinor} strokeWidth={isMajor ? 0.6 : 0.3} />
      )
    }

    const tickLen = isMajor ? 10 : 5
    elements.push(
      <line key={key++} x1={RULER_MARGIN - tickLen} y1={y} x2={RULER_MARGIN} y2={y}
        stroke={tickColor} strokeWidth={isMajor ? 0.8 : 0.4} opacity={isMajor ? 0.4 : 0.4} />
    )

    if (isMajor && m > 0) {
      elements.push(
        <text key={key++} x={RULER_MARGIN - tickLen - 2} y={y + 3}
          textAnchor="end" fill={labelColor} fontSize={7.5} fontFamily={font} opacity={0.9}>
          {m}m
        </text>
      )
    }
  }

  // Corner "m" label
  elements.push(
    <text key={key++} x={RULER_MARGIN / 2} y={RULER_MARGIN / 2 + 3}
      textAnchor="middle" fill={labelColor} fontSize={7} fontFamily={font} opacity={0.5}>
      m
    </text>
  )

  return <g>{elements}</g>
}

export function ComparisonCanvas({ aircraft1, aircraft2 }: ComparisonCanvasProps) {
  const transformRef = useRef<any>(null)
  const { viewMode, viewAngle, renderStyle, ghostAircraftSlug } = useComparisonStore()

  // Auto-fallback: photo mode only works for side view
  // Overlay mode forces blueprint — photos have inconsistent cropping that breaks alignment
  const effectiveRenderStyle =
    viewMode === 'overlay' ? 'blueprint' as const :
    (renderStyle === 'photo' && viewAngle === 'top') ? 'blueprint' as const :
    renderStyle

  const image1Url = viewAngle === 'side' ? getAircraftImageUrl(aircraft1.slug) : null
  const image2Url = viewAngle === 'side' ? getAircraftImageUrl(aircraft2.slug) : null

  const sil1 = useSilhouette(aircraft1, viewAngle)
  const sil2 = useSilhouette(aircraft2, viewAngle)

  // Ghost 3rd aircraft for reference
  const { data: ghostSpec } = useGhostAircraft(ghostAircraftSlug)

  const layout = useMemo(() => {
    if (!sil1 || !sil2) return null

    const canvasWidth = 900
    const padding = 80 + RULER_MARGIN / 2
    const startX = RULER_MARGIN + 8

    // Fixed canvas height — no more jarring jumps between modes
    const topPad = 30
    const bottomPad = 50
    const canvasHeight = 420 // consistent across all modes

    const maxWidth = Math.max(sil1.widthM, sil2.widthM)

    if (viewMode === 'stacked') {
      const vertGapM = 3
      const totalHeightM = sil1.heightM + sil2.heightM + vertGapM
      const scaleX = (canvasWidth - startX - padding) / maxWidth
      const scaleY = (canvasHeight - topPad - bottomPad) / totalHeightM
      const pixelsPerMeter = Math.min(scaleX, scaleY)
      const vertGapPx = vertGapM * pixelsPerMeter
      const ac2Y = topPad
      const ac1Y = ac2Y + sil2.heightM * pixelsPerMeter + vertGapPx
      const groundY = ac1Y + sil1.heightM * pixelsPerMeter

      return {
        pixelsPerMeter, canvasWidth, canvasHeight, groundY,
        ac1: { x: startX, y: ac1Y, opacity: 1 },
        ac2: { x: startX, y: ac2Y, opacity: 1 },
        refX: startX,
      }
    } else if (viewMode === 'side-by-side') {
      const maxHeight = Math.max(sil1.heightM, sil2.heightM)
      const totalWidth = sil1.widthM + sil2.widthM + 10
      const scaleX = (canvasWidth - padding * 2) / totalWidth
      const scaleY = (canvasHeight - topPad - bottomPad) / maxHeight
      const pixelsPerMeter = Math.min(scaleX, scaleY)
      const groundY = canvasHeight - bottomPad
      const ac1X = startX
      const ac1Y = groundY - sil1.heightM * pixelsPerMeter
      const gapPx = 10 * pixelsPerMeter
      const ac2X = ac1X + sil1.widthM * pixelsPerMeter + gapPx
      const ac2Y = groundY - sil2.heightM * pixelsPerMeter

      return {
        pixelsPerMeter, canvasWidth, canvasHeight, groundY,
        ac1: { x: ac1X, y: ac1Y, opacity: 1 },
        ac2: { x: ac2X, y: ac2Y, opacity: 1 },
        refX: ac1X,
      }
    } else {
      // Overlay mode
      const maxHeight = Math.max(sil1.heightM, sil2.heightM)
      const scaleX = (canvasWidth - startX - padding) / maxWidth
      const overlayBottom = bottomPad + 30 // extra room for length bars
      const scaleY = (canvasHeight - topPad - overlayBottom) / maxHeight
      const pixelsPerMeter = Math.min(scaleX, scaleY)
      const groundY = canvasHeight - overlayBottom
      const ac1Y = groundY - sil1.heightM * pixelsPerMeter
      const ac2Y = groundY - sil2.heightM * pixelsPerMeter

      return {
        pixelsPerMeter, canvasWidth, canvasHeight, groundY,
        ac1: { x: startX, y: ac1Y, opacity: 0.55 },
        ac2: { x: startX, y: ac2Y, opacity: 0.55 },
        refX: startX + maxWidth * pixelsPerMeter + 20,
      }
    }
  }, [sil1, sil2, viewMode])

  const isPhotoMode = effectiveRenderStyle === 'photo'
  const isOverlay = viewMode === 'overlay'

  if (!sil1 || !sil2 || !layout) {
    return (
      <div className={`rounded-lg border min-h-[400px] flex items-center justify-center ${isPhotoMode ? 'border-border bg-gray-50 text-gray-400' : 'border-border bg-[#0a1929] text-blue-300/60'}`}>
        No silhouette data available
      </div>
    )
  }

  const canvasBg = isPhotoMode
    ? 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
    : 'linear-gradient(180deg, #0d2137 0%, #0a1929 100%)'

  const groundColor = isPhotoMode ? '#94a3b8' : '#3b82f6'

  const zoomBtn = 'p-1.5 rounded-full transition-colors ' + (isPhotoMode
    ? 'text-slate-400 hover:text-slate-600 hover:bg-black/5'
    : 'text-blue-400/40 hover:text-blue-300 hover:bg-white/5')

  return (
    <div className={`rounded-lg overflow-hidden ${isPhotoMode ? 'border border-border' : 'border border-[#1e3a5f]'}`}>
      <div className="relative" style={{ background: canvasBg }}>
        {/* Floating zoom controls */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-0.5">
          <button onClick={() => transformRef.current?.zoomIn()} className={zoomBtn} title="Zoom in">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => transformRef.current?.zoomOut()} className={zoomBtn} title="Zoom out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={() => transformRef.current?.resetTransform()} className={zoomBtn} title="Reset">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.3}
          maxScale={8}
          centerOnInit
          wheel={{ step: 0.08 }}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: 'auto', aspectRatio: `${layout.canvasWidth} / ${layout.canvasHeight}` }}
            contentStyle={{ width: '100%', height: '100%' }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${layout.canvasWidth} ${layout.canvasHeight}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Graduated ruler grid */}
              <RulerGrid
                width={layout.canvasWidth}
                height={layout.canvasHeight}
                pixelsPerMeter={layout.pixelsPerMeter}
                groundY={layout.groundY}
                isPhoto={isPhotoMode}
              />

              {/* Ground line */}
              <line
                x1={RULER_MARGIN}
                y1={layout.groundY}
                x2={layout.canvasWidth}
                y2={layout.groundY}
                stroke={groundColor}
                strokeWidth={1}
                opacity={0.4}
              />
              <text
                x={layout.canvasWidth - 10}
                y={layout.groundY + 14}
                textAnchor="end"
                fill={groundColor}
                fillOpacity={0.4}
                fontSize={9}
                fontFamily="'JetBrains Mono', 'SF Mono', 'Fira Code', monospace"
              >
                GND · 0m
              </text>

              {/* Ghost reference aircraft */}
              {ghostSpec && (
                <GhostAircraft
                  spec={ghostSpec}
                  viewAngle={viewAngle}
                  renderStyle={effectiveRenderStyle}
                  pixelsPerMeter={layout.pixelsPerMeter}
                  groundY={layout.groundY}
                  x={layout.ac1.x}
                />
              )}

              {/* Aircraft silhouettes */}
              <AnimatePresence mode="wait">
                {/* In overlay, render the LARGER aircraft first (behind) for nice layering */}
                {(() => {
                  const ac1First = !isOverlay || sil1.widthM >= sil2.widthM
                  const silhouettes = [
                    <AircraftSilhouette
                      key={`ac1-${aircraft1.slug}-${viewAngle}-${effectiveRenderStyle}`}
                      silhouette={sil1}
                      x={layout.ac1.x}
                      y={layout.ac1.y}
                      pixelsPerMeter={layout.pixelsPerMeter}
                      color={AIRCRAFT1_COLOR}
                      opacity={layout.ac1.opacity}
                      label={aircraft1.name}
                      renderStyle={effectiveRenderStyle}
                      imageUrl={isOverlay ? null : image1Url}
                      labelYOffset={isOverlay ? -30 : -12}
                      showDimensions={true}
                      heightDimSide="right"
                      showLengthBar={isOverlay}
                      lengthBarIndex={0}
                    />,
                    <AircraftSilhouette
                      key={`ac2-${aircraft2.slug}-${viewAngle}-${effectiveRenderStyle}`}
                      silhouette={sil2}
                      x={layout.ac2.x}
                      y={layout.ac2.y}
                      pixelsPerMeter={layout.pixelsPerMeter}
                      color={AIRCRAFT2_COLOR}
                      opacity={layout.ac2.opacity}
                      label={aircraft2.name}
                      renderStyle={effectiveRenderStyle}
                      imageUrl={isOverlay ? null : image2Url}
                      labelYOffset={isOverlay ? -10 : -12}
                      showDimensions={true}
                      heightDimSide={viewMode === 'stacked' ? 'left' : isOverlay ? 'left' : 'right'}
                      showLengthBar={isOverlay}
                      lengthBarIndex={1}
                    />,
                  ]
                  return ac1First ? silhouettes : [silhouettes[1], silhouettes[0]]
                })()}
              </AnimatePresence>
            </svg>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  )
}
