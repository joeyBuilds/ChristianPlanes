import type { AircraftSpec, AircraftCategory } from '@/types/aircraft'
import { getAircraftProfile } from './aircraft-profiles'

function generateNosePath(
  noseStyle: string,
  noseLength: number,
  noseLengthFrac: number,
  _cockpitAngle: number,
  fuselageDiameter: number,
  centerX: number,
  centerY: number,
): { top: string[]; bottom: string[] } {
  const halfFd = fuselageDiameter / 2
  const noseTip = centerX + noseLength * noseLengthFrac

  const top: string[] = []
  const bottom: string[] = []

  switch (noseStyle) {
    case 'pointed': {
      const cp1x = centerX + noseLength * noseLengthFrac * 0.3
      const cp1y = centerY - halfFd * 0.4
      const cp2x = centerX + noseLength * noseLengthFrac * 0.7
      const cp2y = centerY - halfFd * 0.8
      top.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${noseTip} ${centerY - halfFd * 0.95}`)
      const cp3x = centerX + noseLength * noseLengthFrac * 0.7
      const cp3y = centerY + halfFd * 0.8
      const cp4x = centerX + noseLength * noseLengthFrac * 0.3
      const cp4y = centerY + halfFd * 0.4
      bottom.push(`C ${cp3x} ${cp3y} ${cp4x} ${cp4y} ${noseTip} ${centerY + halfFd * 0.95}`)
      break
    }
    case 'bulbous': {
      const cp1x = centerX + noseLength * noseLengthFrac * 0.2
      const cp1y = centerY - halfFd * 0.6
      const cp2x = centerX + noseLength * noseLengthFrac * 0.6
      const cp2y = centerY - halfFd * 0.85
      top.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${noseTip} ${centerY - halfFd}`)
      bottom.push(`C ${cp1x} ${-cp1y + 2 * centerY} ${cp2x} ${-cp2y + 2 * centerY} ${noseTip} ${centerY + halfFd}`)
      break
    }
    case 'drooped': {
      const cp1x = centerX + noseLength * noseLengthFrac * 0.3
      const cp1y = centerY - halfFd * 0.3
      const cp2x = centerX + noseLength * noseLengthFrac * 0.7
      const cp2y = centerY - halfFd * 0.7
      top.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${noseTip} ${centerY - halfFd * 0.85}`)
      const cp3x = centerX + noseLength * noseLengthFrac * 0.7
      const cp3y = centerY + halfFd * 0.8
      const cp4x = centerX + noseLength * noseLengthFrac * 0.3
      const cp4y = centerY + halfFd * 0.25
      bottom.push(`C ${cp3x} ${cp3y} ${cp4x} ${cp4y} ${noseTip} ${centerY + halfFd * 0.9}`)
      break
    }
    case 'standard':
    default: {
      const cp1x = centerX + noseLength * noseLengthFrac * 0.4
      const cp1y = centerY - halfFd * 0.5
      const cp2x = centerX + noseLength * noseLengthFrac * 0.8
      const cp2y = centerY - halfFd * 0.85
      top.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${noseTip} ${centerY - halfFd * 0.9}`)
      const cp3x = centerX + noseLength * noseLengthFrac * 0.8
      const cp3y = centerY + halfFd * 0.85
      const cp4x = centerX + noseLength * noseLengthFrac * 0.4
      const cp4y = centerY + halfFd * 0.5
      bottom.push(`C ${cp3x} ${cp3y} ${cp4x} ${cp4y} ${noseTip} ${centerY + halfFd * 0.9}`)
      break
    }
  }

  return { top, bottom }
}

function generateFuselagePath(
  spec: AircraftSpec,
  profile: any,
  noseLength: number,
  tailLength: number,
  fuselageDiameter: number,
  groundY: number,
): string {
  const length = spec.length.metric
  const halfFd = fuselageDiameter / 2
  const gearHeight = (groundY - halfFd * 2) * 0.5
  const centerY = groundY - gearHeight - halfFd

  const noseX = 0
  const noseTipX = noseLength
  const tailStartX = length - tailLength
  const tailX = length

  const tailUpsweepRad = (profile.tailUpsweepAngle * Math.PI) / 180
  const tailTaperDist = tailLength * 0.7
  const tailBottomDropY = halfFd * Math.tan(tailUpsweepRad)

  const nosePath = generateNosePath(
    profile.noseStyle,
    length,
    profile.noseLengthFrac,
    profile.cockpitAngle,
    fuselageDiameter,
    noseX,
    centerY,
  )

  const parts: string[] = []

  parts.push(`M ${noseX} ${centerY}`)
  parts.push(...nosePath.top)
  parts.push(`L ${tailStartX} ${centerY - halfFd}`)

  const tailTopEndY = centerY - halfFd + tailBottomDropY * 0.5
  parts.push(`Q ${tailStartX + tailTaperDist * 0.5} ${centerY - halfFd} ${tailStartX + tailTaperDist} ${tailTopEndY}`)
  parts.push(`L ${tailX} ${centerY}`)
  parts.push(`Q ${tailStartX + tailTaperDist} ${centerY + tailBottomDropY} ${tailStartX + tailTaperDist * 0.5} ${centerY + halfFd}`)
  parts.push(`L ${noseTipX} ${centerY + halfFd}`)
  parts.push(...nosePath.bottom)
  parts.push('Z')

  return parts.join(' ')
}

function generateUpperDeckPath(
  spec: AircraftSpec,
  profile: any,
  noseLength: number,
  _tailLength: number,
  fuselageDiameter: number,
  groundY: number,
): string | null {
  if (!profile.upperDeckLengthFrac) return null

  const length = spec.length.metric
  const halfFd = fuselageDiameter / 2
  const gearHeight = (groundY - halfFd * 2) * 0.5
  const centerY = groundY - gearHeight - halfFd

  const deckStartX = noseLength
  const deckLength = length * profile.upperDeckLengthFrac
  const deckEndX = deckStartX + deckLength
  const deckHeight = fuselageDiameter * profile.upperDeckHeightFrac

  const parts: string[] = []

  parts.push(`M ${deckStartX} ${centerY - halfFd}`)
  parts.push(`L ${deckEndX} ${centerY - halfFd}`)
  parts.push(`L ${deckEndX} ${centerY - halfFd - deckHeight}`)

  const faringWidth = deckLength * 0.15
  parts.push(
    `C ${deckEndX - faringWidth * 0.5} ${centerY - halfFd - deckHeight * 0.7} ${deckEndX - faringWidth} ${centerY - halfFd - deckHeight * 0.3} ${deckEndX + faringWidth} ${centerY - halfFd}`,
  )

  parts.push('Z')

  return parts.join(' ')
}

