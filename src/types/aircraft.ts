export interface DualUnit {
  metric: number
  imperial: number
  metricUnit: string
  imperialUnit: string
}

export interface AircraftSpec {
  name: string
  slug: string
  length: DualUnit
  wingspan: DualUnit
  wingArea: DualUnit
  height: DualUnit
  engines: number
  thrustPerEngine: DualUnit
  totalThrust: DualUnit
  mtow: DualUnit
  range: DualUnit
  cruiseSpeed: string
  capacity: string
}

export type AircraftCategory =
  | "narrowbody"
  | "widebody"
  | "regional"
  | "cargo"
  | "military"
  | "supersonic"
  | "general-aviation"
  | "turboprop"

export interface AircraftCatalogEntry {
  displayName: string
  slug: string
  manufacturer: string
  category: AircraftCategory
}
