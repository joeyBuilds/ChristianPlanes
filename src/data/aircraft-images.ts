/**
 * Aircraft Image Registry
 *
 * Maps aircraft slugs to their side-view image filenames.
 * Images should be placed in /public/aircraft-images/side/
 *
 * File naming convention: use the aircraft slug, lowercased, with spaces
 * replaced by dashes. Example: "A330-900neo" → "a330-900neo.png"
 *
 * Images should be:
 * - Side-profile views on a white/transparent background
 * - Landscape orientation (wider than tall)
 * - Facing LEFT (nose on left side)
 * - Reasonably high resolution (at least 1000px wide recommended)
 */

// Slug → image filename mapping
// Add entries here as images become available
const IMAGE_REGISTRY: Record<string, string> = {
  // ---- Airbus ----
  'A220-100': 'a220-100.webp',
  'A220-300': 'a220-300.webp',
  'A318': 'a318.webp',
  'A319': 'a319.webp',
  'A319neo': 'a319neo.webp',
  'A320-200': 'a320-200.webp',
  'A320neo': 'a320neo.webp',
  'A321-200': 'a321-200.webp',
  'A321LR': 'a321lr.jpg',
  'A321neo': 'a321neo.webp',
  // 'A321XLR': 'a321xlr.png',
  'A300-600': 'a300-600.webp',
  'A310-300': 'a310-300.webp',
  'A330-200': 'a330-200.webp',
  // 'A330-300': 'a330-300.png',
  // 'A330-800neo': 'a330-800neo.png',
  'A330-900neo': 'a330-900neo.jpg',
  // 'A340-200': 'a340-200.png',
  // 'A340-300X': 'a340-300x.png',
  // 'A340-500': 'a340-500.png',
  // 'A340-600': 'a340-600.png',
  // 'A350-800': 'a350-800.png',
  // 'A350-900': 'a350-900.png',
  // 'A350-900ULR': 'a350-900ulr.png',
  // 'A350-1000': 'a350-1000.png',
  // 'A380-800': 'a380-800.png',
  'A300-600F': 'a300-600f.webp',
  // 'A380-800F': 'a380-800f.png',

  // ---- Boeing ----
  '707-320B': '707-320b.webp',
  // '717-200HGW': '717-200hgw.png',
  // '727-200ADV': '727-200adv.png',
  // '737-200': '737-200.png',
  // '737-300': '737-300.png',
  // '737-400': '737-400.png',
  // '737-500': '737-500.png',
  // '737-600': '737-600.png',
  // '737-700': '737-700.png',
  // '737-800': '737-800.png',
  // '737-900': '737-900.png',
  // '737-900ER': '737-900er.png',
  // '737 MAX 7': '737-max-7.png',
  // '737 MAX 8': '737-max-8.png',
  // '737 MAX 9': '737-max-9.png',
  // '737 MAX 10': '737-max-10.png',
  // '757-200': '757-200.png',
  // '757-300': '757-300.png',
  '767-200ER': '767-200er.webp',
  // '767-300ER': '767-300er.png',
  // '767-400ER': '767-400er.png',
  // '777-200': '777-200.png',
  // '777-200ER': '777-200er.png',
  // '777-200LR Worldliner': '777-200lr.png',
  // '777-300': '777-300.png',
  // '777-300ER': '777-300er.png',
  // '777-8': '777-8.png',
  // '777-9': '777-9.png',
  // '787-8': '787-8.png',
  // '787-9': '787-9.png',
  // '787-10': '787-10.png',
  // '747-400': '747-400.png',
  // '747-400ER': '747-400er.png',
  // '747-8I': '747-8i.png',
  // '747-400F': '747-400f.png',
  // '747-400ERF': '747-400erf.png',
  // '747-8F': '747-8f.png',

  // ---- Other ----
  'Concorde': 'concorde.webp',
  // 'CRJ700': 'crj700.png',
  // 'CRJ900': 'crj900.png',
  // 'CRJ1000': 'crj1000.png',
  // 'CS100': 'cs100.png',
  // 'CS300': 'cs300.png',
  // 'ARJ21-700': 'arj21-700.png',
  // 'ARJ21-700ER': 'arj21-700er.png',
  // 'ARJ21-900': 'arj21-900.png',
  // 'ARJ21-900ER': 'arj21-900er.png',
  // 'DC-8-61': 'dc-8-61.png',
  // 'E170': 'e170.png',
  // 'E175': 'e175.png',
  // 'E175-E2': 'e175-e2.png',
  // 'E190': 'e190.png',
  // 'E190-E2': 'e190-e2.png',
  // 'E195': 'e195.png',
  // 'E195-E2': 'e195-e2.png',
  'L-1011 TriStar 500': 'l-1011-tristar-500.webp',
  // 'C-5 Galaxy': 'c-5-galaxy.png',
  // 'DC-9-30': 'dc-9-30.png',
  'DC-10-30': 'dc-10-30.webp',
  // 'MD-11': 'md-11.png',
  // 'SSJ 100 95': 'ssj-100-95.png',
  // 'SSJ 100 95LR': 'ssj-100-95lr.png',
  // 'TU-154M': 'tu-154m.png',
  // 'AN-124': 'an-124.png',
  // 'AN-225': 'an-225.png',
}

/**
 * Get the image URL for an aircraft's side view, or null if no image is available.
 */
export function getAircraftImageUrl(slug: string): string | null {
  const filename = IMAGE_REGISTRY[slug]
  if (!filename) return null
  return `/aircraft-images/side/${filename}`
}

/**
 * Check if an aircraft has a photo/illustration available.
 */
export function hasAircraftImage(slug: string): boolean {
  return slug in IMAGE_REGISTRY
}
