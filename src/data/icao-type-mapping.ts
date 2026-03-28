/**
 * Maps aircraft catalog slugs to ICAO type designator codes used by ADS-B / OpenSky.
 * Only aircraft that are currently in active commercial/cargo service are included.
 * Historical/retired types (Concorde, AN-225, etc.) are intentionally omitted.
 */
export const SLUG_TO_ICAO_TYPES: Record<string, string[]> = {
  // Airbus Narrowbody
  'A220-100': ['BCS1'],
  'A220-300': ['BCS3'],
  'A318': ['A318'],
  'A319': ['A319'],
  'A319neo': ['A19N'],
  'A320-200': ['A320'],
  'A320neo': ['A20N'],
  'A321-200': ['A321'],
  'A321LR': ['A21N'],
  'A321neo': ['A21N'],
  'A321XLR': ['A21N'],

  // Airbus Widebody
  'A300-600': ['A306'],
  'A310-300': ['A313'],
  'A330-200': ['A332'],
  'A330-300': ['A333'],
  'A330-800neo': ['A338'],
  'A330-900neo': ['A339'],
  'A340-200': ['A342'],
  'A340-300X': ['A343'],
  'A340-500': ['A345'],
  'A340-600': ['A346'],
  'A350-900': ['A359'],
  'A350-900ULR': ['A359'],
  'A350-1000': ['A35K'],
  'A380-800': ['A388'],

  // Airbus Cargo
  'A300-600F': ['A306'],

  // Antonov
  'AN-124': ['A124'],

  // Boeing Narrowbody
  '717-200HGW': ['B712'],
  '737-200': ['B732'],
  '737-300': ['B733'],
  '737-400': ['B734'],
  '737-500': ['B735'],
  '737-600': ['B736'],
  '737-700': ['B737'],
  '737-800': ['B738'],
  '737-900': ['B739'],
  '737-900ER': ['B739'],
  '737 MAX 7': ['B37M'],
  '737 MAX 8': ['B38M'],
  '737 MAX 9': ['B39M'],
  '737 MAX 10': ['B3XM'],
  '757-200': ['B752'],
  '757-300': ['B753'],

  // Boeing Widebody
  '767-200ER': ['B762'],
  '767-300ER': ['B763'],
  '767-400ER': ['B764'],
  '777-200': ['B772'],
  '777-200ER': ['B772'],
  '777-200LR Worldliner': ['B77L'],
  '777-300': ['B773'],
  '777-300ER': ['B77W'],
  '777-8': ['B778'],
  '777-9': ['B779'],
  '787-8': ['B788'],
  '787-9': ['B789'],
  '787-10': ['B78X'],
  '747-400': ['B744'],
  '747-400ER': ['B744'],
  '747-8I': ['B748'],

  // Boeing Cargo
  '747-400F': ['B744'],
  '747-400ERF': ['B744'],
  '747-8F': ['B748'],

  // Bombardier
  'CRJ700': ['CRJ7'],
  'CRJ900': ['CRJ9'],
  'CRJ1000': ['CRJX'],
  'CS100': ['BCS1'],
  'CS300': ['BCS3'],

  // Comac
  'ARJ21-700': ['AJ27'],
  'ARJ21-700ER': ['AJ27'],
  'ARJ21-900': ['AJ27'],
  'ARJ21-900ER': ['AJ27'],

  // Embraer
  'E170': ['E170'],
  'E175': ['E75S', 'E75L'],
  'E175-E2': ['E75S'],
  'E190': ['E190'],
  'E190-E2': ['E290'],
  'E195': ['E195'],
  'E195-E2': ['E295'],

  // McDonnell-Douglas
  'DC-10-30': ['DC10'],
  'MD-11': ['MD11'],

  // Sukhoi
  'SSJ 100 95': ['SU95'],
  'SSJ 100 95LR': ['SU95'],

  // Tupolev
  'TU-154M': ['T154'],
}

/**
 * Get ICAO type designators for a given aircraft slug.
 * Returns empty array if no mapping exists.
 */
export function getIcaoTypes(slug: string): string[] {
  return SLUG_TO_ICAO_TYPES[slug] ?? []
}