function generateVerticalStabilizerPath(
  spec: AircraftSpec,
  profile: any,
  tailLength: number,
  fuselageDiameter: number,
  groundY: number,
): string {
  const length = spec.length.metric
  const halfFd = fuselageDiameter / 2
  const gearHeight = (groundY - halfFd * 2) * 0.5
  const centerY = groundY - gearHeight - halfFd

  const tailStartX = length - tailLength

  const vStabHeight = spec.height.metric * profile.vStabHeightFrac
  const vStabBaseX = tailStartX + tailLength * 0.2
  const vStabTipX = vStabBaseX + (tailLength * profile.vStabChordFrac) * Math.cos((profile.vStabSweepDeg * Math.PI) / 180)
  const vStabTopY = centerY - halfFd - vStabHeight

  const parts: string[] = []

  parts.push(`M ${vStabBaseX} ${centerY - halfFd}`)
  parts.push(`L ${vStabTipX} ${vStabTopY}`)
  parts.push(`Q ${vStabTipX + tailLength * 0.02} ${vStabTopY + vStabHeight * 0.1} ${vStabTipX - tailLength * 0.03} ${vStabTopY + vStabHeight * 0.15}`)
  parts.push(`L ${vStabBaseX + tailLength * profile.vStabChordFrac * 0.3} ${centerY - halfFd}`)
  parts.push('Z')

  return parts.join(' ')
}

function generateHorizontalStabilizerPath(
  spec: AircraftSpec,
  profile: any,
  tailLength: number,
  fuselageDiameter: number,
  groundY: number,
): string {
  const length = spec.length.metric
  const halfFd = fuselageDiameter / 2
  const gearHeight = (groundY - halfFd * 2) * 0.5
  const centerY = groundY - gearHeight - halfFd

  const tailStartX = length - tailLength
  const vStabHeight = spec.height.metric * profile.vStabHeightFrac

  const hStabLength = tailLength * 0.5
  const hStabThickness = fuselageDiameter * 0.04

  let hStabY: number

  switch (profile.tailStyle) {
    case 'T-tail':
      hStabY = centerY - halfFd - vStabHeight
      break
    case 'cruciform':
      hStabY = centerY - halfFd - vStabHeight * 0.5
      break
    case 'conventional':
    default:
      hStabY = centerY - halfFd + fuselageDiameter * 0.15
  }

  const parts: string[] = []

  parts.push(`M ${tailStartX + hStabLength * 0.3} ${hStabY}`)
  parts.push(`L ${tailStartX + hStabLength * 0.3 + hStabLength * 0.6} ${hStabY}`)
  parts.push(`L ${tailStartX + hStabLength * 0.3 + hStabLength * 0.6} ${hStabY + hStabThickness}`)
  parts.push(`L ${tailStartX + hStabLength * 0.3} ${hStabY + hStabThickness}`)
  parts.push('Z')

  return parts.join(' ')
}

function generateWingPath(
  spec: AircraftSpec,
  profile: any,
  fuselageDiameter: number,
  groundY: number,
): string {
  const length = spec.length.metric
  const halfFd = fuselageDiameter / 2
  const gearHeight = (groundY - halfFd * 2) * 0.5
  const centerY = groundY - gearHeight - halfFd

  const wingRootX = length * profile.wingPositionFrac
  const wingChord = length * profile.wingChordFrac
  const wingTipX = wingRootX + wingChord

  const wingMountY = centerY + halfFd * (profile.wingMountHeight - 0.5) * 2
  const wingThickness = fuselageDiameter * profile.wingThicknessFrac

  const parts: string[] = []

  parts.push(`M ${wingRootX} ${wingMountY}`)
  parts.push(`L ${wingTipX} ${wingMountY - wingThickness * 0.4}`)
  parts.push(`L ${wingTipX + wingChord * 0.05} ${wingMountY}`)
  parts.push(`L ${wingTipX} ${wingMountY + wingThickness * 0.4}`)
  parts.push(`L ${wingRootX} ${wingMountY + wingThickness}`)
  parts.push('Z')

  return parts.join(' ')
}

