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

    const hasGhost = !!ghostSil
    const isTopView = viewAngle === 'top'

    // ── Fixed canvas & padding ──────────────────────────────────────────
    // Same values for ALL view modes so toggling never resizes the container.
    const CANVAS_W = 900
    const CANVAS_H = 500

    // How many width-dimension lines stack above the aircraft (blue, red, +purple)
    const dimLineCount = hasGhost ? 3 : 2
    const DIM_LINE_GAP = 18
    // Space above aircraft for dimension lines + breathing room below ruler
    const TOP_PAD = RULER_MARGIN + 10 + dimLineCount * DIM_LINE_GAP + 12

    // Bottom bars: up to 3 stacked bars (19px each) + ground label
    const barCount = hasGhost ? 3 : 2
    const BOTTOM_PAD = 6 + barCount * 19 + 8

    // Right margin: room for height dim lines + labels
    const RIGHT_PAD = 60

    // Available drawing area (where aircraft actually go)
    const drawLeft = RULER_MARGIN
    const drawTop = TOP_PAD
    const drawW = CANVAS_W - drawLeft - RIGHT_PAD
    const drawH = CANVAS_H - drawTop - BOTTOM_PAD

    // ── Per-mode content metrics (meters) ───────────────────────────────
    let contentWidthM: number
    let contentHeightM: number

    if (viewMode === 'stacked') {
      contentWidthM = Math.max(sil1.widthM, sil2.widthM, ...(hasGhost ? [ghostSil.widthM] : []))
      contentHeightM = sil1.heightM + sil2.heightM + (hasGhost ? ghostSil.heightM : 0)
    } else if (viewMode === 'side-by-side') {
      contentWidthM = sil1.widthM + sil2.widthM + (hasGhost ? ghostSil.widthM : 0)
      contentHeightM = Math.max(sil1.heightM, sil2.heightM, ...(hasGhost ? [ghostSil.heightM] : []))
    } else {
      contentWidthM = Math.max(sil1.widthM, sil2.widthM, ...(hasGhost ? [ghostSil.widthM] : []))
      contentHeightM = Math.max(sil1.heightM, sil2.heightM, ...(hasGhost ? [ghostSil.heightM] : []))
    }

    // PPM that fits content inside the drawing area
    const ppm = Math.min(drawW / contentWidthM, drawH / contentHeightM)

    // Ground line: bottom of drawing area
    const groundY = drawTop + drawH

    // ── Position aircraft ───────────────────────────────────────────────
    let ac1X: number, ac1Y: number
    let ac2X: number, ac2Y: number
    let ghostPos: { x: number; y: number; opacity: number } | null = null
    let ac1Opacity = 1, ac2Opacity = 1

    if (viewMode === 'stacked') {
      const maxWidthPx = contentWidthM * ppm

      // Bottom to top: ac1, ac2, ghost
      ac1Y = groundY - sil1.heightM * ppm
      ac2Y = ac1Y - sil2.heightM * ppm

      const ac1WidthPx = sil1.widthM * ppm
      const ac2WidthPx = sil2.widthM * ppm
      ac1X = drawLeft
      ac2X = drawLeft
      if (stackAlignment === 'center') {
        ac1X = drawLeft + (maxWidthPx - ac1WidthPx) / 2
        ac2X = drawLeft + (maxWidthPx - ac2WidthPx) / 2
      } else if (stackAlignment === 'right') {
        ac1X = drawLeft + (maxWidthPx - ac1WidthPx)
        ac2X = drawLeft + (maxWidthPx - ac2WidthPx)
      }

      if (hasGhost) {
        const gWidthPx = ghostSil.widthM * ppm
        let gX = drawLeft
        if (stackAlignment === 'center') gX = drawLeft + (maxWidthPx - gWidthPx) / 2
        else if (stackAlignment === 'right') gX = drawLeft + (maxWidthPx - gWidthPx)
        const gY = ac2Y - ghostSil.heightM * ppm
        ghostPos = { x: gX, y: gY, opacity: 0.25 }
      }
    } else if (viewMode === 'side-by-side') {
      const SBS_GAP = 10 // px gap between aircraft
      ac1X = drawLeft
      ac1Y = groundY - sil1.heightM * ppm
      ac2X = ac1X + sil1.widthM * ppm + SBS_GAP
      ac2Y = groundY - sil2.heightM * ppm

      if (hasGhost) {
        const gX = ac2X + sil2.widthM * ppm + SBS_GAP
        const gY = groundY - ghostSil.heightM * ppm
        ghostPos = { x: gX, y: gY, opacity: 0.25 }
      }
    } else {
      // Overlay — center horizontally
      ac1Opacity = 0.55
      ac2Opacity = 0.55
      const centerX = drawLeft + drawW / 2
      ac1X = centerX - (sil1.widthM * ppm) / 2
      ac2X = centerX - (sil2.widthM * ppm) / 2

      if (isTopView) {
        const vertCenter = drawTop + drawH / 2
        ac1Y = vertCenter - (sil1.heightM * ppm) / 2
        ac2Y = vertCenter - (sil2.heightM * ppm) / 2
      } else {
        ac1Y = groundY - sil1.heightM * ppm
        ac2Y = groundY - sil2.heightM * ppm
      }

      if (hasGhost) {
        const gX = centerX - (ghostSil.widthM * ppm) / 2
        const gY = isTopView
          ? drawTop + drawH / 2 - (ghostSil.heightM * ppm) / 2
          : groundY - ghostSil.heightM * ppm
        ghostPos = { x: gX, y: gY, opacity: 0.25 }
      }
    }

    // labelRowY = top of the topmost aircraft (used to anchor width dim lines)
    const labelRowY = Math.min(ac1Y, ac2Y, ...(ghostPos ? [ghostPos.y] : []))

    // Fit canvas to actual content — no dead space.
    const rightEdges = [
      ac1X + sil1.widthM * ppm,
      ac2X + sil2.widthM * ppm,
      ...(ghostPos && ghostSil ? [ghostPos.x + ghostSil.widthM * ppm] : []),
    ]
    const fittedW = Math.ceil(Math.max(...rightEdges) + RIGHT_PAD)
    const fittedH = Math.ceil(groundY + BOTTOM_PAD)

    return {
      pixelsPerMeter: ppm,
      canvasWidth: fittedW,
      canvasHeight: fittedH,
      groundY,
      labelRowY,
      ac1: { x: ac1X, y: ac1Y, opacity: ac1Opacity },
      ac2: { x: ac2X, y: ac2Y, opacity: ac2Opacity },
      ghost: ghostPos,
    }
  }, [sil1, sil2, ghostSil, viewMode, viewAngle, stackAlignment, showMeasurements])

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

  const zoomBtn = 'p-2.5 sm:p-1.5 rounded-full transition-colors ' + (isDarkMode
    ? 'text-blue-400/40 hover:text-blue-300 hover:bg-white/5'
    : 'text-slate-400 hover:text-slate-600 hover:bg-black/5')

  return (
    <div className={`rounded-lg overflow-hidden ${isDarkMode ? 'border border-[#1e3a5f]' : 'border border-border'}`}>
      <div className="relative w-full" style={{ background: canvasBg, aspectRatio: `${layout.canvasWidth} / ${layout.canvasHeight}`, maxHeight: '55vh', minHeight: '300px' }}>
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
          minScale={1}
          maxScale={8}
          centerOnInit
          wheel={{ step: 0.08 }}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
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

              {/* Ground line (hidden in top view — no ground concept) */}
              {viewAngle !== 'top' && (
                <>
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
                </>
              )}

              {/* Ghost reference aircraft */}
              {ghostSpec && ghostSil && layout.ghost && (() => {
                const isStacked = viewMode === 'stacked'
                const isOverlayMode = viewMode === 'overlay'
                let ghostHeightDimX: number | undefined
                if (isStacked || isOverlayMode) {
                  const maxWidthPx = Math.max(sil1.widthM, sil2.widthM, ghostSil.widthM) * layout.pixelsPerMeter
                  const baseX = Math.min(layout.ac1.x, layout.ac2.x, layout.ghost.x) + maxWidthPx + 10
                  // Ghost always goes outermost (furthest right) — outside ac1 and ac2 brackets
                  ghostHeightDimX = (baseX + 36) - layout.ghost.x
                }
                return (
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
                    labelYOffset={isStacked
                      ? (Math.min(layout.ac2.y, layout.ghost.y) - 22 - 18 - 18) - layout.ghost.y
                      : isOverlayMode
                        ? layout.labelRowY - layout.ghost.y - 22 - 18 - 18
                        : layout.labelRowY - layout.ghost.y - 22
                    }
                    heightDimXOffset={ghostHeightDimX}
                  />
                )
              })()}

              {/* Aircraft silhouettes */}
              <AnimatePresence mode="sync">
                {(() => {
                  const ac1First = !isOverlay || sil1.widthM >= sil2.widthM
                  // Compute label offsets for width dimension lines
                  const labelPad = 22
                  const isStacked = viewMode === 'stacked'
                  // In stacked mode, both width dim lines sit above the top aircraft (ac2).
                  // Order top→bottom: red (ac2) line, blue (ac1) line, then ac2 image.
                  // Offsets are in local coords (relative to each aircraft's own y).
                  const dimLineGap = 18
                  let ac1LabelYOffset: number, ac2LabelYOffset: number
                  if (isStacked) {
                    // Width dim lines above topmost aircraft.
                    // Shorter measurement on outside (top), longer closer to aircraft (nested brackets).
                    const hasGhost = !!(ghostSil && layout.ghost)
                    const topY = hasGhost ? layout.ghost!.y : layout.ac2.y
                    const smallerIsAc1 = sil1.widthM <= sil2.widthM
                    const insideCanvasY = topY - labelPad          // closer to aircraft = larger
                    const outsideCanvasY = topY - labelPad - dimLineGap // further from aircraft = smaller
                    ac1LabelYOffset = (smallerIsAc1 ? outsideCanvasY : insideCanvasY) - layout.ac1.y
                    ac2LabelYOffset = (smallerIsAc1 ? insideCanvasY : outsideCanvasY) - layout.ac2.y
                  } else if (isOverlay) {
                    // Overlay: shorter on outside (top), longer closer to aircraft
                    const smallerIsAc1 = sil1.widthM <= sil2.widthM
                    ac1LabelYOffset = layout.labelRowY - layout.ac1.y - labelPad - (smallerIsAc1 ? dimLineGap : 0)
                    ac2LabelYOffset = layout.labelRowY - layout.ac2.y - labelPad - (smallerIsAc1 ? 0 : dimLineGap)
                  } else {
                    ac1LabelYOffset = layout.labelRowY - layout.ac1.y - labelPad
                    ac2LabelYOffset = layout.labelRowY - layout.ac2.y - labelPad
                  }

                  // In stacked mode, align all height dimension lines at the same X
                  // (based on the widest aircraft), so they form a contiguous vertical line
                  const isSideBySide = viewMode === 'side-by-side'
                  let ac1HeightDimX: number | undefined
                  let ac2HeightDimX: number | undefined
                  if (isStacked || isOverlay) {
                    const maxWidthPx = Math.max(sil1.widthM, sil2.widthM, ...(ghostSil ? [ghostSil.widthM] : [])) * layout.pixelsPerMeter
                    const innerX = Math.min(layout.ac1.x, layout.ac2.x) + maxWidthPx + 10
                    const outerX = innerX + 18
                    // Smaller height measurement on outside (further right), larger inside
                    const smallerIsAc1 = sil1.heightM <= sil2.heightM
                    ac1HeightDimX = (smallerIsAc1 ? outerX : innerX) - layout.ac1.x
                    ac2HeightDimX = (smallerIsAc1 ? innerX : outerX) - layout.ac2.x
                  }

                  // In side-by-side, AC1 height dim is drawn on the ruler axis (in ComparisonCanvas after AxisRulers)
                  const ac1HeightSide: 'left' | 'right' = 'right'
                  const ac1ShowHeightDim = !isSideBySide

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
                      showHeightDim={ac1ShowHeightDim}
                      showLengthBar={false}
                      lengthBarIndex={0}
                      labelYOffset={ac1LabelYOffset}
                      heightDimXOffset={ac1HeightDimX}
                      heightDimSide={ac1HeightSide}
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
                      showLengthBar={false}
                      lengthBarIndex={1}
                      labelYOffset={ac2LabelYOffset}
                      heightDimXOffset={ac2HeightDimX}
                    />,
                  ]
                  return ac1First ? silhouettes : [silhouettes[1], silhouettes[0]]
                })()}
              </AnimatePresence>

              {/* Dimension bars: name + dimensions below ground line (always visible) */}
              {(() => {
                const ppm = layout.pixelsPerMeter

                const isSideBySide = viewMode === 'side-by-side'
                // When bars are stacked (not side-by-side), order top→bottom: ghost purple, red, blue
                const ghostEntry = ghostSpec && ghostSil && layout.ghost
                  ? { name: ghostSpec.name, color: '#a78bfa', widthM: ghostSil.widthM, heightM: ghostSil.heightM, acX: layout.ghost.x }
                  : null
                const entries: { name: string; color: string; widthM: number; heightM: number; acX: number }[] = isSideBySide
                  ? [
                      { name: aircraft1.name, color: AIRCRAFT1_COLOR, widthM: sil1.widthM, heightM: sil1.heightM, acX: layout.ac1.x },
                      { name: aircraft2.name, color: AIRCRAFT2_COLOR, widthM: sil2.widthM, heightM: sil2.heightM, acX: layout.ac2.x },
                      ...(ghostEntry ? [ghostEntry] : []),
                    ]
                  : [
                      ...(ghostEntry ? [ghostEntry] : []),
                      // Smaller aircraft bar on top (closer to aircraft), larger on bottom
                      ...(sil1.widthM <= sil2.widthM
                        ? [
                            { name: aircraft1.name, color: AIRCRAFT1_COLOR, widthM: sil1.widthM, heightM: sil1.heightM, acX: layout.ac1.x },
                            { name: aircraft2.name, color: AIRCRAFT2_COLOR, widthM: sil2.widthM, heightM: sil2.heightM, acX: layout.ac2.x },
                          ]
                        : [
                            { name: aircraft2.name, color: AIRCRAFT2_COLOR, widthM: sil2.widthM, heightM: sil2.heightM, acX: layout.ac2.x },
                            { name: aircraft1.name, color: AIRCRAFT1_COLOR, widthM: sil1.widthM, heightM: sil1.heightM, acX: layout.ac1.x },
                          ]),
                    ]

                return (
                  <g>
                    {entries.map((e, i) => {
                      const barH = 16
                      const y = layout.groundY + 6 + (isSideBySide ? 0 : i * (barH + 3))
                      const lblText = `${e.name} · ${e.widthM.toFixed(1)} × ${e.heightM.toFixed(1)}m`
                      // In overlay, all bars left-align and span the widest aircraft
                      const maxWidthPx = Math.max(sil1.widthM, sil2.widthM) * ppm
                      const barW = isOverlay ? maxWidthPx : e.widthM * ppm
                      const x = isOverlay ? layout.ac1.x + ((sil1.widthM * ppm) - maxWidthPx) / 2 : e.acX
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

              {/* Combined height dimension removed per client request */}

              {/* Axis rulers (always visible, rendered on top) */}
              <AxisRulers
                width={layout.canvasWidth}
                height={layout.canvasHeight}
                pixelsPerMeter={layout.pixelsPerMeter}
                groundY={layout.groundY}
                isDark={isDarkMode}
              />

              {/* AC1 height dimension on the ruler axis (side-by-side only, drawn after rulers so it's visible) */}
              {showMeasurements && viewMode === 'side-by-side' && sil1 && (() => {
                const lineX = RULER_MARGIN
                const topY = layout.ac1.y
                const bottomY = layout.groundY
                const tickHalf = 5
                const midY = (topY + bottomY) / 2
                return (
                  <g opacity={0.8}>
                    <line x1={lineX} y1={topY} x2={lineX} y2={bottomY} stroke={AIRCRAFT1_COLOR} strokeWidth={0.8} />
                    <line x1={lineX - tickHalf} y1={topY} x2={lineX + tickHalf} y2={topY} stroke={AIRCRAFT1_COLOR} strokeWidth={0.8} />
                    <line x1={lineX - tickHalf} y1={bottomY} x2={lineX + tickHalf} y2={bottomY} stroke={AIRCRAFT1_COLOR} strokeWidth={0.8} />
                    <text
                      x={lineX}
                      y={midY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={AIRCRAFT1_COLOR}
                      fontSize={8}
                      fontWeight={600}
                      fontFamily={MONO_FONT}
                      transform={`rotate(-90, ${lineX}, ${midY})`}
                      paintOrder="stroke"
                      stroke={isDarkMode ? '#0a1929' : '#f8fafc'}
                      strokeWidth={3}
                      strokeLinejoin="round"
                    >
                      {sil1.heightM.toFixed(1)} m
                    </text>
                  </g>
                )
              })()}
            </svg>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  )
}
