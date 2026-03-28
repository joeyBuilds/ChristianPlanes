import type { AircraftSpec } from '@/types/aircraft'
import type { ViewAngle } from '@/types/canvas'
import { useSilhouette } from '@/hooks/useSilhouette'
import { getAircraftBlueprintUrl } from '@/data/aircraft-blueprints'
import { AircraftSilhouette } from './AircraftSilhouette'

interface GhostAircraftProps {
  spec: AircraftSpec
  viewAngle: ViewAngle
  pixelsPerMeter: number
  x: number
  y: number
  opacity?: number
  isDarkMode?: boolean
  labelYOffset?: number
  showDimensions?: boolean
  heightDimSide?: 'left' | 'right'
  showLengthBar?: boolean
  lengthBarIndex?: number
  heightDimXOffset?: number
}

const GHOST_COLOR = '#a78bfa' // purple-400

export function GhostAircraft({
  spec, viewAngle, pixelsPerMeter, x, y,
  opacity = 0.25, isDarkMode = true, labelYOffset = -50,
  showDimensions = false, heightDimSide = 'right',
  showLengthBar = false, lengthBarIndex = 0, heightDimXOffset,
}: GhostAircraftProps) {
  const silhouette = useSilhouette(spec, viewAngle)
  const blueprintUrl = getAircraftBlueprintUrl(spec.slug, viewAngle)

  if (!silhouette) return null

  return (
    <AircraftSilhouette
      key={`ghost-${spec.slug}-${viewAngle}`}
      silhouette={silhouette}
      x={x}
      y={y}
      pixelsPerMeter={pixelsPerMeter}
      color={GHOST_COLOR}
      opacity={opacity}
      label={`${spec.name} (ref)`}
      blueprintUrl={blueprintUrl}
      isDarkMode={isDarkMode}
      viewAngle={viewAngle}
      labelYOffset={labelYOffset}
      showDimensions={showDimensions}
      heightDimSide={heightDimSide}
      showLengthBar={showLengthBar}
      lengthBarIndex={lengthBarIndex}
      heightDimXOffset={heightDimXOffset}
    />
  )
}
