const R_KM = 6371 // Earth radius in km

/** Convert degrees to radians */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** Convert radians to degrees */
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

/**
 * Compute destination point given start, bearing (degrees), and distance (km).
 * Uses the inverse Haversine formula.
 */
export function destinationPoint(
  lat: number,
  lon: number,
  bearing: number,
  distanceKm: number,
): [number, number] {
  const d = distanceKm / R_KM
  const brng = toRad(bearing)
  const lat1 = toRad(lat)
  const lon1 = toRad(lon)

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng),
  )
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
    )

  return [toDeg(lat2), toDeg(lon2)]
}

/**
 * Generate an array of [lat, lon] points forming a range circle
 * around a given origin at the given distance in km.
 * Returns `steps` points (default 180 = every 2 degrees).
 */
export function rangeCirclePoints(
  lat: number,
  lon: number,
  rangeKm: number,
  steps = 180,
): [number, number][] {
  const points: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const bearing = (360 / steps) * i
    points.push(destinationPoint(lat, lon, bearing, rangeKm))
  }
  return points
}

/**
 * Convert range circle points to a GeoJSON-compatible polygon ring.
 * D3-geo expects [lon, lat] order.
 */
export function rangeCircleGeoJSON(
  lat: number,
  lon: number,
  rangeKm: number,
  steps = 180,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const points = rangeCirclePoints(lat, lon, rangeKm, steps)
  // GeoJSON uses [lon, lat]
  const coordinates = points.map(([la, lo]) => [lo, la] as [number, number])
  // Close the ring
  if (coordinates.length > 0) {
    coordinates.push(coordinates[0])
  }
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
  }
}

/**
 * Haversine distance between two points in km.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
