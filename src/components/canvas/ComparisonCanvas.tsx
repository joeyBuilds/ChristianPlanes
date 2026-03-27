import { useRef, useMemo } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { AnimatePresence } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import type { AircraftSpec } from '@/types/aircraft'
import { useComparisonStore } from '@/stores/comparison-store'
import { useSilhouette } from '@/hooks/useSilhouette'
import { useIsDarkMode } from '@/hooks/useIsDarkMode'
import { getAircraftBlueprintUrl } from '@/data/aircraft-blueprints'
import { AircraftSilhouette } from './AircraftSilhouette'
import { GhostAircraft } from './GhostAircraft'
import { useGhostAircraft } from '@/hooks/useGhostAircraft'

interface ComparisonCanvasProps {
  aircraft1: AircraftSpec
  aircraft2: AircraftSpec
}

const AIRCRAFT1_COLOR = '#60a5fa' // blue-400
const AIRCRAFT2_COLOR = '#f87171' // red-400
const RULER_MARGIN = 32
const MONO_FONT = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace"

// Axis rulers — backgrounds, ticks, labels (always visible)
function AxisRulers({ width, height, pixelsPerMeter, groundY, isDark }: {
  width: number; height: number; pixelsPerMeter: number; groundY: number; isDark: boolean
}) {
  const elements: React.JSX.Element[] = []
  let key = 0

  const niceSteps = [1, 2, 5, 10, 20, 25, 50, 100]
  const minorStepM = niceSteps.find(s => s * pixelsPerMeter >= 30) || 10
  const majorStepM = minorStepM * (minorStepM >= 10 ? 5 : (minorStepM >= 5 ? 2 : 5))

  const rulerBg = isDark ? '#0d1f35' : '#e2e8f0'
  const rulerBorder = isDark ? '#1e4d7a' : '#cbd5e1'
  const tickColor = isDark ? '#3b82f6' : '#64748b'
  const labelColor = isDark ? '#60a5fa' : '#475569'
  const font = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace"

  // Ruler backgrounds
  elements.push(<rect key={key++} x={0} y={0} width={width} height={RULER_MARGIN} fill={rulerBg} />)
  elements.push(<rect key={key++} x={0} y={RULER_MARGIN} width={RULER_MARGIN} height={height - RULER_MARGIN} fill={rulerBg} />)
  elements.push(<rect key={key++} x={0} y={0} width={RULER_MARGIN} height={RULER_MARGIN} fill={rulerBg} />)
  elements.push(<line key={key++} x1={RULER_MARGIN} y1={0} x2={RULER_MARGIN} y2={height} stroke={rulerBorder} strokeWidth={0.5} />)
  elements.push(<line key={key++} x1={0} y1={RULER_MARGIN} x2={width} y2={RULER_MARGIN} stroke={rulerBorder} strokeWidth={0.5} />)

  // Horizontal ticks + labels
  for (let m = 0; m * pixelsPerMeter + RULER_MARGIN < width; m += minorStepM) {
    const x = RULER_MARGIN + m * pixelsPerMeter
    const isMajor = m % majorStepM === 0
    const tickLen = isMajor ? 10 : 5
    elements.push(<line key={key++} x1={x} y1={RULER_MARGIN - tickLen} x2={x} y2={RULER_MARGIN}
      stroke={tickColor} strokeWidth={isMajor ? 0.8 : 0.4} opacity={isMajor ? 0.8 : 0.4} />)
    if (isMajor && m > 0) {
      elements.push(<text key={key++} x={x} y={RULER_MARGIN - tickLen - 3}
        textAnchor="middle" fill={labelColor} fontSize={7.5} fontFamily={font} opacity={0.9}>{m}m</text>)
    }
  }

  // Vertical ticks + labels
  for (let m = 0; groundY - m * pixelsPerMeter > RULER_MARGIN; m += minorStepM) {
    const y = groundY - m * pixelsPerMeter
    const isMajor = m % majorStepM === 0
    const tickLen = isMajor ? 10 : 5
    elements.push(<line key={key++} x1={RULER_MARGIN - tickLen} y1={y} x2={RULER_MARGIN} y2={y}
      stroke={tickColor} strokeWidth={isMajor ? 0.8 : 0.4} opacity={isMajor ? 0.4 : 0.4} />)
    if (isMajor && m > 0) {
      elements.push(<text key={key++} x={RULER_MARGIN - tickLen - 2} y={y + 3}
        textAnchor="end" fill={labelColor} fontSize={7.5} fontFamily={font} opacity={0.9}>{m}m</text>)
    }
  }

  // Corner label
  elements.push(<text key={key++} x={RULER_MARGIN / 2} y={RULER_MARGIN / 2 + 3}
    textAnchor="middle" fill={labelColor} fontSize={7} fontFamily={font} opacity={0.5}>m</text>)

  return <g>{elements}</g>
}

