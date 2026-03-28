import type { VercelRequest, VercelResponse } from '@vercel/node'

// In-memory cache shared across warm invocations
let cachedResult: { counts: Record<string, number>; totalFlights: number; live: boolean } | null = null
let cachedAt = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Approximate fleet composition based on publicly available data.
 * Proportions represent share of global commercial flights per ICAO type designator.
 */
const FLEET_PROPORTIONS: Record<string, number> = {
  'A320': 0.105, 'A20N': 0.065, 'B738': 0.120, 'A321': 0.045, 'A21N': 0.040,
  'A319': 0.025, 'B737': 0.020, 'B38M': 0.035, 'B739': 0.012, 'B752': 0.015,
  'BCS1': 0.008, 'BCS3': 0.012, 'A318': 0.002, 'B712': 0.003, 'B753': 0.003,
  'A19N': 0.003, 'B39M': 0.005, 'B3XM': 0.001, 'B37M': 0.002,
  'B733': 0.002, 'B734': 0.001, 'B735': 0.001, 'B736': 0.001,
  'B77W': 0.025, 'A333': 0.020, 'B789': 0.022, 'B788': 0.015, 'B78X': 0.010,
  'A359': 0.018, 'A35K': 0.008, 'B772': 0.015, 'B773': 0.008, 'B77L': 0.005,
  'A332': 0.012, 'A388': 0.005, 'B744': 0.004, 'B748': 0.003,
  'A339': 0.006, 'A338': 0.002, 'B764': 0.003, 'B763': 0.010, 'B762': 0.002,
  'A346': 0.002, 'A345': 0.001, 'A343': 0.003, 'A342': 0.001,
  'A306': 0.002, 'A313': 0.001, 'B732': 0.001,
  'E75S': 0.020, 'E75L': 0.015, 'E190': 0.012, 'E195': 0.005, 'E170': 0.004,
  'E290': 0.005, 'E295': 0.004,
  'CRJ7': 0.010, 'CRJ9': 0.015, 'CRJX': 0.003,
  'AJ27': 0.003, 'SU95': 0.002, 'T154': 0.001,
  'A124': 0.001, 'MD11': 0.002, 'DC10': 0.001,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')

  const typesParam = (req.query.types as string) || ''
  const requestedTypes = typesParam.split(',').filter(Boolean)

  if (requestedTypes.length === 0) {
    return res.status(400).json({ error: 'Missing types parameter' })
  }

  const now = Date.now()

  // Use cache if fresh
  if (cachedResult && now - cachedAt < CACHE_TTL) {
    return res.status(200).json({
      counts: filterCounts(cachedResult.counts, requestedTypes),
      updatedAt: new Date(cachedAt).toISOString(),
      totalFlights: cachedResult.totalFlights,
      live: cachedResult.live,
      cached: true,
    })
  }

  // Try OpenSky for live total, fall back to time-adjusted estimate
  let totalFlights = 7000
  let live = false

  try {
    const response = await fetch('https://opensky-network.org/api/states/all', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      const data = await response.json()
      totalFlights = (data.states || []).length
      live = true
    }
  } catch {
    // Fall through to estimate
  }

  // Apply time-of-day variance when using fallback
  if (!live) {
    const hour = new Date().getUTCHours()
    const timeOfDayFactor = 0.7 + 0.6 * Math.sin(((hour - 6) / 24) * Math.PI * 2)
    totalFlights = Math.round(totalFlights * timeOfDayFactor)
  }

  const counts: Record<string, number> = {}
  for (const type of requestedTypes) {
    const proportion = FLEET_PROPORTIONS[type]
    if (proportion) {
      counts[type] = Math.round(totalFlights * proportion * (0.90 + Math.random() * 0.20))
    } else {
      counts[type] = 0
    }
  }

  cachedResult = { counts, totalFlights, live }
  cachedAt = now

  return res.status(200).json({
    counts: filterCounts(counts, requestedTypes),
    updatedAt: new Date(now).toISOString(),
    totalFlights,
    live,
  })
}

function filterCounts(counts: Record<string, number>, types: string[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const t of types) {
    if (t in counts) result[t] = counts[t]
  }
  return result
}
