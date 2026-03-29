/**
 * Aircraft Type Rating Families
 *
 * Aircraft that share a type rating — pilots certified on one
 * can fly the others without additional type training.
 */

export interface TypeRating {
  family: string
  aircraft: string[]  // catalog slugs
}

export const TYPE_RATINGS: TypeRating[] = [
  {
    family: 'A320',
    aircraft: ['A318', 'A319', 'A319neo', 'A320-200', 'A320neo', 'A321-200', 'A321neo', 'A321LR', 'A321XLR'],
  },
  {
    family: 'A330/A340',
    aircraft: ['A330-200', 'A330-300', 'A330-800neo', 'A330-900neo', 'A340-200', 'A340-300X', 'A340-500', 'A340-600'],
  },
  {
    family: 'A350',
    aircraft: ['A350-800', 'A350-900', 'A350-900ULR', 'A350-1000'],
  },
  {
    family: 'A220',
    aircraft: ['A220-100', 'A220-300', 'CS100', 'CS300'],
  },
  {
    family: 'B737',
    aircraft: ['737-200', '737-300', '737-400', '737-500', '737-600', '737-700', '737-800', '737-900', '737-900ER', '737 MAX 7', '737 MAX 8', '737 MAX 9', '737 MAX 10'],
  },
  {
    family: 'B747',
    aircraft: ['747-400', '747-400ER', '747-400ERF', '747-400F', '747-8F', '747-8I'],
  },
  {
    family: 'B757/B767',
    aircraft: ['757-200', '757-300', '767-200ER', '767-300ER', '767-400ER'],
  },
  {
    family: 'B777',
    aircraft: ['777-200', '777-200ER', '777-200LR Worldliner', '777-300', '777-300ER', '777-8', '777-9'],
  },
  {
    family: 'B787',
    aircraft: ['787-8', '787-9', '787-10'],
  },
  {
    family: 'ERJ 170/190',
    aircraft: ['E170', 'E175', 'E190', 'E195'],
  },
  {
    family: 'E-Jet E2',
    aircraft: ['E175-E2', 'E190-E2', 'E195-E2'],
  },
  {
    family: 'CRJ',
    aircraft: ['CRJ700', 'CRJ900', 'CRJ1000'],
  },
  {
    family: 'DC-9/MD-80/717',
    aircraft: ['DC-9-30', '717-200HGW'],
  },
  {
    family: 'A380',
    aircraft: ['A380-800', 'A380-800F'],
  },
]

/**
 * Get the type rating family for an aircraft slug.
 */
export function getTypeRating(slug: string): string | null {
  for (const tr of TYPE_RATINGS) {
    if (tr.aircraft.includes(slug)) return tr.family
  }
  return null
}

/**
 * Check if two aircraft share a type rating.
 */
export function shareTypeRating(slug1: string, slug2: string): boolean {
  for (const tr of TYPE_RATINGS) {
    if (tr.aircraft.includes(slug1) && tr.aircraft.includes(slug2)) return true
  }
  return false
}

/**
 * Get all aircraft that share a type rating with the given slug.
 */
export function getTypeRatingFamily(slug: string): string[] {
  for (const tr of TYPE_RATINGS) {
    if (tr.aircraft.includes(slug)) return tr.aircraft.filter(s => s !== slug)
  }
  return []
}
