/**
 * Aircraft Blueprint SVG Registry
 */

import type { ViewAngle } from '@/types/canvas'

interface BlueprintViews {
  side: string
  top: string
  front: string
}

const BLUEPRINT_REGISTRY: Record<string, BlueprintViews> = {
  '727-200ADV': {
    side: '727-200ADV-side.png',
    top: '727-200ADV-top.png',
    front: '727-200ADV-front.png',
  },
  '737-200': {
    side: '737-200-side.png',
    top: '737-200-top.png',
    front: '737-200-front.png',
  },
  '737-400': {
    side: '737-400-side.png',
    top: '737-400-top.png',
    front: '737-400-front.png',
  },
  '737-500': {
    side: '737-500-side.png',
    top: '737-500-top.png',
    front: '737-500-front.png',
  },
  '737-600': {
    side: '737-600-side.png',
    top: '737-600-top.png',
    front: '737-600-front.png',
  },
  '737-700': {
    side: '737-700-side.png',
    top: '737-700-top.png',
    front: '737-700-front.png',
  },
  '737-800': {
    side: '737-800-side.png',
    top: '737-800-top.png',
    front: '737-800-front.png',
  },
  '737-900': {
    side: '737-900-side.png',
    top: '737-900-top.png',
    front: '737-900-front.png',
  },
  '737-900ER': {
    side: '737-900ER-side.png',
    top: '737-900ER-top.png',
    front: '737-900ER-front.png',
  },
  '747-400': {
    side: '747-400-side.png',
    top: '747-400-top.png',
    front: '747-400-front.png',
  },
  '747-8I': {
    side: '747-8I-side.png',
    top: '747-8I-top.png',
    front: '747-8I-front.png',
  },
  '747-8F': {
    side: '747-8f-side.svg',
    top: '747-8f-top.svg',
    front: '747-8f-front.svg',
  },
  '757-200': {
    side: '757-200-side.png',
    top: '757-200-top.png',
    front: '757-200-front.png',
  },
  '757-300': {
    side: '757-300-side.png',
    top: '757-300-top.png',
    front: '757-300-front.png',
  },
  '767-200ER': {
    side: '767-200ER-side.png',
    top: '767-200ER-top.png',
    front: '767-200ER-front.png',
  },
  '767-400ER': {
    side: '767-400ER-side.png',
    top: '767-400ER-top.png',
    front: '767-400ER-front.png',
  },
  '777-200': {
    side: '777-200-side.png',
    top: '777-200-top.png',
    front: '777-200-front.png',
  },
  '777-200LR Worldliner': {
    side: '777-200LR-side.png',
    top: '777-200LR-top.png',
    front: '777-200LR-front.png',
  },
  '777-300': {
    side: '777-300-side.png',
    top: '777-300-top.png',
    front: '777-300-front.png',
  },
  '777-300ER': {
    side: '777-300ER-side.png',
    top: '777-300ER-top.png',
    front: '777-300ER-front.png',
  },
  '777-8': {
    side: '777-8-side.png',
    top: '777-8-top.png',
    front: '777-8-front.png',
  },
  '777-9': {
    side: '777-9-side.png',
    top: '777-9-top.png',
    front: '777-9-front.png',
  },
  'DC-10-30': {
    side: 'DC-10-30-side.png',
    top: 'DC-10-30-top.png',
    front: 'DC-10-30-front.png',
  },
  'DC-8-61': {
    side: 'DC-8-61-side.png',
    top: 'DC-8-61-top.png',
    front: 'DC-8-61-front.png',
  },
  'DC-9-30': {
    side: '',
    top: 'DC-9-30-top.png',
    front: '',
  },
  'MD-11': {
    side: 'MD-11-side.png',
    top: 'MD-11-top.png',
    front: 'MD-11-front.png',
  },
  'A350-1000': {
    side: 'a350-1000-side.svg',
    top: 'a350-1000-top.png',
    front: 'a350-1000-front.svg',
  },
  'E175': {
    side: 'e175-side.png',
    top: 'e175-top.png',
    front: 'e175-front.png',
  },
}

export function getAircraftBlueprintUrl(slug: string, view: ViewAngle = 'side'): string | null {
  const views = BLUEPRINT_REGISTRY[slug]
  if (!views) return null
  const filename = views[view]
  if (!filename) return null
  return `/aircraft-images/blueprint/${filename}`
}

export function hasAircraftBlueprint(slug: string): boolean {
  return slug in BLUEPRINT_REGISTRY
}

/**
 * Check if an aircraft has all 3 views (side, top, front).
 * Returns false if any view is missing.
 */
export function hasFullBlueprint(slug: string): boolean {
  const views = BLUEPRINT_REGISTRY[slug]
  if (!views) return false
  return !!(views.side && views.top && views.front)
}
