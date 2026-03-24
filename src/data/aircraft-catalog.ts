import type { AircraftCatalogEntry } from '@/types/aircraft'

export const aircraftCatalog: AircraftCatalogEntry[] = [
  // Aerospatiale/BAe
  { displayName: "Concorde", slug: "Concorde", manufacturer: "Aerospatiale/BAe", category: "supersonic" },

  // Airbus - Narrowbody
  { displayName: "Airbus A220-100", slug: "A220-100", manufacturer: "Airbus", category: "narrowbody" },
  { displayName: "Airbus A220-300", slug: "A220-300", manufacturer: "Airbus", category: "narrowbody" },
  { displayName: "Airbus A318", slug: "A318", manufacturer: "Airbus", category: "narrowbody" },
  { displayName: "Airbus A319", slug: "A319", manufacturer: "Airbus", category: "narrowbody" },
  { displayName: "Airbus A319neo", slug: "A319neo", manufacturer: "Airbus", category: "narrowbody" },
  { displayName: "Airbus A320-200", slug: "A320-200", manufacturer: "Airbus", category: "narrowbody" },
  { displayName: "Airbus A320neo", slug: "A320neo", manufacturer: "Airbus", category: "narrowbody" },
  { displayName: "Airbus A321-200", slug: "A321-200", manufacturer: "Airbus", category: "narrowbody" },
  { displayName: "Airbus A321LR", slug: "A321LR", manufacturer: "Airbus", category: "narrowbody" },
  { displayName: "Airbus A321neo", slug: "A321neo", manufacturer: "Airbus", category: "narrowbody" },
  { displayName: "Airbus A321XLR", slug: "A321XLR", manufacturer: "Airbus", category: "narrowbody" },

  // Airbus - Widebody
  { displayName: "Airbus A300-600", slug: "A300-600", manufacturer: "Airbus", category: "widebody" },
  { displayName: "Airbus A310-300", slug: "A310-300", manufacturer: "Airbus", category: "widebody" },
  { displayName: "Airbus A330-200", slug: "A330-200", manufacturer: "Airbus", category: "widebody" },
  { displayName: "Airbus A330-300", slug: "A330-300", manufacturer: "Airbus", category: "widebody" },
  { displayName: "Airbus A330-800neo", slug: "A330-800neo", manufacturer: "Airbus", category: "widebody" },
  { displayName: "Airbus A330-900neo", slug: "A330-900neo", manufacturer: "Airbus", category: "widebody" },
  { displayName: "Airbus A340-200", slug: "A340-200", manufacturer: "Airbus", category: "widebody" },
  { displayName: "Airbus A340-300X", slug: "A340-300X", manufacturer: "Airbus", category: "widebody" },
  { displayName: "Airbus A340-500", slug: "A340-500", manufacturer: "Airbus", category: "widebody" },
  { displayName: "Airbus A340-600", slug: "A340-600", manufacturer: "Airbus", category: "widebody" },
  { displayName: "Airbus A350-800", slug: "A350-800", manufacturer: "Airbus", category: "widebody" },
  { displayName: "Airbus A350-900", slug: "A350-900", manufacturer: "Airbus", category: "widebody" },
  { displayName: "Airbus A350-900ULR", slug: "A350-900ULR", manufacturer: "Airbus", category: "widebody" },
  { displayName: "Airbus A350-1000", slug: "A350-1000", manufacturer: "Airbus", category: "widebody" },
  { displayName: "Airbus A380-800", slug: "A380-800", manufacturer: "Airbus", category: "widebody" },

  // Airbus - Cargo
  { displayName: "Airbus A300-600F", slug: "A300-600F", manufacturer: "Airbus", category: "cargo" },
  { displayName: "Airbus A380-800F", slug: "A380-800F", manufacturer: "Airbus", category: "cargo" },

  // Antonov
  { displayName: "Antonov AN-124", slug: "AN-124", manufacturer: "Antonov", category: "cargo" },
  { displayName: "Antonov AN-225", slug: "AN-225", manufacturer: "Antonov", category: "cargo" },

  // Boeing - Narrowbody
  { displayName: "Boeing 707-320B", slug: "707-320B", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 717-200HGW", slug: "717-200HGW", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 727-200ADV", slug: "727-200ADV", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 737-200", slug: "737-200", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 737-300", slug: "737-300", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 737-400", slug: "737-400", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 737-500", slug: "737-500", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 737-600", slug: "737-600", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 737-700", slug: "737-700", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 737-800", slug: "737-800", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 737-900", slug: "737-900", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 737-900ER", slug: "737-900ER", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 737 MAX 7", slug: "737 MAX 7", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 737 MAX 8", slug: "737 MAX 8", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 737 MAX 9", slug: "737 MAX 9", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 737 MAX 10", slug: "737 MAX 10", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 757-200", slug: "757-200", manufacturer: "Boeing", category: "narrowbody" },
  { displayName: "Boeing 757-300", slug: "757-300", manufacturer: "Boeing", category: "narrowbody" },

  // Boeing - Widebody
  { displayName: "Boeing 767-200ER", slug: "767-200ER", manufacturer: "Boeing", category: "widebody" },
  { displayName: "Boeing 767-300ER", slug: "767-300ER", manufacturer: "Boeing", category: "widebody" },
  { displayName: "Boeing 767-400ER", slug: "767-400ER", manufacturer: "Boeing", category: "widebody" },
  { displayName: "Boeing 777-200", slug: "777-200", manufacturer: "Boeing", category: "widebody" },
  { displayName: "Boeing 777-200ER", slug: "777-200ER", manufacturer: "Boeing", category: "widebody" },
  { displayName: "Boeing 777-200LR Worldliner", slug: "777-200LR Worldliner", manufacturer: "Boeing", category: "widebody" },
  { displayName: "Boeing 777-300", slug: "777-300", manufacturer: "Boeing", category: "widebody" },
  { displayName: "Boeing 777-300ER", slug: "777-300ER", manufacturer: "Boeing", category: "widebody" },
  { displayName: "Boeing 777-8", slug: "777-8", manufacturer: "Boeing", category: "widebody" },
  { displayName: "Boeing 777-9", slug: "777-9", manufacturer: "Boeing", category: "widebody" },
  { displayName: "Boeing 787-8", slug: "787-8", manufacturer: "Boeing", category: "widebody" },
  { displayName: "Boeing 787-9", slug: "787-9", manufacturer: "Boeing", category: "widebody" },
  { displayName: "Boeing 787-10", slug: "787-10", manufacturer: "Boeing", category: "widebody" },
  { displayName: "Boeing 747-400", slug: "747-400", manufacturer: "Boeing", category: "widebody" },
  { displayName: "Boeing 747-400ER", slug: "747-400ER", manufacturer: "Boeing", category: "widebody" },
  { displayName: "Boeing 747-8I", slug: "747-8I", manufacturer: "Boeing", category: "widebody" },

  // Boeing - Cargo
  { displayName: "Boeing 747-400F", slug: "747-400F", manufacturer: "Boeing", category: "cargo" },
  { displayName: "Boeing 747-400ERF", slug: "747-400ERF", manufacturer: "Boeing", category: "cargo" },
  { displayName: "Boeing 747-8F", slug: "747-8F", manufacturer: "Boeing", category: "cargo" },

  // Bombardier
  { displayName: "Bombardier CRJ700", slug: "CRJ700", manufacturer: "Bombardier", category: "regional" },
  { displayName: "Bombardier CRJ900", slug: "CRJ900", manufacturer: "Bombardier", category: "regional" },
  { displayName: "Bombardier CRJ1000", slug: "CRJ1000", manufacturer: "Bombardier", category: "regional" },
  { displayName: "Bombardier CS100", slug: "CS100", manufacturer: "Bombardier", category: "narrowbody" },
  { displayName: "Bombardier CS300", slug: "CS300", manufacturer: "Bombardier", category: "narrowbody" },

  // Comac
  { displayName: "Comac ARJ21-700", slug: "ARJ21-700", manufacturer: "Comac", category: "regional" },
  { displayName: "Comac ARJ21-700ER", slug: "ARJ21-700ER", manufacturer: "Comac", category: "regional" },
  { displayName: "Comac ARJ21-900", slug: "ARJ21-900", manufacturer: "Comac", category: "regional" },
  { displayName: "Comac ARJ21-900ER", slug: "ARJ21-900ER", manufacturer: "Comac", category: "regional" },

  // Douglas
  { displayName: "Douglas DC-8-61", slug: "DC-8-61", manufacturer: "Douglas", category: "narrowbody" },

  // Embraer
  { displayName: "Embraer E170", slug: "E170", manufacturer: "Embraer", category: "regional" },
  { displayName: "Embraer E175", slug: "E175", manufacturer: "Embraer", category: "regional" },
  { displayName: "Embraer E175-E2", slug: "E175-E2", manufacturer: "Embraer", category: "regional" },
  { displayName: "Embraer E190", slug: "E190", manufacturer: "Embraer", category: "regional" },
  { displayName: "Embraer E190-E2", slug: "E190-E2", manufacturer: "Embraer", category: "regional" },
  { displayName: "Embraer E195", slug: "E195", manufacturer: "Embraer", category: "regional" },
  { displayName: "Embraer E195-E2", slug: "E195-E2", manufacturer: "Embraer", category: "regional" },

  // Lockheed
  { displayName: "Lockheed L-1011 TriStar 500", slug: "L-1011 TriStar 500", manufacturer: "Lockheed", category: "widebody" },
  { displayName: "Lockheed C-5 Galaxy", slug: "C-5 Galaxy", manufacturer: "Lockheed", category: "military" },

  // McDonnell-Douglas
  { displayName: "McDonnell-Douglas DC-9-30", slug: "DC-9-30", manufacturer: "McDonnell-Douglas", category: "narrowbody" },
  { displayName: "McDonnell-Douglas DC-10-30", slug: "DC-10-30", manufacturer: "McDonnell-Douglas", category: "widebody" },
  { displayName: "McDonnell-Douglas MD-11", slug: "MD-11", manufacturer: "McDonnell-Douglas", category: "widebody" },

  // Sukhoi
  { displayName: "Sukhoi SSJ 100 95", slug: "SSJ 100 95", manufacturer: "Sukhoi", category: "regional" },
  { displayName: "Sukhoi SSJ 100 95LR", slug: "SSJ 100 95LR", manufacturer: "Sukhoi", category: "regional" },

  // Tupolev
  { displayName: "Tupolev TU-154M", slug: "TU-154M", manufacturer: "Tupolev", category: "narrowbody" },
]

export function getAircraftBySlug(slug: string): AircraftCatalogEntry | undefined {
  return aircraftCatalog.find((a) => a.slug === slug)
}

export function slugToUrlSegment(slug: string): string {
  return slug.replace(/ /g, '_')
}