function generateEnginesPath(
  spec: AircraftSpec,
  profile: any,
  fuselageDiameter: number,
  groundY: number,
): string {
  const length = spec.length.metric
  const halfFd = fuselageDiameter / 2
  const gearHeight = (groundY - halfFd * 2) * 0.5
  const centerY = groundY - gearHeight - halfFd

  const parts: string[] = []

  const engineDiameter = profile.engineDiameterM
  const halfEngD = engineDiameter / 2
  const nacelleLength = engineDiameter * 2.2

  const wingRootX = length * profile.wingPositionFrac
  const wingChord = length * profile.wingChordFrac
  const tailStartX = length - length * profile.tailConeLengthFrac

  switch (profile.engineMountStyle) {
    case 'underwing': {
      const pylonLength = halfFd * (profile.enginePylonLengthFrac || 0.15)
      const engineY = centerY + halfFd + halfEngD * 0.5

      if (profile.engineSpanPositions && profile.engineSpanPositions.length > 0) {
        profile.engineSpanPositions.forEach((spanPos: number) => {
          const engineX = wingRootX + wingChord * (profile.engineForwardOffset || 0.05) + wingChord * spanPos

          parts.push(`M ${engineX} ${engineY - halfEngD}`)
          parts.push(
            `C ${engineX + nacelleLength * 0.2} ${engineY - halfEngD} ${engineX + nacelleLength * 0.5} ${engineY - halfEngD} ${engineX + nacelleLength * 0.7} ${engineY - halfEngD}`,
          )
          parts.push(
            `C ${engineX + nacelleLength * 0.85} ${engineY - halfEngD} ${engineX + nacelleLength} ${engineY - halfEngD * 0.5} ${engineX + nacelleLength} ${engineY}`,
          )
          parts.push(
            `C ${engineX + nacelleLength} ${engineY + halfEngD * 0.5} ${engineX + nacelleLength * 0.85} ${engineY + halfEngD} ${engineX + nacelleLength * 0.7} ${engineY + halfEngD}`,
          )
          parts.push(
            `C ${engineX + nacelleLength * 0.5} ${engineY + halfEngD} ${engineX + nacelleLength * 0.2} ${engineY + halfEngD} ${engineX} ${engineY + halfEngD}`,
          )
          parts.push('Z')

          parts.push(
            `M ${engineX + nacelleLength * 0.4} ${engineY - halfEngD} L ${engineX + nacelleLength * 0.4} ${engineY - halfEngD - pylonLength} L ${engineX + nacelleLength * 0.6} ${engineY - halfEngD - pylonLength} L ${engineX + nacelleLength * 0.6} ${engineY - halfEngD} Z`,
          )
        })
      }
      break
    }

    case 'rear-fuselage': {
      const engineY = centerY
      const engineX = tailStartX - nacelleLength * 0.5

      parts.push(`M ${engineX} ${engineY - halfFd * 0.2 - halfEngD}`)
      parts.push(
        `C ${engineX + nacelleLength * 0.3} ${engineY - halfFd * 0.2 - halfEngD} ${engineX + nacelleLength * 0.7} ${engineY - halfFd * 0.2 - halfEngD} ${engineX + nacelleLength} ${engineY - halfFd * 0.2}`,
      )
      parts.push(
        `C ${engineX + nacelleLength} ${engineY - halfFd * 0.2 + halfEngD} ${engineX + nacelleLength * 0.7} ${engineY - halfFd * 0.2 + halfEngD} ${engineX + nacelleLength * 0.3} ${engineY - halfFd * 0.2 + halfEngD}`,
      )
      parts.push(`L ${engineX} ${engineY - halfFd * 0.2}`)
      parts.push('Z')

      parts.push(`M ${engineX} ${engineY + halfFd * 0.2 - halfEngD}`)
      parts.push(
        `C ${engineX + nacelleLength * 0.3} ${engineY + halfFd * 0.2 - halfEngD} ${engineX + nacelleLength * 0.7} ${engineY + halfFd * 0.2 - halfEngD} ${engineX + nacelleLength} ${engineY + halfFd * 0.2}`,
      )
      parts.push(
        `C ${engineX + nacelleLength} ${engineY + halfFd * 0.2 + halfEngD} ${engineX + nacelleLength * 0.7} ${engineY + halfFd * 0.2 + halfEngD} ${engineX + nacelleLength * 0.3} ${engineY + halfFd * 0.2 + halfEngD}`,
      )
      parts.push(`L ${engineX} ${engineY + halfFd * 0.2}`)
      parts.push('Z')
      break
    }

    case 'tail-s-duct': {
      const engineY = centerY
      const engineX = tailStartX - nacelleLength * 0.5

      parts.push(`M ${engineX} ${engineY - halfFd * 0.25 - halfEngD}`)
      parts.push(
        `C ${engineX + nacelleLength * 0.3} ${engineY - halfFd * 0.25 - halfEngD} ${engineX + nacelleLength * 0.7} ${engineY - halfFd * 0.25 - halfEngD} ${engineX + nacelleLength} ${engineY - halfFd * 0.25}`,
      )
      parts.push(
        `C ${engineX + nacelleLength} ${engineY - halfFd * 0.25 + halfEngD} ${engineX + nacelleLength * 0.7} ${engineY - halfFd * 0.25 + halfEngD} ${engineX + nacelleLength * 0.3} ${engineY - halfFd * 0.25 + halfEngD}`,
      )
      parts.push(`L ${engineX} ${engineY - halfFd * 0.25}`)
      parts.push('Z')

      parts.push(`M ${engineX} ${engineY + halfFd * 0.25 - halfEngD}`)
      parts.push(
        `C ${engineX + nacelleLength * 0.3} ${engineY + halfFd * 0.25 - halfEngD} ${engineX + nacelleLength * 0.7} ${engineY + halfFd * 0.25 - halfEngD} ${engineX + nacelleLength} ${engineY + halfFd * 0.25}`,
      )
      parts.push(
        `C ${engineX + nacelleLength} ${engineY + halfFd * 0.25 + halfEngD} ${engineX + nacelleLength * 0.7} ${engineY + halfFd * 0.25 + halfEngD} ${engineX + nacelleLength * 0.3} ${engineY + halfFd * 0.25 + halfEngD}`,
      )
      parts.push(`L ${engineX} ${engineY + halfFd * 0.25}`)
      parts.push('Z')

      const intakeX = tailStartX + fuselageDiameter * 0.1
      const intakeY = centerY - halfFd

      parts.push(`M ${intakeX - halfEngD * 0.4} ${intakeY}`)
      parts.push(`C ${intakeX} ${intakeY - halfEngD * 0.5} ${intakeX} ${intakeY - halfEngD * 0.5} ${intakeX + halfEngD * 0.4} ${intakeY}`)
      parts.push(`C ${intakeX} ${intakeY + halfEngD * 0.3} ${intakeX} ${intakeY + halfEngD * 0.3} ${intakeX - halfEngD * 0.4} ${intakeY}`)
      parts.push('Z')
      break
    }

    case 'mixed-trijet': {
      const pylonLength = halfFd * (profile.enginePylonLengthFrac || 0.15)
      const engineY = centerY + halfFd + halfEngD * 0.5

      if (profile.engineSpanPositions && profile.engineSpanPositions.length > 0) {
        const spanPos = profile.engineSpanPositions[0]
        const engineX = wingRootX + wingChord * (profile.engineForwardOffset || 0.05) + wingChord * spanPos

        parts.push(`M ${engineX} ${engineY - halfEngD}`)
        parts.push(
          `C ${engineX + nacelleLength * 0.2} ${engineY - halfEngD} ${engineX + nacelleLength * 0.5} ${engineY - halfEngD} ${engineX + nacelleLength * 0.7} ${engineY - halfEngD}`,
        )
        parts.push(
          `C ${engineX + nacelleLength * 0.85} ${engineY - halfEngD} ${engineX + nacelleLength} ${engineY - halfEngD * 0.5} ${engineX + nacelleLength} ${engineY}`,
        )
        parts.push(
          `C ${engineX + nacelleLength} ${engineY + halfEngD * 0.5} ${engineX + nacelleLength * 0.85} ${engineY + halfEngD} ${engineX + nacelleLength * 0.7} ${engineY + halfEngD}`,
        )
        parts.push(
          `C ${engineX + nacelleLength * 0.5} ${engineY + halfEngD} ${engineX + nacelleLength * 0.2} ${engineY + halfEngD} ${engineX} ${engineY + halfEngD}`,
        )
        parts.push('Z')

        parts.push(
          `M ${engineX + nacelleLength * 0.4} ${engineY - halfEngD} L ${engineX + nacelleLength * 0.4} ${engineY - halfEngD - pylonLength} L ${engineX + nacelleLength * 0.6} ${engineY - halfEngD - pylonLength} L ${engineX + nacelleLength * 0.6} ${engineY - halfEngD} Z`,
        )

        if (profile.engineSpanPositions.length > 1) {
          const spanPos2 = profile.engineSpanPositions[1]
          const engineX2 = wingRootX + wingChord * (profile.engineForwardOffset || 0.05) + wingChord * spanPos2

          parts.push(`M ${engineX2} ${engineY - halfEngD}`)
          parts.push(
            `C ${engineX2 + nacelleLength * 0.2} ${engineY - halfEngD} ${engineX2 + nacelleLength * 0.5} ${engineY - halfEngD} ${engineX2 + nacelleLength * 0.7} ${engineY - halfEngD}`,
          )
          parts.push(
            `C ${engineX2 + nacelleLength * 0.85} ${engineY - halfEngD} ${engineX2 + nacelleLength} ${engineY - halfEngD * 0.5} ${engineX2 + nacelleLength} ${engineY}`,
          )
          parts.push(
            `C ${engineX2 + nacelleLength} ${engineY + halfEngD * 0.5} ${engineX2 + nacelleLength * 0.85} ${engineY + halfEngD} ${engineX2 + nacelleLength * 0.7} ${engineY + halfEngD}`,
          )
          parts.push(
            `C ${engineX2 + nacelleLength * 0.5} ${engineY + halfEngD} ${engineX2 + nacelleLength * 0.2} ${engineY + halfEngD} ${engineX2} ${engineY + halfEngD}`,
          )
          parts.push('Z')

          parts.push(
            `M ${engineX2 + nacelleLength * 0.4} ${engineY - halfEngD} L ${engineX2 + nacelleLength * 0.4} ${engineY - halfEngD - pylonLength} L ${engineX2 + nacelleLength * 0.6} ${engineY - halfEngD - pylonLength} L ${engineX2 + nacelleLength * 0.6} ${engineY - halfEngD} Z`,
          )
        }
      }

      const vStabHeight = spec.height.metric * profile.vStabHeightFrac
      const centerEngineX = tailStartX + fuselageDiameter * 0.1
      const centerEngineY = centerY - halfFd - vStabHeight * 0.5

      parts.push(`M ${centerEngineX - halfEngD * 0.5} ${centerEngineY}`)
      parts.push(
        `C ${centerEngineX - halfEngD * 0.5} ${centerEngineY - halfEngD * 0.7} ${centerEngineX + halfEngD * 0.5} ${centerEngineY - halfEngD * 0.7} ${centerEngineX + halfEngD * 0.5} ${centerEngineY}`,
      )
      parts.push(
        `C ${centerEngineX + halfEngD * 0.5} ${centerEngineY + halfEngD * 0.7} ${centerEngineX - halfEngD * 0.5} ${centerEngineY + halfEngD * 0.7} ${centerEngineX - halfEngD * 0.5} ${centerEngineY}`,
      )
      parts.push('Z')
      break
    }
  }

  return parts.join(' ')
}

