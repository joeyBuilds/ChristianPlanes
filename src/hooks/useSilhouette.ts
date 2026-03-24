import { useMemo } from 'react'
import type { AircraftSpec, AircraftCategory } from '@/types/aircraft'
import type { ViewAngle } from '@/types/canvas'
import { generateSilhouette, type SilhouetteData } from '@/lib/silhouette-generator'
import { getAircraftBySlug } from '@/data/aircraft-catalog'

export function useSilhouette(
  spec: AircraftSpec | undefined,
  view: ViewAngle,
): SilhouetteData | null {
  return useMemo(() => {
    if (!spec || spec.length.metric === 0) return null

    const catalogEntry = getAircraftBySlug(spec.slug)
    const category: AircraftCategory = catalogEntry?.category ?? 'narrowbody'

    return generateSilhouette(spec, category, view)
  }, [spec, view])
}