// Background grid lines only (togglable)
function GridLines({ width, height, pixelsPerMeter, groundY, isDark }: {
  width: number; height: number; pixelsPerMeter: number; groundY: number; isDark: boolean
}) {
  const elements: React.JSX.Element[] = []
  let key = 0

  const niceSteps = [1, 2, 5, 10, 20, 25, 50, 100]
  const minorStepM = niceSteps.find(s => s * pixelsPerMeter >= 30) || 10
  const majorStepM = minorStepM * (minorStepM >= 10 ? 5 : (minorStepM >= 5 ? 2 : 5))

  const gridMinor = isDark ? 'rgba(30,77,122,0.3)' : 'rgba(100,116,139,0.06)'
  const gridMajor = isDark ? 'rgba(59,130,246,0.15)' : 'rgba(100,116,139,0.12)'

  // Horizontal grid lines
  for (let m = minorStepM; m * pixelsPerMeter + RULER_MARGIN < width; m += minorStepM) {
    const x = RULER_MARGIN + m * pixelsPerMeter
    const isMajor = m % majorStepM === 0
    elements.push(<line key={key++} x1={x} y1={RULER_MARGIN} x2={x} y2={height}
      stroke={isMajor ? gridMajor : gridMinor} strokeWidth={isMajor ? 0.6 : 0.3} />)
  }

  // Vertical grid lines
  for (let m = minorStepM; groundY - m * pixelsPerMeter > RULER_MARGIN; m += minorStepM) {
    const y = groundY - m * pixelsPerMeter
    const isMajor = m % majorStepM === 0
    elements.push(<line key={key++} x1={RULER_MARGIN} y1={y} x2={width} y2={y}
      stroke={isMajor ? gridMajor : gridMinor} strokeWidth={isMajor ? 0.6 : 0.3} />)
  }

  return <g>{elements}</g>
}