function generateLandingGearPath(
  spec: AircraftSpec,
  profile: any,
  fuselageDiameter: number,
  groundY: number,
): string {
  const length = spec.length.metric
  const halfFd = fuselageDiameter / 2
  const gearHeight = (groundY - halfFd * 2) * 0.5
  const centerY = groundY - gearHeight - halfFd

  const noseGearX = length * profile.noseGearPositionFrac
  const mainGearX = length * profile.mainGearPositionFrac
  const mainGearHeight = spec.height.metric * profile.mainGearHeightFrac

  const gearTop = centerY + halfFd
  const gearBottom = gearTop + mainGearHeight

  const parts: string[] = []

  parts.push(`M ${noseGearX} ${gearTop}`)
  parts.push(`L ${noseGearX} ${gearBottom}`)
  parts.push(`M ${noseGearX - fuselageDiameter * 0.08} ${gearBottom}`)
  parts.push(`L ${noseGearX + fuselageDiameter * 0.08} ${gearBottom}`)

  parts.push(`M ${mainGearX} ${gearTop}`)
  parts.push(`L ${mainGearX} ${gearBottom}`)
  parts.push(`M ${mainGearX - fuselageDiameter * 0.12} ${gearBottom}`)
  parts.push(`L ${mainGearX + fuselageDiameter * 0.12} ${gearBottom}`)

  if (profile.hasBodyGear) {
    const bodyGearX = length * (profile.noseGearPositionFrac + profile.mainGearPositionFrac) * 0.5
    parts.push(`M ${bodyGearX} ${gearTop}`)
    parts.push(`L ${bodyGearX} ${gearBottom}`)
    parts.push(`M ${bodyGearX - fuselageDiameter * 0.1} ${gearBottom}`)
    parts.push(`L ${bodyGearX + fuselageDiameter * 0.1} ${gearBottom}`)
  }

  return parts.join(' ')
}

function generateWingletPath(
  spec: AircraftSpec,
  profile: any,
  fuselageDiameter: number,
  groundY: number,
): string {
  const length = spec.length.metric
  const halfFd = fuselageDiameter / 2
  const gearHeight = (groundY - halfFd * 2) * 0.5
  const centerY = groundY - gearHeight - halfFd

  const wingRootX = length * profile.wingPositionFrac
  const wingChord = length * profile.wingChordFrac
  const wingTipX = wingRootX + wingChord

  const wingMountY = centerY + halfFd * (profile.wingMountHeight - 0.5) * 2
  const wingThickness = fuselageDiameter * profile.wingThicknessFrac

  const parts: string[] = []

  if (profile.hasWinglets) {
    const wingletHeight = fuselageDiameter * 0.25
    const wingletBase = wingTipX + wingChord * 0.02

    parts.push(`M ${wingletBase} ${wingMountY - wingThickness * 0.4}`)
    parts.push(
      `C ${wingletBase + wingletHeight * 0.15} ${wingMountY - wingThickness * 0.4 - wingletHeight * 0.3} ${wingletBase + wingletHeight * 0.2} ${wingMountY - wingThickness * 0.4 - wingletHeight * 0.8} ${wingletBase} ${wingMountY - wingThickness * 0.4 - wingletHeight}`,
    )
    parts.push(`L ${wingletBase + wingletHeight * 0.1} ${wingMountY - wingThickness * 0.4 - wingletHeight * 0.8}`)
    parts.push('Z')
  }

  if (profile.hasSharklets) {
    const sharkletHeight = fuselageDiameter * 0.2
    const sharkletBase = wingTipX + wingChord * 0.02

    parts.push(`M ${sharkletBase} ${wingMountY - wingThickness * 0.4}`)
    parts.push(
      `C ${sharkletBase + sharkletHeight * 0.25} ${wingMountY - wingThickness * 0.4 - sharkletHeight * 0.5} ${sharkletBase + sharkletHeight * 0.3} ${wingMountY - wingThickness * 0.4 - sharkletHeight * 0.8} ${sharkletBase + sharkletHeight * 0.2} ${wingMountY - wingThickness * 0.4 - sharkletHeight * 0.6}`,
    )
    parts.push(`L ${sharkletBase + sharkletHeight * 0.1} ${wingMountY - wingThickness * 0.4 - sharkletHeight * 0.3}`)
    parts.push('Z')
  }

  return parts.join(' ')
}

/**
 * Generate fine detail paths for side-view silhouettes:
 * cockpit windows, passenger window row, door lines, engine fan circles
 */
