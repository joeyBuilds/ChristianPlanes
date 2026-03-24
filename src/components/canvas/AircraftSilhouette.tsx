import { useState } from 'react'
import { motion } from 'framer-motion'
import type { SilhouetteData } from '@/lib/silhouette-generator'
import type { RenderStyle } from '@/types/canvas'

interface AircraftSilhouetteProps {
  silhouette: SilhouetteData
  x: number
  y: number
  pixelsPerMeter: number
  color: string
  opacity?: number
  label: string
  renderStyle: RenderStyle
  imageUrl: string | null
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
  renderStyle,
  imageUrl,
  labelYOffset = -12,
  showDimensions = false,
  heightDimSide = 'right',
  showLengthBar = false,
  lengthBarIndex = 0,
  onHover,
}: AircraftSilhouetteProps) {
  const [hovered, setHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const width = silhouette.widthM * pixelsPerMeter
  const height = silhouette.heightM * pixelsPerMeter

  const handleHover = (val: boolean) => {
    setHovered(val)
    onHover?.(val)
  }

  const usePhoto = renderStyle === 'photo' && imageUrl && !imageError
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
        {usePhoto ? (
          <>
            {/* Photo/illustration mode — extra padding on right/bottom only so tail isn't clipped */}
            {(() => {
              const padR = width * 0.08
              const padB = height * 0.08
              return (
                <image
                  href={imageUrl!}
                  x={0}
                  y={0}
                  width={width + padR}
                  height={height + padB}
                  preserveAspectRatio="xMinYMin meet"
                  opacity={opacity}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  style={{
                    filter: hovered ? 'brightness(1.05)' : undefined,
                    transition: 'filter 0.2s',
                  }}
                />
              )
            })()}
            {/* Subtle border around the image when hovered */}
            {hovered && (
              <rect
                x={-1}
                y={-1}
                width={width + 2}
                height={height + 2}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeOpacity={0.4}
                rx={2}
              />
            )}
            {/* "No image" indicator while loading */}
            {!imageLoaded && !imageError && (
              <text
                x={width / 2}
                y={height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fillOpacity={0.5}
                fontSize={10}
                fontFamily={monoFont}
              >
                Loading...
              </text>
            )}
          </>
        ) : (
          <>
            {/* Blueprint/SVG mode */}
            <svg
              viewBox={silhouette.viewBox}
              width={width}
              height={height}
              overflow="visible"
            >
              {/* Fill layer — higher opacity when overlaid for that reference-image solid blend look */}
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

            {/* Show "no photo" badge when in photo mode but no image available */}
            {renderStyle === 'photo' && (
              <g opacity={0.5}>
                <rect
                  x={width / 2 - 42}
                  y={height / 2 - 10}
                  width={84}
                  height={20}
                  rx={4}
                  fill="#0a1929"
                  fillOpacity={0.85}
                  stroke={color}
                  strokeWidth={0.5}
                  strokeOpacity={0.4}
                />
                <text
                  x={width / 2}
                  y={height / 2 + 4}
                  textAnchor="middle"
                  fill={color}
                  fontSize={9}
                  fontFamily={monoFont}
                >
                  No photo
                </text>
              </g>
            )}
          </>
        )}

        {/* Height dimension — vertical bar on the configured side */}
        {(hovered || showDimensions) && (
          <g opacity={0.8}>
            {heightDimSide === 'right' ? (
              <>
                <line x1={width + 14} y1={0} x2={width + 14} y2={height} stroke={color} strokeWidth={0.8} />
                <line x1={width + 8} y1={0} x2={width + 20} y2={0} stroke={color} strokeWidth={0.8} />
                <line x1={width + 8} y1={height} x2={width + 20} y2={height} stroke={color} strokeWidth={0.8} />
                {/* Height label — colored pill */}
                <rect x={width + 22} y={height / 2 - 8} width={42} height={16} rx={3}
                  fill={color} fillOpacity={0.12} stroke={color} strokeWidth={0.5} strokeOpacity={0.3} />
                <text x={width + 43} y={height / 2 + 4} textAnchor="middle" fill={color}
                  fontSize={8.5} fontWeight={600} fontFamily={monoFont} dominantBaseline="middle">
                  {silhouette.heightM.toFixed(1)} m
                </text>
              </>
            ) : (
              <>
                <line x1={-14} y1={0} x2={-14} y2={height} stroke={color} strokeWidth={0.8} />
                <line x1={-20} y1={0} x2={-8} y2={0} stroke={color} strokeWidth={0.8} />
                <line x1={-20} y1={height} x2={-8} y2={height} stroke={color} strokeWidth={0.8} />
                {/* Height label — colored pill */}
                <rect x={-66} y={height / 2 - 8} width={42} height={16} rx={3}
                  fill={color} fillOpacity={0.12} stroke={color} strokeWidth={0.5} strokeOpacity={0.3} />
                <text x={-45} y={height / 2 + 4} textAnchor="middle" fill={color}
                  fontSize={8.5} fontWeight={600} fontFamily={monoFont} dominantBaseline="middle">
                  {silhouette.heightM.toFixed(1)} m
                </text>
              </>
            )}
          </g>
        )}

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

        {/* Name label — compact pill above aircraft */}
        {!showLengthBar && (() => {
          const dimSuffix = (hovered || showDimensions)
            ? ` · ${silhouette.widthM.toFixed(1)} × ${silhouette.heightM.toFixed(1)}m`
            : ''
          const fullLabel = label + dimSuffix
          const lblW = fullLabel.length * 6.2 + 14
          return (
            <g>
              <rect
                x={width / 2 - lblW / 2}
                y={labelYOffset - 9}
                width={lblW}
                height={16}
                rx={3}
                fill={usePhoto ? 'rgba(255,255,255,0.85)' : '#0a1929'}
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
