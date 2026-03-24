import type { AircraftSpec } from '@/types/aircraft'
import type { ViewAngle, RenderStyle } from '@/types/canvas'
import { useSilhouette } from '@/hooks/useSilhouette'
import { getAircraftImageUrl } from '@/data/aircraft-images'
import { AircraftSilhouette } from './AircraftSilhouette'

interface GhostAircraftProps {
  spec: AircraftSpec
  viewAngle: ViewAngle
  renderStyle: RenderStyle
  pixelsPerMeter: number
  groundY: number
  x: number  // left starting position
}

const GHOST_COLOR = '#a78bfa' // purple-400

export function GhostAircraft({ spec, viewAngle, renderStyle, pixelsPerMeter, groundY, x }: GhostAircraftProps) {
  const silhouette = useSilhouette(spec, viewAngle)

  if (!silhouette) return null

  const y = groundY - silhouette.heightM * pixelsPerMeter
  const effectiveStyle = renderStyle === 'photo' && viewAngle === 'top' ? 'blueprint' as const : renderStyle
  const imageUrl = viewAngle === 'side' ? getAircraftImageUrl(spec.slug) : null

  return (
    <AircraftSilhouette
      key={`ghost-${spec.slug}-${viewAngle}-${renderStyle}`}
      silhouette={silhouette}
      x={x}
      y={y}
      pixelsPerMeter={pixelsPerMeter}
      color={GHOST_COLOR}
      opacity={0.25}
      label={`${spec.name} (ref)`}
      renderStyle={effectiveStyle}
      imageUrl={imageUrl}
      labelYOffset={-50}
    />
  )
}