function generateSideViewDetailPath(spec: AircraftSpec): string {
  const profile = getAircraftProfile(spec.slug)
  const length = spec.length.metric
  const height = spec.height.metric

  if (length === 0 || height === 0) return ''

  const fuselageDiameter = profile.fuselageDiameterM
  const halfFd = fuselageDiameter / 2
  const groundY = height
  const gearHeight = (groundY - halfFd * 2) * 0.5
  const centerY = groundY - gearHeight - halfFd
  const noseLength = length * profile.noseLengthFrac
  const tailLength = length * profile.tailConeLengthFrac
  const tailStartX = length - tailLength

  const parts: string[] = []

  // ── COCKPIT WINDOWS ──
  // Angled windshield band near nose
  const cockpitStartX = noseLength * 0.55
  const cockpitEndX = noseLength * 0.78
  const cockpitTopY = centerY - halfFd * 0.82
  const cockpitBotY = centerY - halfFd * 0.4
  // Two-pane windshield
  const midX = (cockpitStartX + cockpitEndX) / 2
  parts.push(`M ${cockpitStartX} ${cockpitBotY} L ${midX - length * 0.003} ${cockpitTopY} L ${midX + length * 0.003} ${cockpitTopY} L ${cockpitEndX} ${cockpitBotY} Z`)
  // Divider line
  parts.push(`M ${midX} ${cockpitTopY} L ${(cockpitStartX + cockpitEndX) * 0.5} ${cockpitBotY}`)

  // ── PASSENGER WINDOW LINE ──
  // Row of small rectangles along upper fuselage
  const windowStartX = noseLength * 1.05
  const windowEndX = tailStartX - halfFd * 0.3
  const windowY = centerY - halfFd * 0.65  // upper third of fuselage
  const windowH = halfFd * 0.07
  const windowW = halfFd * 0.06
  const windowSpacing = halfFd * 0.18

  if (windowSpacing > 0.1) {
    for (let wx = windowStartX; wx < windowEndX; wx += windowSpacing) {
      parts.push(`M ${wx} ${windowY} L ${wx + windowW} ${windowY} L ${wx + windowW} ${windowY + windowH} L ${wx} ${windowY + windowH} Z`)
    }
  }

  // ── DOOR OUTLINES ──
  // Evenly spaced subtle vertical lines on fuselage
  const doorStartX = noseLength * 1.1
  const doorEndX = tailStartX - halfFd * 0.5
  const doorRegionLen = doorEndX - doorStartX
  // Roughly 1 door per 8-12m of fuselage
  const doorCount = Math.max(2, Math.round(doorRegionLen / 10))
  const doorSpacing = doorRegionLen / (doorCount + 1)
  const doorTopY = centerY - halfFd * 0.75
  const doorBotY = centerY - halfFd * 0.15
  const doorW = halfFd * 0.08

  for (let i = 1; i <= doorCount; i++) {
    const dx = doorStartX + doorSpacing * i
    parts.push(`M ${dx - doorW / 2} ${doorTopY} L ${dx + doorW / 2} ${doorTopY} L ${dx + doorW / 2} ${doorBotY} L ${dx - doorW / 2} ${doorBotY} Z`)
  }

  // ── ENGINE FAN CIRCLES ──
  // Visible circle at front of each engine nacelle
  const engineDiameter = profile.engineDiameterM
  const halfEngD = engineDiameter / 2
  const nacelleLength = engineDiameter * 2.2
  const wingRootX = length * profile.wingPositionFrac
  const wingChord = length * profile.wingChordFrac

  if (profile.engineMountStyle === 'underwing' && profile.engineSpanPositions) {
    const engineY = centerY + halfFd + halfEngD * 0.5
    profile.engineSpanPositions.forEach((spanPos: number) => {
      const engineX = wingRootX + wingChord * (profile.engineForwardOffset || 0.05) + wingChord * spanPos
      // Fan face circle
      const cx = engineX + nacelleLength * 0.05
      const r = halfEngD * 0.75
      parts.push(`M ${cx} ${engineY - r} A ${r} ${r} 0 1 1 ${cx} ${engineY + r} A ${r} ${r} 0 1 1 ${cx} ${engineY - r} Z`)
      // Hub dot
      const hr = halfEngD * 0.2
      parts.push(`M ${cx} ${engineY - hr} A ${hr} ${hr} 0 1 1 ${cx} ${engineY + hr} A ${hr} ${hr} 0 1 1 ${cx} ${engineY - hr} Z`)
    })
  } else if (profile.engineMountStyle === 'rear-fuselage' || profile.engineMountStyle === 'tail-s-duct') {
    const engineX = tailStartX - nacelleLength * 0.5
    // Upper engine
    const ey1 = centerY - halfFd * 0.2
    const cx1 = engineX + nacelleLength * 0.05
    const r1 = halfEngD * 0.7
    parts.push(`M ${cx1} ${ey1 - r1} A ${r1} ${r1} 0 1 1 ${cx1} ${ey1 + r1} A ${r1} ${r1} 0 1 1 ${cx1} ${ey1 - r1} Z`)
    // Lower engine
    const ey2 = centerY + halfFd * 0.2
    parts.push(`M ${cx1} ${ey2 - r1} A ${r1} ${r1} 0 1 1 ${cx1} ${ey2 + r1} A ${r1} ${r1} 0 1 1 ${cx1} ${ey2 - r1} Z`)
  } else if (profile.engineMountStyle === 'mixed-trijet' && profile.engineSpanPositions) {
    const engineY = centerY + halfFd + halfEngD * 0.5
    const spanPos = profile.engineSpanPositions[0]
    const engineX = wingRootX + wingChord * (profile.engineForwardOffset || 0.05) + wingChord * spanPos
    const cx = engineX + nacelleLength * 0.05
    const r = halfEngD * 0.75
    parts.push(`M ${cx} ${engineY - r} A ${r} ${r} 0 1 1 ${cx} ${engineY + r} A ${r} ${r} 0 1 1 ${cx} ${engineY - r} Z`)
  }

  // ── BELLY LINE ──
  // Subtle line along the bottom of the fuselage belly fairing
  if (profile.bellyFairingFrac && profile.bellyFairingFrac > 0) {
    const bellyY = centerY + halfFd * 0.85
    const bellyStartX = noseLength * 1.0
    const bellyEndX = tailStartX - halfFd
    parts.push(`M ${bellyStartX} ${bellyY} L ${bellyEndX} ${bellyY}`)
  }

  return parts.join(' ')
}

export function generateSideViewPath(spec: AircraftSpec): string {
  const profile = getAircraftProfile(spec.slug)
  const length = spec.length.metric
  const height = spec.height.metric

  if (length === 0 || height === 0) return ''

  const fuselageDiameter = profile.fuselageDiameterM
  const noseLength = length * profile.noseLengthFrac
  const tailLength = length * profile.tailConeLengthFrac
  const groundY = height

  const parts: string[] = []

  parts.push(generateFuselagePath(spec, profile, noseLength, tailLength, fuselageDiameter, groundY))

  const upperDeckPath = generateUpperDeckPath(spec, profile, noseLength, tailLength, fuselageDiameter, groundY)
  if (upperDeckPath) {
    parts.push(upperDeckPath)
  }

  parts.push(generateVerticalStabilizerPath(spec, profile, tailLength, fuselageDiameter, groundY))
  parts.push(generateHorizontalStabilizerPath(spec, profile, tailLength, fuselageDiameter, groundY))
  parts.push(generateWingPath(spec, profile, fuselageDiameter, groundY))

  const wingletPath = generateWingletPath(spec, profile, fuselageDiameter, groundY)
  if (wingletPath.length > 0) {
    parts.push(wingletPath)
  }

  parts.push(generateEnginesPath(spec, profile, fuselageDiameter, groundY))
  parts.push(generateLandingGearPath(spec, profile, fuselageDiameter, groundY))

  return parts.join(' ')
}

