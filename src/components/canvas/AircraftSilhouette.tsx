import { useState } from 'react'
import { motion } from 'framer-motion'
import type { SilhouetteData } from '@/lib/silhouette-generator'

interface AircraftSilhouetteProps {
  silhouette: SilhouetteData
  x: number
  y: number
  pixelsPerMeter: number
  color: string
  opacity?: number
  label: string
  /** URL to a real CAD-exported SVG blueprint (from bigNuts collection) */
  blueprintUrl?: string | null
  isDarkMode?: boolean
  labelYOffset?: number
  showDimensions?: boolean
  /** Override to hide the height dimension line (e.g. when drawn externally) */
  showHeightDim?: boolean
  heightDimSide?: 'left' | 'right'
  /** Show a colored length bar below the aircraft (reference-image style) */
  showLengthBar?: boolean
  /** Vertical offset for length bar when multiple bars are stacked */
  lengthBarIndex?: number
  /** Override the X position of the height dimension line (in local coords). Used to align lines in stacked view. */
  heightDimXOffset?: number
  /** Current view angle — used to adjust rendering for top view */
  viewAngle?: 'side' | 'top' | 'front'
  onHover?: (hovered: boolean) => void
}

export function AircraftSilhouette({
  silhouette,
  x,
  y,
  pixelsPerMeter,
  color,
  opacity = 1,
  label,
  blueprintUrl,
  isDarkMode = true,
  labelYOffset = -12,
  showDimensions = false,
  showHeightDim,
  heightDimSide = 'right',
  showLengthBar = false,
  lengthBarIndex = 0,
  heightDimXOffset,
  viewAngle = 'side',
  onHover,
}: AircraftSilhouetteProps) {
  const [hovered, setHovered] = useState(false)
  const [, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const width = silhouette.widthM * pixelsPerMeter
  const height = silhouette.heightM * pixelsPerMeter

  const handleHover = (val: boolean) => {
    setHovered(val)
    onHover?.(val)
  }

  const useRealBlueprint = blueprintUrl && !imageError
  const monoFont = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace"

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <g
        transform={`translate(${x}, ${y})`}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        style={{ cursor: 'pointer' }}
      >
        {useRealBlueprint ? (
          <>
            {/* Real CAD blueprint SVG mode — uses actual technical drawings */}
            <image
              href={blueprintUrl!}
              x={0}
              y={0}
              width={width}
              height={height}
              preserveAspectRatio="none"
              opacity={opacity}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{
                filter: `brightness(0) saturate(100%) invert(1) opacity(${opacity * 0.85})`,
                transition: 'filter 0.2s',
              }}
            />
            {/* "CAD" badge to indicate real blueprint — only when measurements on */}
            {showDimensions && <g opacity={0.6}>
              <rect
                x={width - 32}
                y={height - 14}
                width={28}
                height={12}
                rx={2}
                fill={isDarkMode ? '#0a1929' : 'rgba(255,255,255,0.85)'}
                fillOpacity={0.7}
                stroke={color}
                strokeWidth={0.3}
                strokeOpacity={0.3}
              />
              <text
                x={width - 18}
                y={height - 5.5}
                textAnchor="middle"
                fill={color}
                fontSize={6.5}
                fontWeight={600}
                fontFamily={monoFont}
              >
                CAD
              </text>
            </g>}
          </>
        ) : (
          <>
            {/* Blueprint/SVG mode — procedural generation */}
            <svg
              viewBox={silhouette.viewBox}
              width={width}
              height={height}
              overflow="visible"
            >
              {/* Fill layer */}
              <path
                d={silhouette.path}
                fill={color}
                fillOpacity={opacity < 1 ? opacity * 0.55 : opacity * 0.15}
                stroke="none"
              />
              {/* Outline layer - the technical drawing line */}
              <path
                d={silhouette.path}
                fill="none"
                stroke={color}
                strokeWidth={hovered ? 0.6 : 0.4}
                strokeOpacity={opacity * 0.9}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Detail layer — windows, doors, engine fans, cockpit */}
              {silhouette.detailPath && (
                <path
                  d={silhouette.detailPath}
                  fill={color}
                  fillOpacity={opacity * 0.12}
                  stroke={color}
                  strokeWidth={0.15}
                  strokeOpacity={opacity * 0.45}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </>
        )}

        {/* Height dimension — vertical bar on the configured side */}
        {showDimensions && (showHeightDim ?? true) && (
          <g opacity={0.8}>
            {(() => {
              const lineX = heightDimXOffset != null ? heightDimXOffset : (heightDimSide === 'right' ? width + 10 : -10)
              const tickHalf = 5
              const tickX1 = lineX - tickHalf
              const tickX2 = lineX + tickHalf
              const midY = height / 2
              return (
                <>
                  <line x1={lineX} y1={0} x2={lineX} y2={height} stroke={color} strokeWidth={0.8} />
                  <line x1={tickX1} y1={0} x2={tickX2} y2={0} stroke={color} strokeWidth={0.8} />
                  <line x1={tickX1} y1={height} x2={tickX2} y2={height} stroke={color} strokeWidth={0.8} />
                  {/* Height label — rotated vertically along the line */}
                  <text
                    x={lineX}
                    y={midY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={color}
                    fontSize={8}
                    fontWeight={600}
                    fontFamily={monoFont}
                    transform={`rotate(-90, ${lineX}, ${midY})`}
                    paintOrder="stroke"
                    stroke={isDarkMode ? '#0a1929' : '#f8fafc'}
                    strokeWidth={3}
                    strokeLinejoin="round"
                  >
                    {silhouette.heightM.toFixed(1)} m
                  </text>
                </>
              )
            })()}
          </g>
        )}

        {/* Width dimension — removed floating pill, now handled by bottom bars in ComparisonCanvas */}

        {/* Length bar below the aircraft (reference-image style) */}
        {showLengthBar && (
          <g opacity={0.85}>
            {(() => {
              const barH = 16
              const barY = height + 6 + lengthBarIndex * (barH + 3)
              const labelText = `${label}    ${silhouette.widthM.toFixed(1)} m`
              return (
                <>
                  <rect x={0} y={barY} width={width} height={barH} rx={2}
                    fill={color} fillOpacity={0.3} />
                  <text x={width / 2} y={barY + barH / 2 + 1} textAnchor="middle"
                    dominantBaseline="middle" fill={color} fontSize={9} fontWeight={600}
                    fontFamily={monoFont}>
                    {labelText}
                  </text>
                </>
              )
            })()}
          </g>
        )}

        {/* Width/length dimension line above aircraft (thin line with ticks, matching height dim style) */}
        {!showLengthBar && showDimensions && (() => {
          const lineY = labelYOffset + 8
          const tickHalf = 5
          const tickY1 = lineY - tickHalf
          const tickY2 = lineY + tickHalf
          const midX = width / 2
          return (
            <g opacity={0.8}>
              <line x1={0} y1={lineY} x2={width} y2={lineY} stroke={color} strokeWidth={0.8} />
              <line x1={0} y1={tickY1} x2={0} y2={tickY2} stroke={color} strokeWidth={0.8} />
              <line x1={width} y1={tickY1} x2={width} y2={tickY2} stroke={color} strokeWidth={0.8} />
              <text
                x={midX}
                y={lineY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontSize={8}
                fontWeight={600}
                fontFamily={monoFont}
                paintOrder="stroke"
                stroke={isDarkMode ? '#0a1929' : '#f8fafc'}
                strokeWidth={3}
                strokeLinejoin="round"
              >
                {silhouette.widthM.toFixed(1)} m
              </text>
            </g>
          )
        })()}
      </g>
    </motion.g>
  )
}
