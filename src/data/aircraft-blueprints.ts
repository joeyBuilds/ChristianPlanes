/**
 * Aircraft Blueprint SVG Registry
 *
 * Maps aircraft slugs to their CAD-exported SVG/PNG blueprint filenames,
 * with separate crops for each view angle (side, top, front).
 *
 * Only high-quality CAD exports are registered here (bigNuts collection).
 * All other aircraft fall through to procedural silhouette rendering.
 *
 * SVG/PNG files are stored in /public/aircraft-images/blueprint/
 */

import type { ViewAngle } from '@/types/canvas'

interface BlueprintViews {
  side: string
  top: string
  front: string
}

const BLUEPRINT_REGISTRY: Record<string, BlueprintViews> = {
  'A350-1000': {
    side: 'a350-1000-side.svg',
    top: 'a350-1000-top.svg',
    front: 'a350-1000-front.svg',
  },
  '747-8F': {
    side: '747-8f-side.svg',
    top: '747-8f-top.svg',
    front: '747-8f-front.svg',
  },
  'E175': {
    side: 'e175-side.png',
    top: 'e175-top.png',
    front: 'e175-front.png',
  },
}

/**
 * Get the blueprint SVG URL for an aircraft + view angle,
 * or null if no SVG blueprint is available.
 */
export function getAircraftBlueprintUrl(slug: string, view: ViewAngle = 'side'): string | null {
  const views = BLUEPRINT_REGISTRY[slug]
  if (!views) return null
  const filename = views[view]
  if (!filename) return null
  return `/aircraft-images/blueprint/${filename}`
}

/**
 * Check if an aircraft has a real SVG blueprint available.
 */
export function hasAircraftBlueprint(slug: string): boolean {
  return slug in BLUEPRINT_REGISTRY
}