export function generateTopViewPath(spec: AircraftSpec): string {
  const profile = getAircraftProfile(spec.slug)
  const length = spec.length.metric
  const wingspan = spec.wingspan.metric

  if (length === 0 || wingspan === 0) return ''

  const fuselageDiameter = profile.fuselageDiameterM
  const noseLength = length * profile.noseLengthFrac
  const tailLength = length * profile.tailConeLengthFrac
  const halfFd = fuselageDiameter / 2
  const halfSpan = wingspan / 2
  const centerY = wingspan / 2

  const parts: string[] = []

  // ─── FUSELAGE ───
  // Nose shape varies by noseStyle
  const tailStartX = length - tailLength
  const noseEndX = noseLength * 1.2

  let nosePath: string
  switch (profile.noseStyle) {
    case 'pointed':
      // Concorde-style very long pointed nose
      nosePath = [
        `M 0 ${centerY}`,
        `C ${noseLength * 0.15} ${centerY - halfFd * 0.15} ${noseLength * 0.4} ${centerY - halfFd * 0.4} ${noseLength * 0.7} ${centerY - halfFd * 0.7}`,
        `C ${noseLength * 0.85} ${centerY - halfFd * 0.85} ${noseLength} ${centerY - halfFd * 0.95} ${noseEndX} ${centerY - halfFd}`,
      ].join(' ')
      break
    case 'bulbous':
      // A380-style wide rounded nose
      nosePath = [
        `M 0 ${centerY}`,
        `C ${noseLength * 0.15} ${centerY - halfFd * 0.6} ${noseLength * 0.35} ${centerY - halfFd * 0.9} ${noseLength * 0.55} ${centerY - halfFd * 0.97}`,
        `Q ${noseLength * 0.8} ${centerY - halfFd} ${noseEndX} ${centerY - halfFd}`,
      ].join(' ')
      break
    case 'stepped':
      // 747-style - slightly wider at nose due to upper deck
      nosePath = [
        `M 0 ${centerY}`,
        `C ${noseLength * 0.2} ${centerY - halfFd * 0.5} ${noseLength * 0.5} ${centerY - halfFd * 0.85} ${noseLength * 0.7} ${centerY - halfFd * 0.95}`,
        `Q ${noseLength * 0.9} ${centerY - halfFd} ${noseEndX} ${centerY - halfFd}`,
      ].join(' ')
      break
    default:
      // Standard smooth taper
      nosePath = [
        `M 0 ${centerY}`,
        `C ${noseLength * 0.2} ${centerY - halfFd * 0.4} ${noseLength * 0.5} ${centerY - halfFd * 0.8} ${noseLength * 0.75} ${centerY - halfFd * 0.95}`,
        `Q ${noseLength} ${centerY - halfFd} ${noseEndX} ${centerY - halfFd}`,
      ].join(' ')
  }

  // Full fuselage outline with smooth tail cone
  const fuselagePath = [
    nosePath,
    `L ${tailStartX} ${centerY - halfFd}`,
    // Tail taper - smooth curve to tail tip
    `C ${tailStartX + tailLength * 0.4} ${centerY - halfFd * 0.95} ${tailStartX + tailLength * 0.75} ${centerY - halfFd * 0.55} ${length} ${centerY}`,
    // Return along bottom
    `C ${tailStartX + tailLength * 0.75} ${centerY + halfFd * 0.55} ${tailStartX + tailLength * 0.4} ${centerY + halfFd * 0.95} ${tailStartX} ${centerY + halfFd}`,
    `L ${noseEndX} ${centerY + halfFd}`,
    // Nose bottom (mirror)
    profile.noseStyle === 'pointed'
      ? `C ${noseLength} ${centerY + halfFd * 0.95} ${noseLength * 0.85} ${centerY + halfFd * 0.85} ${noseLength * 0.7} ${centerY + halfFd * 0.7} C ${noseLength * 0.4} ${centerY + halfFd * 0.4} ${noseLength * 0.15} ${centerY + halfFd * 0.15} 0 ${centerY}`
      : profile.noseStyle === 'bulbous'
        ? `Q ${noseLength * 0.8} ${centerY + halfFd} ${noseLength * 0.55} ${centerY + halfFd * 0.97} C ${noseLength * 0.35} ${centerY + halfFd * 0.9} ${noseLength * 0.15} ${centerY + halfFd * 0.6} 0 ${centerY}`
        : `Q ${noseLength} ${centerY + halfFd} ${noseLength * 0.75} ${centerY + halfFd * 0.95} C ${noseLength * 0.5} ${centerY + halfFd * 0.8} ${noseLength * 0.2} ${centerY + halfFd * 0.4} 0 ${centerY}`,
    'Z',
  ].join(' ')
  parts.push(fuselagePath)

  // ─── COCKPIT WINDOWS (small details from top) ───
  const cockpitX = noseLength * 0.65
  const cwW = halfFd * 0.6
  const cwH = halfFd * 0.3
  parts.push(
    `M ${cockpitX - cwW} ${centerY - cwH} L ${cockpitX + cwW} ${centerY - cwH} L ${cockpitX + cwW * 0.7} ${centerY + cwH} L ${cockpitX - cwW * 0.7} ${centerY + cwH} Z`,
  )

  // ─── WINGS ───
  const wingRootLeadingX = length * profile.wingPositionFrac
  const rootChord = length * profile.wingChordFrac
  const wingRootTrailingX = wingRootLeadingX + rootChord
  const sweepRad = (profile.wingSweepDeg * Math.PI) / 180
  const sweepOffset = Math.tan(sweepRad) * (halfSpan - halfFd)
  const tipChord = rootChord * profile.wingSpanwiseChordTaper

  const tipLeadingX = wingRootLeadingX + sweepOffset
  const tipTrailingX = tipLeadingX + tipChord

  // Is this a delta wing? (Concorde)
  const isDelta = profile.noseStyle === 'pointed' && profile.wingSweepDeg > 55

  if (isDelta) {
    // Concorde-style delta wing - huge triangle merging with fuselage
    // The wing basically IS the rear of the fuselage
    const deltaRootLeading = length * 0.30
    const deltaRootTrailing = length * 0.92

    // Port wing
    parts.push([
      `M ${deltaRootLeading} ${centerY - halfFd}`,
      `C ${deltaRootLeading + (deltaRootTrailing - deltaRootLeading) * 0.15} ${centerY - halfFd * 1.5} ${deltaRootLeading + (deltaRootTrailing - deltaRootLeading) * 0.35} ${centerY - halfSpan * 0.6} ${deltaRootTrailing * 0.75} ${centerY - halfSpan * 0.95}`,
      `L ${deltaRootTrailing * 0.78} ${centerY - halfSpan}`,
      // Trailing edge curves back
      `C ${deltaRootTrailing * 0.82} ${centerY - halfSpan * 0.85} ${deltaRootTrailing * 0.9} ${centerY - halfSpan * 0.5} ${deltaRootTrailing} ${centerY - halfFd}`,
      'Z',
    ].join(' '))

    // Starboard wing (mirror)
    parts.push([
      `M ${deltaRootLeading} ${centerY + halfFd}`,
      `C ${deltaRootLeading + (deltaRootTrailing - deltaRootLeading) * 0.15} ${centerY + halfFd * 1.5} ${deltaRootLeading + (deltaRootTrailing - deltaRootLeading) * 0.35} ${centerY + halfSpan * 0.6} ${deltaRootTrailing * 0.75} ${centerY + halfSpan * 0.95}`,
      `L ${deltaRootTrailing * 0.78} ${centerY + halfSpan}`,
      `C ${deltaRootTrailing * 0.82} ${centerY + halfSpan * 0.85} ${deltaRootTrailing * 0.9} ${centerY + halfSpan * 0.5} ${deltaRootTrailing} ${centerY + halfFd}`,
      'Z',
    ].join(' '))
  } else {
    // Standard swept wing with curved leading and trailing edges
    // Port wing
    const midSpanY = centerY - (halfSpan + halfFd) / 2
    const leadMidX = wingRootLeadingX + sweepOffset * 0.48
    const trailMidX = wingRootTrailingX + (tipTrailingX - wingRootTrailingX) * 0.45

    parts.push([
      `M ${wingRootLeadingX} ${centerY - halfFd}`,
      // Leading edge with gentle curve
      `C ${leadMidX - rootChord * 0.02} ${midSpanY + (halfSpan - halfFd) * 0.15} ${leadMidX} ${midSpanY} ${tipLeadingX} ${centerY - halfSpan}`,
      // Wing tip (rounded)
      `C ${tipLeadingX + tipChord * 0.15} ${centerY - halfSpan - halfFd * 0.05} ${tipTrailingX - tipChord * 0.1} ${centerY - halfSpan - halfFd * 0.03} ${tipTrailingX} ${centerY - halfSpan}`,
      // Trailing edge
      `C ${trailMidX + rootChord * 0.02} ${midSpanY} ${trailMidX} ${midSpanY + (halfSpan - halfFd) * 0.12} ${wingRootTrailingX} ${centerY - halfFd}`,
      'Z',
    ].join(' '))

    // Starboard wing (mirror)
    const midSpanYs = centerY + (halfSpan + halfFd) / 2
    const leadMidXs = wingRootLeadingX + sweepOffset * 0.48
    const trailMidXs = wingRootTrailingX + (tipTrailingX - wingRootTrailingX) * 0.45

    parts.push([
      `M ${wingRootLeadingX} ${centerY + halfFd}`,
      `C ${leadMidXs - rootChord * 0.02} ${midSpanYs - (halfSpan - halfFd) * 0.15} ${leadMidXs} ${midSpanYs} ${tipLeadingX} ${centerY + halfSpan}`,
      `C ${tipLeadingX + tipChord * 0.15} ${centerY + halfSpan + halfFd * 0.05} ${tipTrailingX - tipChord * 0.1} ${centerY + halfSpan + halfFd * 0.03} ${tipTrailingX} ${centerY + halfSpan}`,
      `C ${trailMidXs + rootChord * 0.02} ${midSpanYs} ${trailMidXs} ${midSpanYs - (halfSpan - halfFd) * 0.12} ${wingRootTrailingX} ${centerY + halfFd}`,
      'Z',
    ].join(' '))

    // ─── WINGLETS / SHARKLETS / RAKED TIPS (top view) ───
    if (profile.hasWinglets || profile.hasSharklets) {
      const wletLen = tipChord * 0.6
      const wletWidth = halfFd * 0.15
      // Port
      parts.push([
        `M ${tipTrailingX} ${centerY - halfSpan}`,
        `L ${tipTrailingX - wletLen * 0.3} ${centerY - halfSpan - wletWidth}`,
        `L ${tipLeadingX + tipChord * 0.2} ${centerY - halfSpan - wletWidth * 0.8}`,
        `L ${tipLeadingX} ${centerY - halfSpan}`,
        'Z',
      ].join(' '))
      // Starboard
      parts.push([
        `M ${tipTrailingX} ${centerY + halfSpan}`,
        `L ${tipTrailingX - wletLen * 0.3} ${centerY + halfSpan + wletWidth}`,
        `L ${tipLeadingX + tipChord * 0.2} ${centerY + halfSpan + wletWidth * 0.8}`,
        `L ${tipLeadingX} ${centerY + halfSpan}`,
        'Z',
      ].join(' '))
    }

    if (profile.hasRakedTips) {
      const rakeLen = tipChord * 0.7
      const rakeExt = halfFd * 0.2
      // Port
      parts.push([
        `M ${tipLeadingX} ${centerY - halfSpan}`,
        `L ${tipLeadingX + rakeLen * 0.3} ${centerY - halfSpan - rakeExt}`,
        `L ${tipLeadingX + rakeLen} ${centerY - halfSpan - rakeExt * 0.5}`,
        `L ${tipTrailingX} ${centerY - halfSpan}`,
        'Z',
      ].join(' '))
      // Starboard
      parts.push([
        `M ${tipLeadingX} ${centerY + halfSpan}`,
        `L ${tipLeadingX + rakeLen * 0.3} ${centerY + halfSpan + rakeExt}`,
        `L ${tipLeadingX + rakeLen} ${centerY + halfSpan + rakeExt * 0.5}`,
        `L ${tipTrailingX} ${centerY + halfSpan}`,
        'Z',
      ].join(' '))
    }
  }

  // ─── HORIZONTAL STABILIZER ───
  // Skip for delta-wing aircraft (Concorde has no separate h-stab)
  if (!isDelta) {
    const hStabSpan = wingspan * profile.hStabSpanFrac
    const hStabHalf = hStabSpan / 2
    const hStabChord = rootChord * 0.38
    const hStabSweep = Math.tan((profile.vStabSweepDeg * Math.PI) / 180) * (hStabHalf - halfFd * 0.4)

    // Position depends on tail style
    let hStabRootX: number
    if (profile.tailStyle === 'T-tail') {
      hStabRootX = length - tailLength * 0.15
    } else if (profile.tailStyle === 'cruciform') {
      hStabRootX = length - tailLength * 0.3
    } else {
      hStabRootX = length - tailLength * 0.55
    }

    const hTipLeadX = hStabRootX + hStabSweep
    const hTipTrailX = hTipLeadX + hStabChord * profile.wingSpanwiseChordTaper

    // Port h-stab
    parts.push([
      `M ${hStabRootX} ${centerY - halfFd * 0.4}`,
      `C ${hStabRootX + hStabSweep * 0.5} ${centerY - hStabHalf * 0.5} ${hTipLeadX - hStabChord * 0.05} ${centerY - hStabHalf * 0.9} ${hTipLeadX} ${centerY - hStabHalf}`,
      `L ${hTipTrailX} ${centerY - hStabHalf}`,
      `C ${hStabRootX + hStabChord * 0.7} ${centerY - hStabHalf * 0.5} ${hStabRootX + hStabChord} ${centerY - halfFd * 0.5} ${hStabRootX + hStabChord} ${centerY - halfFd * 0.4}`,
      'Z',
    ].join(' '))

    // Starboard h-stab
    parts.push([
      `M ${hStabRootX} ${centerY + halfFd * 0.4}`,
      `C ${hStabRootX + hStabSweep * 0.5} ${centerY + hStabHalf * 0.5} ${hTipLeadX - hStabChord * 0.05} ${centerY + hStabHalf * 0.9} ${hTipLeadX} ${centerY + hStabHalf}`,
      `L ${hTipTrailX} ${centerY + hStabHalf}`,
      `C ${hStabRootX + hStabChord * 0.7} ${centerY + hStabHalf * 0.5} ${hStabRootX + hStabChord} ${centerY + halfFd * 0.5} ${hStabRootX + hStabChord} ${centerY + halfFd * 0.4}`,
      'Z',
    ].join(' '))
  }

  // ─── VERTICAL STABILIZER (from above: thin shape along centerline) ───
  const vStabRootX = length - tailLength * 0.7
  const vStabTipX = vStabRootX + length * profile.vStabChordFrac * 0.6
  const vStabThickness = halfFd * 0.12

  if (profile.tailStyle === 'H-tail') {
    // AN-225 dual vertical stabilizers - at tips of h-stab
    const hStabHalf = wingspan * profile.hStabSpanFrac / 2
    const positions = [centerY - hStabHalf, centerY + hStabHalf]
    positions.forEach((py) => {
      parts.push([
        `M ${vStabRootX} ${py - vStabThickness}`,
        `L ${vStabTipX} ${py - vStabThickness * 0.7}`,
        `L ${vStabTipX} ${py + vStabThickness * 0.7}`,
        `L ${vStabRootX} ${py + vStabThickness}`,
        'Z',
      ].join(' '))
    })
  } else {
    // Single vertical stabilizer on centerline
    parts.push([
      `M ${vStabRootX} ${centerY - vStabThickness}`,
      `L ${vStabTipX} ${centerY - vStabThickness * 0.5}`,
      `L ${vStabTipX} ${centerY + vStabThickness * 0.5}`,
      `L ${vStabRootX} ${centerY + vStabThickness}`,
      'Z',
    ].join(' '))
  }

  // ─── ENGINE NACELLES ───
  const engineDiameter = profile.engineDiameterM
  const halfEngD = engineDiameter / 2
  const nacelleLength = engineDiameter * 2.2

  function drawNacelle(cx: number, cy: number): string {
    // Elongated oval nacelle from top view
    const nx = cx - nacelleLength / 2
    return [
      `M ${nx} ${cy}`,
      `C ${nx} ${cy - halfEngD * 0.85} ${nx + nacelleLength * 0.15} ${cy - halfEngD} ${cx} ${cy - halfEngD}`,
      `C ${cx + nacelleLength * 0.35} ${cy - halfEngD} ${nx + nacelleLength} ${cy - halfEngD * 0.7} ${nx + nacelleLength} ${cy}`,
      `C ${nx + nacelleLength} ${cy + halfEngD * 0.7} ${cx + nacelleLength * 0.35} ${cy + halfEngD} ${cx} ${cy + halfEngD}`,
      `C ${nx + nacelleLength * 0.15} ${cy + halfEngD} ${nx} ${cy + halfEngD * 0.85} ${nx} ${cy}`,
      'Z',
    ].join(' ')
  }

  function drawPylon(engineCx: number, engineCy: number, attachY: number): string {
    // Thin pylon connecting engine to wing/fuselage
    const pylonWidth = halfEngD * 0.15
    const py1 = Math.min(engineCy, attachY)
    const py2 = Math.max(engineCy, attachY)
    return `M ${engineCx - pylonWidth} ${py1} L ${engineCx + pylonWidth} ${py1} L ${engineCx + pylonWidth} ${py2} L ${engineCx - pylonWidth} ${py2} Z`
  }

  switch (profile.engineMountStyle) {
    case 'underwing': {
      if (profile.engineSpanPositions) {
        profile.engineSpanPositions.forEach((spanPos: number) => {
          // Engine position along the wing
          const wingProgress = spanPos
          const engineLeadX = wingRootLeadingX + sweepOffset * wingProgress
          const engineCx = engineLeadX + (isDelta ? rootChord * 0.6 : rootChord * 0.2)
          const portY = centerY - halfSpan * wingProgress
          const starY = centerY + halfSpan * wingProgress

          // Port nacelle + pylon
          parts.push(drawNacelle(engineCx, portY))
          parts.push(drawPylon(engineCx, portY + halfEngD, centerY - halfFd))

          // Starboard nacelle + pylon
          parts.push(drawNacelle(engineCx, starY))
          parts.push(drawPylon(engineCx, starY - halfEngD, centerY + halfFd))
        })
      }
      break
    }

    case 'rear-fuselage': {
      // Engines on sides of rear fuselage
      const engineCx = tailStartX - engineDiameter * 0.3
      parts.push(drawNacelle(engineCx, centerY - halfFd - halfEngD * 0.3))
      parts.push(drawNacelle(engineCx, centerY + halfFd + halfEngD * 0.3))
      break
    }

    case 'tail-s-duct': {
      // Two side-mounted + center S-duct
      const engineCx = tailStartX - engineDiameter * 0.3
      parts.push(drawNacelle(engineCx, centerY - halfFd - halfEngD * 0.3))
      parts.push(drawNacelle(engineCx, centerY + halfFd + halfEngD * 0.3))
      // Center engine (S-duct) - visible as intake at tail base
      if (profile.engineCount >= 3) {
        const centerCx = tailStartX + tailLength * 0.15
        parts.push(drawNacelle(centerCx, centerY))
      }
      break
    }

    case 'mixed-trijet': {
      // Two underwing + one through tail
      if (profile.engineSpanPositions) {
        profile.engineSpanPositions.forEach((spanPos: number) => {
          const wingProgress = spanPos
          const engineLeadX = wingRootLeadingX + sweepOffset * wingProgress
          const engineCx = engineLeadX + rootChord * 0.2
          const portY = centerY - halfSpan * wingProgress
          const starY = centerY + halfSpan * wingProgress

          parts.push(drawNacelle(engineCx, portY))
          parts.push(drawPylon(engineCx, portY + halfEngD, centerY - halfFd))
          parts.push(drawNacelle(engineCx, starY))
          parts.push(drawPylon(engineCx, starY - halfEngD, centerY + halfFd))
        })
      }
      // Center engine through vertical stabilizer
      const centerCx = tailStartX + tailLength * 0.2
      parts.push(drawNacelle(centerCx, centerY))
      break
    }
  }

  // ─── WINDOW LINE (subtle detail) ───
  // A dotted line of small rectangles along each side of the fuselage
  const windowStartX = noseEndX + halfFd * 0.5
  const windowEndX = tailStartX - halfFd * 0.3
  const windowSpacing = halfFd * 0.35
  const windowSize = halfFd * 0.08

  if (windowSpacing > 0.3) {
    for (let wx = windowStartX; wx < windowEndX; wx += windowSpacing) {
      // Port side windows
      parts.push(`M ${wx - windowSize} ${centerY - halfFd + windowSize * 0.5} L ${wx + windowSize} ${centerY - halfFd + windowSize * 0.5} L ${wx + windowSize} ${centerY - halfFd + windowSize * 2} L ${wx - windowSize} ${centerY - halfFd + windowSize * 2} Z`)
      // Starboard side windows
      parts.push(`M ${wx - windowSize} ${centerY + halfFd - windowSize * 2} L ${wx + windowSize} ${centerY + halfFd - windowSize * 2} L ${wx + windowSize} ${centerY + halfFd - windowSize * 0.5} L ${wx - windowSize} ${centerY + halfFd - windowSize * 0.5} Z`)
    }
  }

  return parts.join(' ')
}

export interface SilhouetteData {
  path: string
  /** Fine detail lines rendered separately with thinner stroke (windows, doors, etc.) */
  detailPath?: string
  viewBox: string
  widthM: number
  heightM: number
}

export function generateSilhouette(
  spec: AircraftSpec,
  _category: AircraftCategory,
  view: 'side' | 'top',
): SilhouetteData {
  const padding = 1

  if (view === 'side') {
    const path = generateSideViewPath(spec)
    const detailPath = generateSideViewDetailPath(spec)
    const w = spec.length.metric
    const h = spec.height.metric
    return {
      path,
      detailPath: detailPath || undefined,
      viewBox: `${-padding} ${-padding} ${w + padding * 2} ${h + padding * 2}`,
      widthM: w,
      heightM: h,
    }
  } else {
    const path = generateTopViewPath(spec)
    const w = spec.length.metric
    const h = spec.wingspan.metric
    return {
      path,
      viewBox: `${-padding} ${-padding} ${w + padding * 2} ${h + padding * 2}`,
      widthM: w,
      heightM: h,
    }
  }
}
