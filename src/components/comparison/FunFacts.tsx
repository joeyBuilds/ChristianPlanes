import { useMemo } from 'react'
import type { AircraftSpec } from '@/types/aircraft'
import { getAircraftBySlug } from '@/data/aircraft-catalog'

interface FunFactsProps {
  aircraft1: AircraftSpec
  aircraft2: AircraftSpec
}

// Per-aircraft fun facts keyed by slug prefix or full slug
// Falls back to generated facts if no curated one exists
const AIRCRAFT_TRIVIA: Record<string, string[]> = {
  // Airbus A220 family
  'A220': [
    'Originally designed by Bombardier as the C Series before Airbus acquired the program in 2018',
    'The quietest commercial aircraft in its class — 34% quieter than competitors on takeoff',
    'Has the widest cabin in the single-aisle segment at 3.28m (10.8 ft)',
    'Each A220 uses ~20% less fuel per seat than previous-gen aircraft',
  ],
  // Airbus A320 family
  'A320': [
    'The first commercial aircraft to feature fly-by-wire controls when it entered service in 1988',
    'Over 10,000 A320 family aircraft have been delivered — the best-selling aircraft family ever',
    'Its fuselage width of 3.95m was intentionally designed to be wider than the 737\'s 3.53m',
    'The A320 was the first civil aircraft to use a side-stick controller instead of a yoke',
  ],
  'A319': [
    'Essentially an A320 with fewer rows — it shares 95% of parts with the A320',
    'Popular with corporate/VIP operators due to its long range when configured with fewer seats',
  ],
  'A321': [
    'The stretched big brother of the A320 family — 6.94m longer than the A320',
    'The A321XLR variant can fly 4,700 nmi, making it a transatlantic narrowbody',
    'American Airlines operates the world\'s largest A321 fleet',
  ],
  'A330': [
    'One of the most versatile widebodies — used for passenger, cargo, tanker, and VIP roles',
    'The A330-900neo has a range of 13,334 km — enough to fly London to Tokyo nonstop',
    'Has been in continuous production since 1992, making it one of the longest-running programs',
  ],
  'A340': [
    'The only modern 4-engine Airbus widebody — designed for ultra-long range before ETOPS relaxation',
    'The A340-500 once held the record for the longest commercial flight: Singapore to Newark',
  ],
  'A350': [
    'The first Airbus with a fuselage and wing made primarily from carbon fiber composites (53%)',
    'Its distinctive "Raccoon Eyes" cockpit windows reduce glare without needing sliding blinds',
    'Burns 25% less fuel per seat than the 777-200ER it was designed to replace',
  ],
  'A380': [
    'The world\'s largest passenger aircraft — can seat up to 853 passengers in all-economy',
    'Its wing area of 845 m² is bigger than a basketball court',
    'Emirates operates more than half of all A380s ever built',
    'Each A380 contains 530 km of wiring — enough to stretch from Paris to Frankfurt',
  ],
  'A300': [
    'The world\'s first twin-engine widebody aircraft, launched in 1972',
    'FedEx still operates A300-600Fs as freighters — their workhorse for overnight packages',
  ],
  'A310': [
    'The first airliner to feature a two-crew glass cockpit with EFIS displays',
    'Used as a VIP transport by several governments and air forces',
  ],
  // Boeing 737 family
  '737': [
    'The best-selling commercial jet in history with over 11,000 delivered',
    'A 737 takes off or lands somewhere in the world every 1.5 seconds',
    'The original 737-100 was 28.6m long — the MAX 10 stretches to 43.8m',
    'Its nose gear is shorter than the main gear, giving it a distinctive nose-down taxi attitude',
  ],
  '747': [
    'The "Queen of the Skies" — revolutionized air travel when it debuted in 1970',
    'The 747\'s hump was originally designed for cargo loading; passenger seating came later',
    'Two modified 747-200s serve as Air Force One for the US President',
    'At its peak, 747s carried more than half of all transatlantic passengers',
  ],
  '757': [
    'Pilots call it "the Ferrari of narrowbodies" for its exceptional climb performance',
    'Can take off from shorter runways than most aircraft its size thanks to its powerful RB211 engines',
    'Donald Trump, the Royal New Zealand Air Force, and NASA all operate(d) 757s',
  ],
  '767': [
    'The first Boeing twinjet widebody — paved the way for ETOPS transoceanic operations',
    'UPS and FedEx both use the 767F as their primary long-haul freighter',
    'The 767 tanker variant (KC-46) is the US Air Force\'s newest aerial refueling aircraft',
  ],
  '777': [
    'The first aircraft entirely designed using 3D CAD software (CATIA)',
    'The GE90-115B engine on the 777-300ER holds the record for most powerful jet engine ever',
    'Its folding wingtips (777X) reduce wingspan from 71.8m to 64.8m for gate compatibility',
    'The 777-200LR once set a record flying eastbound from Hong Kong to London: 21,601 km',
  ],
  '787': [
    'The "Dreamliner" — 50% of its structure is carbon fiber composite by weight',
    'Has electrochromic windows that dim electronically instead of using physical shades',
    'Cabin altitude is kept at 6,000 ft instead of the usual 8,000 ft, reducing passenger fatigue',
    'The 787 can humidify its cabin to 25% vs the typical 5-10% on metal-skinned jets',
  ],
  '707': [
    'The aircraft that launched the Jet Age for commercial aviation in 1958',
    'Essentially a civilianized version of the KC-135 military tanker',
    'Pan Am\'s first 707 service from New York to Paris took just 8 hours — half the propeller time',
  ],
  '717': [
    'Originally designed as the McDonnell Douglas MD-95 before the Boeing merger',
    'The only Boeing jet with a T-tail configuration',
    'Delta Air Lines is the largest 717 operator with over 90 aircraft',
  ],
  '727': [
    'The first commercial jet designed to operate from shorter runways at smaller airports',
    'Its three rear-mounted engines and T-tail are instantly recognizable',
    'Was the first commercial jet to sell 1,000 units',
  ],
  // Concorde
  'Concorde': [
    'Cruised at Mach 2.04 (2,180 km/h) — more than twice the speed of sound',
    'The fuselage stretched 15-25 cm during flight due to heat from air friction',
    'The iconic droop nose lowered 12.5° for takeoff and landing to give pilots better visibility',
    'Could fly London to New York in under 3 hours — arriving before it departed by local time',
    'Only 20 were ever built, split between British Airways and Air France',
  ],
  // Antonov
  'AN-225': [
    'The largest aircraft ever built — only one was ever completed (destroyed in 2022)',
    'Could carry 250 tonnes of cargo or the Soviet Buran space shuttle on its back',
    'Powered by six turbofan engines and required a crew of six',
    'Its wingspan of 88.4m is wider than a football field',
  ],
  'AN-124': [
    'The largest military transport aircraft in active service',
    'Can kneel its nose gear to lower the cargo floor for drive-on/drive-off loading',
    'Has carried everything from locomotives to yacht hulls to other aircraft fuselages',
  ],
  // Douglas / McDonnell-Douglas
  'DC-10': [
    'The third trijet to enter service, competing with the L-1011 TriStar',
    'The KC-10 Extender variant still serves as a military tanker for the US Air Force',
  ],
  'DC-8': [
    'One of only a few commercial aircraft to break the sound barrier (in a controlled dive)',
    'Remained in cargo service with operators until the 2010s — over 50 years after its debut',
  ],
  'DC-9': [
    'Spawned one of the longest aircraft family lineages: DC-9 → MD-80 → MD-90 → 717',
  ],
  'MD-11': [
    'The successor to the DC-10, featuring a smaller tailplane and winglets',
    'FedEx and UPS were the last major operators, using it as a freighter',
    'Its cockpit was advanced for its time with six LCD screens replacing analog instruments',
  ],
  // Lockheed
  'L-1011': [
    'The TriStar was the first widebody with a full-authority autoland system (Cat IIIc)',
    'Its Rolls-Royce RB211 engines were so expensive to develop that they bankrupted Rolls-Royce',
    'Only 250 were built — far fewer than its DC-10 rival',
  ],
  'C-5': [
    'One of the largest military aircraft in the world — can swallow two M1 Abrams tanks',
    'Its nose opens upward AND the tail opens outward for simultaneous front/rear loading',
    'The C-5M Super Galaxy upgrade extended its service life to beyond 2040',
  ],
  // Embraer
  'E170': [
    'Part of Embraer\'s E-Jet family that redefined the regional jet market',
  ],
  'E175': [
    'The most popular regional jet in North America — over 600 in service with US carriers',
    'US scope clause agreements make the E175 the largest jet regional airlines can fly',
  ],
  'E190': [
    'Bridges the gap between regional and mainline jets at 97-114 seats',
    'JetBlue was the launch customer, using it on thinner routes from New York',
  ],
  'E195': [
    'The largest original E-Jet — the E2 version competes directly with the A220',
  ],
  // Bombardier
  'CRJ': [
    'Based on the Bombardier Challenger 600 business jet airframe',
    'SkyWest Airlines is the world\'s largest CRJ operator',
  ],
  // Sukhoi
  'SSJ': [
    'Russia\'s first post-Soviet commercial aircraft design',
    'Featured significant Western components including SaM146 engines (Franco-Russian joint venture)',
  ],
  // Tupolev
  'TU-154': [
    'The workhorse of Soviet and Russian aviation for decades — nicknamed the "Tupolka"',
    'Has three rear-mounted engines, similar in layout to the Boeing 727',
    'Over 1,000 were built, making it the most-produced Soviet airliner',
  ],
  // Comac
  'ARJ21': [
    'China\'s first domestically developed regional jet',
    'Took 14 years from program launch to first commercial flight in 2016',
  ],
}

