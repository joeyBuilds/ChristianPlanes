import { useMemo, useEffect, useState } from 'react'
import { geoAzimuthalEquidistant, geoPath, geoGraticule10 } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'
import type { Airport } from '@/types/airport'
import { rangeCircleGeoJSON, haversineDistance } from '@/lib/geo'
import { useIsDarkMode } from '@/hooks/useIsDarkMode'
import { motion, AnimatePresence } from 'framer-motion'

interface RangeMapProps {
  airport: Airport
  range1Km: number
  range2Km: number
  aircraft1Name: string
  aircraft2Name: string
  airports: Airport[]
}

interface ReachableAirport extends Airport {
  distance: number
  reachableBy1: boolean
  reachableBy2: boolean
}

export function RangeMap({
  airport,
  range1Km,
  range2Km,
  airports,
}: RangeMapProps) {
  const isDark = useIsDarkMode()
  const [worldData, setWorldData] = useState<GeoJSON.FeatureCollection | null>(null)
  const [hoveredAirport, setHoveredAirport] = useState<ReachableAirport | null>(null)

  const width = 800
  const height = 600

  // Load world topology
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((topology: Topology) => {
        const countries = feature(topology, topology.objects.countries as any) as unknown as GeoJSON.FeatureCollection
        setWorldData(countries)
      })
      .catch(() => {
        // Silently fail — map won't render land but range circles still work
      })
  }, [])

  // Projection centered on the selected airport
  const maxRange = Math.max(range1Km, range2Km)
  const projection = useMemo(() => {
    // Scale: want the max range circle to fit within ~80% of the SVG
    // Azimuthal equidistant: 1 unit of distance from center = constant pixels
    const proj = geoAzimuthalEquidistant()
      .center([0, 0])
      .rotate([-airport.lon, -airport.lat])
      .translate([width / 2, height / 2])

    // Calculate scale to fit max range
    // In azimuthal equidistant, the scale factor is pixels per radian of arc
    // Earth circumference = 40075 km, so maxRange km = maxRange/40075 * 2π radians
    const radiansForMaxRange = (maxRange / 6371) // distance / earth radius = angle in radians
    const pixelsForMaxRange = Math.min(width, height) * 0.38
    const scale = pixelsForMaxRange / radiansForMaxRange

    proj.scale(scale)
    return proj
  }, [airport.lat, airport.lon, maxRange])

  const pathGenerator = useMemo(() => geoPath(projection), [projection])

  // Range circle GeoJSON features
  const circle1 = useMemo(
    () => rangeCircleGeoJSON(airport.lat, airport.lon, range1Km, 180),
    [airport.lat, airport.lon, range1Km],
  )
  const circle2 = useMemo(
    () => rangeCircleGeoJSON(airport.lat, airport.lon, range2Km, 180),
    [airport.lat, airport.lon, range2Km],
  )

  // Airports within range
  const reachableAirports = useMemo(() => {
    const maxR = Math.max(range1Km, range2Km)
    return airports
      .filter((a) => {
        if (a.iata === airport.iata) return false
        const d = haversineDistance(airport.lat, airport.lon, a.lat, a.lon)
        return d <= maxR
      })
      .map((a) => ({
        ...a,
        distance: haversineDistance(airport.lat, airport.lon, a.lat, a.lon),
        reachableBy1: haversineDistance(airport.lat, airport.lon, a.lat, a.lon) <= range1Km,
        reachableBy2: haversineDistance(airport.lat, airport.lon, a.lat, a.lon) <= range2Km,
      }))
  }, [airports, airport, range1Km, range2Km])

  const graticule = useMemo(() => {
    const g = geoGraticule10()
    return pathGenerator(g)
  }, [pathGenerator])

  const colors = {
    land: isDark ? '#1e3a5f' : '#dde5ed',
    landStroke: isDark ? '#2a4a70' : '#c8d3de',
    water: isDark ? '#0a1929' : '#f0f4f8',
    graticule: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    ac1Fill: 'rgba(96, 165, 250, 0.20)',
    ac1Stroke: 'rgba(96, 165, 250, 0.60)',
    ac2Fill: 'rgba(248, 113, 113, 0.20)',
    ac2Stroke: 'rgba(248, 113, 113, 0.60)',
    airportDot: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)',
    airportReachable: isDark ? '#e2e8f0' : '#334155',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <svg

        viewBox={`0 0 ${width} ${height}`}
        className="w-full rounded-lg overflow-hidden"
        style={{ background: colors.water }}
      >
        {/* Graticule */}
        {graticule && (
          <path d={graticule} fill="none" stroke={colors.graticule} strokeWidth={0.5} />
        )}

        {/* Land masses */}
        {worldData?.features.map((feat, i) => {
          const d = pathGenerator(feat)
          return d ? (
            <path
              key={i}
              d={d}
              fill={colors.land}
              stroke={colors.landStroke}
              strokeWidth={0.5}
            />
          ) : null
        })}

        {/* Range circle: Aircraft 1 (blue) */}
        <AnimatePresence>
          {range1Km > 0 && (
            <motion.path
              key={`range1-${airport.iata}`}
              d={pathGenerator(circle1) || ''}
              fill={colors.ac1Fill}
              stroke={colors.ac1Stroke}
              strokeWidth={1.5}
              strokeDasharray="6 3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>

        {/* Range circle: Aircraft 2 (red) */}
        <AnimatePresence>
          {range2Km > 0 && (
            <motion.path
              key={`range2-${airport.iata}`}
              d={pathGenerator(circle2) || ''}
              fill={colors.ac2Fill}
              stroke={colors.ac2Stroke}
              strokeWidth={1.5}
              strokeDasharray="6 3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>

        {/* Reachable airport dots */}
        {reachableAirports.map((a) => {
          const pos = projection([a.lon, a.lat])
          if (!pos) return null
          const bothReach = a.reachableBy1 && a.reachableBy2
          const color = bothReach
            ? colors.airportReachable
            : a.reachableBy1
              ? 'rgba(96, 165, 250, 0.7)'
              : 'rgba(248, 113, 113, 0.7)'
          return (
            <circle
              key={a.iata}
              cx={pos[0]}
              cy={pos[1]}
              r={hoveredAirport?.iata === a.iata ? 4 : 2}
              fill={color}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredAirport(a)}
              onMouseLeave={() => setHoveredAirport(null)}
            />
          )
        })}

        {/* Origin airport marker */}
        {(() => {
          const pos = projection([airport.lon, airport.lat])
          if (!pos) return null
          return (
            <g>
              <circle cx={pos[0]} cy={pos[1]} r={6} fill="white" opacity={0.3}>
                <animate
                  attributeName="r"
                  values="6;10;6"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.3;0.1;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx={pos[0]} cy={pos[1]} r={4} fill="white" stroke={isDark ? '#0a1929' : '#f0f4f8'} strokeWidth={1.5} />
              <text
                x={pos[0]}
                y={pos[1] - 10}
                textAnchor="middle"
                fill={isDark ? '#e2e8f0' : '#1e293b'}
                fontSize={11}
                fontWeight={600}
                fontFamily="monospace"
              >
                {airport.iata}
              </text>
            </g>
          )
        })()}

        {/* Hovered airport tooltip */}
        {hoveredAirport && (() => {
          const pos = projection([hoveredAirport.lon, hoveredAirport.lat])
          if (!pos) return null
          return (
            <g>
              <rect
                x={pos[0] + 8}
                y={pos[1] - 22}
                width={Math.max(hoveredAirport.city.length, hoveredAirport.iata.length + 12) * 6.5 + 16}
                height={36}
                rx={4}
                fill={isDark ? '#1e293b' : 'white'}
                stroke={isDark ? '#334155' : '#e2e8f0'}
                strokeWidth={1}
                opacity={0.95}
              />
              <text
                x={pos[0] + 16}
                y={pos[1] - 6}
                fill={isDark ? '#e2e8f0' : '#1e293b'}
                fontSize={10}
                fontWeight={600}
                fontFamily="monospace"
              >
                {hoveredAirport.iata} - {hoveredAirport.city}
              </text>
              <text
                x={pos[0] + 16}
                y={pos[1] + 7}
                fill={isDark ? '#94a3b8' : '#64748b'}
                fontSize={9}
                fontFamily="monospace"
              >
                {Math.round(hoveredAirport.distance)} km / {Math.round(hoveredAirport.distance / 1.852)} nm
              </text>
            </g>
          )
        })()}
      </svg>
    </motion.div>
  )
}
