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
  heightDimSide?: 'left' | 'right'
  /** Show a colored length bar below the aircraft (reference-image style) */
  showLengthBar?: boolean
  /** Vertical offset for length bar when multiple bars are stacked */
  lengthBarIndex?: number
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
  heightDimSide = 'right',
  showLengthBar = false,
  lengthBarIndex = 0,
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
            {/* Color overlay tint for the blueprint — only when measurements on */}
            {showDimensions && (
              <rect
                x={0}
                y={0}
                width={width}
                height={height}
                fill={color}
                fillOpacity={hovered ? 0.12 : 0.06}
                rx={2}
                style={{ pointerEvents: 'none', mixBlendMode: 'overlay' }}
              />
            )}
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
        {showDimensions && (
          <g opacity={0.8}>
            {(() => {
              const lineX = heightDimSide === 'right' ? width + 10 : -10
              const tickX1 = heightDimSide === 'right' ? width + 5 : -15
              const tickX2 = heightDimSide === 'right' ? width + 15 : -5
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

        {/* Thin horizontal line at label row + name label pill */}
        {!showLengthBar && showDimensions && (() => {
          const dimSuffix = showDimensions
            ? ` · ${silhouette.widthM.toFixed(1)} × ${silhouette.heightM.toFixed(1)}m`
            : ''
          const fullLabel = label + dimSuffix
          const lblW = fullLabel.length * 6.2 + 14
          const lineY = labelYOffset + 8
          return (
            <g>
              {/* Thin horizontal line spanning the aircraft width at the label row */}
              <line
                x1={0}
                y1={lineY}
                x2={width}
                y2={lineY}
                stroke={color}
                strokeWidth={0.6}
                strokeOpacity={0.5}
              />
              {/* Name tag pill */}
              <rect
                x={width / 2 - lblW / 2}
                y={labelYOffset - 9}
                width={lblW}
                height={16}
                rx={3}
                fill={isDarkMode ? '#0a1929' : 'rgba(255,255,255,0.85)'}
                fillOpacity={0.9}
                stroke={color}
                strokeWidth={0.5}
                strokeOpacity={0.4}
              />
              <text
                x={width / 2}
                y={labelYOffset + 3}
                textAnchor="middle"
                fill={color}
                fillOpacity={0.95}
                fontSize={10}
                fontWeight={600}
                fontFamily={monoFont}
                letterSpacing="0.3px"
              >
                {fullLabel}
              </text>
            </g>
          )
        })()}
      </g>
    </motion.g>
  )
}