function getTrivia(slug: string): string[] {
  // Try exact slug match first
  if (AIRCRAFT_TRIVIA[slug]) return AIRCRAFT_TRIVIA[slug]
  // Try prefix matches (e.g., "A320-200" matches "A320")
  for (const [key, facts] of Object.entries(AIRCRAFT_TRIVIA)) {
    if (slug.startsWith(key)) return facts
  }
  return []
}

// Fun comparative/combined facts generated from the data
function generateComparisons(ac1: AircraftSpec, ac2: AircraftSpec): string[] {
  const facts: string[] = []
  const combinedLengthM = ac1.length.metric + ac2.length.metric
  const combinedWeightKg = ac1.mtow.metric + ac2.mtow.metric
  const combinedRangeKm = Math.max(ac1.range.metric, ac2.range.metric)

  // Combined length comparisons
  const blueWhaleLen = 30
  if (combinedLengthM > blueWhaleLen) {
    const whales = (combinedLengthM / blueWhaleLen).toFixed(1)
    facts.push(`Parked nose to tail, these two aircraft would stretch ${combinedLengthM.toFixed(0)}m — about ${whales} blue whales long`)
  }

  const footballPitch = 100
  if (combinedLengthM > footballPitch * 0.5) {
    const pct = ((combinedLengthM / footballPitch) * 100).toFixed(0)
    facts.push(`Together they'd cover ${pct}% of a football pitch end to end`)
  }

  // Weight comparisons
  const elephantKg = 6000
  const elephants = Math.round(combinedWeightKg / elephantKg)
  if (elephants > 1) {
    facts.push(`Their combined max takeoff weight of ${(combinedWeightKg / 1000).toFixed(0)} tonnes is equivalent to ~${elephants} African elephants`)
  }

  // Range comparison
  const earthCircumference = 40075
  const pctEarth = ((combinedRangeKm / earthCircumference) * 100).toFixed(1)
  facts.push(`The longer-range aircraft could fly ${pctEarth}% of the way around the Earth on a single tank`)

  // Speed comparison
  const speed1 = parseFloat(ac1.cruiseSpeed.replace('M', ''))
  const speed2 = parseFloat(ac2.cruiseSpeed.replace('M', ''))
  if (!isNaN(speed1) && !isNaN(speed2)) {
    const avgMach = (speed1 + speed2) / 2
    const kmh = Math.round(avgMach * 1235) // rough Mach to km/h at cruise
    facts.push(`At their cruise speed of ~${kmh} km/h, these jets cover 1 km every ${(3600 / kmh).toFixed(1)} seconds`)
  }

  // Capacity comparison
  const cap1 = parseInt(ac1.capacity?.replace(/[^0-9]/g, '') || '0')
  const cap2 = parseInt(ac2.capacity?.replace(/[^0-9]/g, '') || '0')
  if (cap1 > 0 && cap2 > 0) {
    const total = cap1 + cap2
    facts.push(`Together they could carry ${total} passengers — that's roughly ${Math.round(total / 11)} full football teams with staff`)
  }

  // Wingspan comparison
  const maxWingspan = Math.max(ac1.wingspan.metric, ac2.wingspan.metric)
  const tennisCourtLen = 23.77
  if (maxWingspan > tennisCourtLen) {
    facts.push(`The wider wingspan of ${maxWingspan.toFixed(1)}m would overshoot a tennis court (23.8m) by ${(maxWingspan - tennisCourtLen).toFixed(1)}m`)
  }

  // Engine thrust
  const maxThrustKn = Math.max(ac1.totalThrust.metric, ac2.totalThrust.metric)
  const f1CarHp = 1000
  const thrustHpEquiv = Math.round(maxThrustKn * 0.7457 * 184) // very rough kN to hp equiv
  if (maxThrustKn > 0) {
    const f1Cars = Math.round(thrustHpEquiv / f1CarHp)
    if (f1Cars > 1) {
      facts.push(`The more powerful aircraft produces enough thrust to match roughly ${f1Cars} Formula 1 cars`)
    }
  }

  return facts
}