export function ComparisonCanvas({ aircraft1, aircraft2 }: ComparisonCanvasProps) {
  const transformRef = useRef<any>(null)
  const { viewMode, viewAngle, ghostAircraftSlug, stackAlignment, showMeasurements, showGrid } = useComparisonStore()
  const isDarkMode = useIsDarkMode()

  const blueprint1Url = getAircraftBlueprintUrl(aircraft1.slug, viewAngle)
  const blueprint2Url = getAircraftBlueprintUrl(aircraft2.slug, viewAngle)

  const sil1 = useSilhouette(aircraft1, viewAngle)
  const sil2 = useSilhouette(aircraft2, viewAngle)

  const { data: ghostSpec } = useGhostAircraft(ghostAircraftSlug)
  const ghostSil = useSilhouette(ghostSpec, viewAngle)

  const layout = useMemo(() => {
    if (!sil1 || !sil2) return null

    const canvasWidth = 900
    const padding = 80 + RULER_MARGIN / 2
    const startX = RULER_MARGIN + 8
    const topPad = 30
    const bottomPad = 50
    const hasGhost = !!ghostSil

    // Strategy: use width to determine scale, compute height to fit content.
    // Ground always at bottom. Clamp aspect ratio to reasonable range.

    if (viewMode === 'stacked') {
      const vertGapM = 3
      const allHeights = [sil1.heightM, sil2.heightM, ...(hasGhost ? [ghostSil.heightM] : [])]
      const gaps = hasGhost ? 2 : 1
      const totalHeightM = allHeights.reduce((a, b) => a + b, 0) + gaps * vertGapM
      const maxWidth = Math.max(sil1.widthM, sil2.widthM, ...(hasGhost ? [ghostSil.widthM] : []))

      const pixelsPerMeter = (canvasWidth - startX - padding) / maxWidth
      const contentH = totalHeightM * pixelsPerMeter
      const canvasHeight = Math.max(300, Math.min(600, topPad + contentH + bottomPad))

      // Recompute with final height to ensure content fits
      const finalPPM = Math.min(pixelsPerMeter, (canvasHeight - topPad - bottomPad) / totalHeightM)
      const vertGapPx = vertGapM * finalPPM
      const maxWidthPx = maxWidth * finalPPM

      const groundY = canvasHeight - bottomPad

      // Bottom to top: ac1 (bottom), ac2, ghost (top)
      const ac1Y = groundY - sil1.heightM * finalPPM
      const ac2Y = ac1Y - vertGapPx - sil2.heightM * finalPPM

      const ac1WidthPx = sil1.widthM * finalPPM
      const ac2WidthPx = sil2.widthM * finalPPM
      let ac1X = startX, ac2X = startX
      if (stackAlignment === 'center') {
        ac1X = startX + (maxWidthPx - ac1WidthPx) / 2
        ac2X = startX + (maxWidthPx - ac2WidthPx) / 2
      } else if (stackAlignment === 'right') {
        ac1X = startX + (maxWidthPx - ac1WidthPx)
        ac2X = startX + (maxWidthPx - ac2WidthPx)
      }

      let ghostPos = null
      if (hasGhost) {
        const gWidthPx = ghostSil.widthM * finalPPM
        let gX = startX
        if (stackAlignment === 'center') gX = startX + (maxWidthPx - gWidthPx) / 2
        else if (stackAlignment === 'right') gX = startX + (maxWidthPx - gWidthPx)
        const gY = ac2Y - vertGapPx - ghostSil.heightM * finalPPM
        ghostPos = { x: gX, y: gY, opacity: 0.25 }
      }

      const labelRowY = Math.min(ac1Y, ac2Y, ...(ghostPos ? [ghostPos.y] : []))

      return {
        pixelsPerMeter: finalPPM, canvasWidth, canvasHeight, groundY, labelRowY,
        ac1: { x: ac1X, y: ac1Y, opacity: 1 },
        ac2: { x: ac2X, y: ac2Y, opacity: 1 },
        ghost: ghostPos,
      }
    } else if (viewMode === 'side-by-side') {
      const gapM = 10
      const allWidths = sil1.widthM + sil2.widthM + (hasGhost ? ghostSil.widthM + gapM : 0) + gapM
      const maxHeight = Math.max(sil1.heightM, sil2.heightM, ...(hasGhost ? [ghostSil.heightM] : []))

      const pixelsPerMeter = (canvasWidth - padding * 2) / allWidths
      const contentH = maxHeight * pixelsPerMeter
      const canvasHeight = Math.max(300, Math.min(600, topPad + contentH + bottomPad))
      const finalPPM = Math.min(pixelsPerMeter, (canvasHeight - topPad - bottomPad) / maxHeight)

      const groundY = canvasHeight - bottomPad
      const gapPx = gapM * finalPPM

      const ac1X = startX
      const ac1Y = groundY - sil1.heightM * finalPPM
      const ac2X = ac1X + sil1.widthM * finalPPM + gapPx
      const ac2Y = groundY - sil2.heightM * finalPPM

      let ghostPos = null
      if (hasGhost) {
        const gX = ac2X + sil2.widthM * finalPPM + gapPx
        const gY = groundY - ghostSil.heightM * finalPPM
        ghostPos = { x: gX, y: gY, opacity: 0.25 }
      }

      const labelRowY = Math.min(ac1Y, ac2Y, ...(ghostPos ? [ghostPos.y] : []))

      return {
        pixelsPerMeter: finalPPM, canvasWidth, canvasHeight, groundY, labelRowY,
        ac1: { x: ac1X, y: ac1Y, opacity: 1 },
        ac2: { x: ac2X, y: ac2Y, opacity: 1 },
        ghost: ghostPos,
      }
    } else {
      // Overlay — center-aligned by fuselage midpoint, ground at bottom
      const allWidths = [sil1.widthM, sil2.widthM, ...(hasGhost ? [ghostSil.widthM] : [])]
      const allHeights = [sil1.heightM, sil2.heightM, ...(hasGhost ? [ghostSil.heightM] : [])]
      const maxWidth = Math.max(...allWidths)
      const maxHeight = Math.max(...allHeights)

      const overlayBottom = bottomPad + 30 + (hasGhost ? 19 : 0)
      const pixelsPerMeter = (canvasWidth - startX - padding) / maxWidth
      const contentH = maxHeight * pixelsPerMeter
      const canvasHeight = Math.max(300, Math.min(600, topPad + contentH + overlayBottom))
      const finalPPM = Math.min(pixelsPerMeter, (canvasHeight - topPad - overlayBottom) / maxHeight)

      const groundY = canvasHeight - overlayBottom

      const availableWidth = canvasWidth - RULER_MARGIN - padding
      const centerX = RULER_MARGIN + availableWidth / 2

      const ac1X = centerX - (sil1.widthM * finalPPM) / 2
      const ac1Y = groundY - sil1.heightM * finalPPM
      const ac2X = centerX - (sil2.widthM * finalPPM) / 2
      const ac2Y = groundY - sil2.heightM * finalPPM

      let ghostPos = null
      if (hasGhost) {
        const gX = centerX - (ghostSil.widthM * finalPPM) / 2
        const gY = groundY - ghostSil.heightM * finalPPM
        ghostPos = { x: gX, y: gY, opacity: 0.25 }
      }

      const labelRowY = Math.min(ac1Y, ac2Y, ...(ghostPos ? [ghostPos.y] : []))

      return {
        pixelsPerMeter: finalPPM, canvasWidth, canvasHeight, groundY, labelRowY,
        ac1: { x: ac1X, y: ac1Y, opacity: 0.55 },
        ac2: { x: ac2X, y: ac2Y, opacity: 0.55 },
        ghost: ghostPos,
      }
    }
  }, [sil1, sil2, ghostSil, viewMode, stackAlignment])

  const isOverlay = viewMode === 'overlay'

  if (!sil1 || !sil2 || !layout) {
    return (
      <div className={`rounded-lg border min-h-[400px] flex items-center justify-center ${isDarkMode ? 'border-border bg-[#0a1929] text-blue-300/60' : 'border-border bg-gray-50 text-gray-400'}`}>
        No silhouette data available
      </div>
    )
  }

  const canvasBg = isDarkMode
    ? 'linear-gradient(180deg, #0d2137 0%, #0a1929 100%)'
    : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'

  const groundColor = isDarkMode ? '#3b82f6' : '#94a3b8'

  const zoomBtn = 'p-1.5 rounded-full transition-colors ' + (isDarkMode
    ? 'text-blue-400/40 hover:text-blue-300 hover:bg-white/5'
    : 'text-slate-400 hover:text-slate-600 hover:bg-black/5')

  return (
    <div className={`rounded-lg overflow-hidden ${isDarkMode ? 'border border-[#1e3a5f]' : 'border border-border'}`}>
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
              {/* Background grid lines (togglable) */}
              {showGrid && (
                <GridLines
                  width={layout.canvasWidth}
                  height={layout.canvasHeight}
                  pixelsPerMeter={layout.pixelsPerMeter}
                  groundY={layout.groundY}
                  isDark={isDarkMode}
                />
              )}

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
                fontFamily={MONO_FONT}
              >
                GND · 0m
              </text>

              {/* Ghost reference aircraft */}
              {ghostSpec && layout.ghost && (
                <GhostAircraft
                  spec={ghostSpec}
                  viewAngle={viewAngle}
                  pixelsPerMeter={layout.pixelsPerMeter}
                  x={layout.ghost.x}
                  y={layout.ghost.y}
                  opacity={layout.ghost.opacity}
                  isDarkMode={isDarkMode}
                  showDimensions={showMeasurements}
                  showLengthBar={isOverlay}
                  lengthBarIndex={2}
                  labelYOffset={layout.labelRowY - layout.ghost.y - 22}
                />
              )}

              {/* Aircraft silhouettes */}
              <AnimatePresence mode="wait">
                {(() => {
                  const ac1First = !isOverlay || sil1.widthM >= sil2.widthM
                  // Compute label offsets so all name tags sit on the same row
                  const labelPad = 22
                  const ac1LabelYOffset = layout.labelRowY - layout.ac1.y - labelPad
                  const ac2LabelYOffset = layout.labelRowY - layout.ac2.y - labelPad
                  const silhouettes = [
                    <AircraftSilhouette
                      key={`ac1-${aircraft1.slug}-${viewAngle}`}
                      silhouette={sil1}
                      x={layout.ac1.x}
                      y={layout.ac1.y}
                      pixelsPerMeter={layout.pixelsPerMeter}
                      color={AIRCRAFT1_COLOR}
                      opacity={layout.ac1.opacity}
                      label={aircraft1.name}
                      blueprintUrl={blueprint1Url}
                      isDarkMode={isDarkMode}
                      showDimensions={showMeasurements}
                      showLengthBar={isOverlay}
                      lengthBarIndex={0}
                      labelYOffset={ac1LabelYOffset}
                    />,
                    <AircraftSilhouette
                      key={`ac2-${aircraft2.slug}-${viewAngle}`}
                      silhouette={sil2}
                      x={layout.ac2.x}
                      y={layout.ac2.y}
                      pixelsPerMeter={layout.pixelsPerMeter}
                      color={AIRCRAFT2_COLOR}
                      opacity={layout.ac2.opacity}
                      label={aircraft2.name}
                      blueprintUrl={blueprint2Url}
                      isDarkMode={isDarkMode}
                      showDimensions={showMeasurements}
                      showLengthBar={isOverlay}
                      lengthBarIndex={1}
                      labelYOffset={ac2LabelYOffset}
                    />,
                  ]
                  return ac1First ? silhouettes : [silhouettes[1], silhouettes[0]]
                })()}
              </AnimatePresence>

              {/* Dimension bars: width below GND, height alongside aircraft */}
              {showMeasurements && !isOverlay && (() => {
                const ppm = layout.pixelsPerMeter

                const entries: { name: string; color: string; widthM: number; heightM: number; acX: number }[] = [
                  { name: aircraft1.name, color: AIRCRAFT1_COLOR, widthM: sil1.widthM, heightM: sil1.heightM, acX: layout.ac1.x },
                  { name: aircraft2.name, color: AIRCRAFT2_COLOR, widthM: sil2.widthM, heightM: sil2.heightM, acX: layout.ac2.x },
                ]
                if (ghostSpec && ghostSil && layout.ghost) {
                  entries.push({ name: ghostSpec.name, color: '#a78bfa', widthM: ghostSil.widthM, heightM: ghostSil.heightM, acX: layout.ghost.x })
                }

                return (
                  <g>
                    {entries.map((e, i) => {
                      const barW = e.widthM * ppm
                      const barH = 16
                      const isSideBySide = viewMode === 'side-by-side'
                      const y = layout.groundY + 6 + (isSideBySide ? 0 : i * (barH + 3))
                      const lblText = `${e.name}    ${e.widthM.toFixed(1)} m`
                      const x = e.acX
                      return (
                        <g key={`wb-${i}`} opacity={0.85}>
                          <rect x={x} y={y} width={barW} height={barH} rx={2}
                            fill={e.color} fillOpacity={0.3} />
                          <text x={x + barW / 2} y={y + barH / 2 + 1}
                            textAnchor="middle" dominantBaseline="middle"
                            fill={e.color} fontSize={9} fontWeight={600}
                            fontFamily={MONO_FONT}>
                            {lblText}
                          </text>
                        </g>
                      )
                    })}
                  </g>
                )
              })()}

              {/* Axis rulers (always visible, rendered on top) */}
              <AxisRulers
                width={layout.canvasWidth}
                height={layout.canvasHeight}
                pixelsPerMeter={layout.pixelsPerMeter}
                groundY={layout.groundY}
                isDark={isDarkMode}
              />
            </svg>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  )
}