export function FunFacts({ aircraft1, aircraft2 }: FunFactsProps) {
  const trivia1 = useMemo(() => getTrivia(aircraft1.slug), [aircraft1.slug])
  const trivia2 = useMemo(() => getTrivia(aircraft2.slug), [aircraft2.slug])
  const comparisons = useMemo(
    () => generateComparisons(aircraft1, aircraft2),
    [aircraft1, aircraft2]
  )

  const cat1 = getAircraftBySlug(aircraft1.slug)
  const cat2 = getAircraftBySlug(aircraft2.slug)

  // Pick a subset so it doesn't overwhelm — rotate based on a simple hash
  const hash = (aircraft1.slug + aircraft2.slug).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const pickComparisons = comparisons.filter((_, i) => i === hash % comparisons.length || i === (hash + 2) % comparisons.length || i === (hash + 4) % comparisons.length).slice(0, 3)
  const pickTrivia1 = trivia1.length > 0 ? [trivia1[hash % trivia1.length]] : []
  const pickTrivia2 = trivia2.length > 0 ? [trivia2[(hash + 1) % trivia2.length]] : []

  if (pickComparisons.length === 0 && pickTrivia1.length === 0 && pickTrivia2.length === 0) return null

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-muted/30">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Did you know?
        </span>
      </div>
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
        {/* Per-aircraft trivia */}
        {pickTrivia1.length > 0 && (
          <div className="flex gap-2.5">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
            <div>
              <span className="font-medium text-blue-500">{cat1?.displayName || aircraft1.name}:</span>{' '}
              {pickTrivia1[0]}
            </div>
          </div>
        )}
        {pickTrivia2.length > 0 && (
          <div className="flex gap-2.5">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
            <div>
              <span className="font-medium text-red-500">{cat2?.displayName || aircraft2.name}:</span>{' '}
              {pickTrivia2[0]}
            </div>
          </div>
        )}
        {/* Combined / comparative facts */}
        {pickComparisons.map((fact, i) => (
          <div key={i} className="flex gap-2.5">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
            <span>{fact}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
