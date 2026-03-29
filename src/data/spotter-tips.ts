/**
 * Aircraft Spotter Identification Tips
 *
 * Visual identification features for each aircraft family.
 * Used to help plane spotters at the airport window.
 */

interface SpotterTip {
  feature: string
  detail: string
}

const SPOTTER_TIPS: Record<string, SpotterTip[]> = {
  '737': [
    { feature: 'Flat engine bottoms', detail: 'CFM56 engines have a distinctive flat bottom due to ground clearance' },
    { feature: 'Eyebrow windows', detail: 'Classic 737s (-200 to -500) have small eyebrow windows above the main cockpit windows' },
    { feature: 'Short landing gear', detail: 'Sits low to the ground compared to other narrowbodies' },
  ],
  '737 MAX': [
    { feature: 'Split-tip winglets', detail: 'Distinctive dual-feather winglets that split above and below the wing' },
    { feature: 'LEAP-1B engines', detail: 'Larger, scalloped nacelles with serrated chevrons' },
    { feature: 'Longer nose gear', detail: 'Slightly taller than the NG to accommodate bigger engines' },
  ],
  '747': [
    { feature: 'Upper deck hump', detail: 'The iconic "Queen of the Skies" hump behind the cockpit' },
    { feature: 'Four engines', detail: 'Two engines per wing — only widebody with 4 engines still common' },
    { feature: 'Tall vertical stabilizer', detail: 'Massive tail that extends well above the fuselage' },
  ],
  '757': [
    { feature: 'Long, narrow fuselage', detail: 'Longest single-aisle aircraft — looks stretched' },
    { feature: 'Tall landing gear', detail: 'Sits high off the ground for a narrowbody' },
    { feature: 'Pointed nose', detail: 'Distinctive sharp nose profile, more pointed than 737' },
  ],
  '767': [
    { feature: 'Two engines, wide body', detail: 'Wider than a 757 but narrower than a 777 — the "mid-size"' },
    { feature: 'Short upper deck windows', detail: 'Cockpit windows smaller than 777, larger than 757' },
    { feature: 'Rounded nose', detail: 'Blunter nose profile than the 757' },
  ],
  '777': [
    { feature: 'Massive engines', detail: 'Largest diameter engines on any twin — bigger than a 737 fuselage' },
    { feature: 'Raked wingtips', detail: 'Upswept wingtips that curve backward (no winglets on original)' },
    { feature: 'Six-wheel main gear', detail: 'Triple-axle main landing gear bogies — only twin to have them' },
    { feature: 'Blade-shaped tail', detail: 'Distinctively thin vertical stabilizer compared to 747/A380' },
  ],
  '787': [
    { feature: 'Raked wingtips', detail: 'Dramatic upward sweep at the wingtips' },
    { feature: 'Serrated engine nacelles', detail: 'Chevron-shaped trailing edges on the nacelles (noise reduction)' },
    { feature: 'Curved nose', detail: 'Smooth, swept cockpit windshield — no abrupt angle change' },
    { feature: 'Larger windows', detail: 'Biggest passenger windows of any commercial jet' },
  ],
  'A320': [
    { feature: 'Sharklets or wingtip fences', detail: 'Older models have wingtip fences; newer ones have curved sharklets' },
    { feature: 'Rounded nose', detail: 'Blunter, rounder nose than the 737' },
    { feature: 'Wider fuselage', detail: 'Slightly wider cabin than 737 — can fit wider seats' },
  ],
  'A330': [
    { feature: 'Two engines, wide body', detail: 'Similar to 767 but with distinctive Airbus cockpit windows' },
    { feature: 'Winglet fences or sharklets', detail: 'Small winglet fences on older models, curved sharklets on neo' },
    { feature: 'Airbus nose shape', detail: 'Characteristic Airbus rounded nose distinct from Boeing' },
  ],
  'A340': [
    { feature: 'Four engines', detail: 'Four-engine widebody — rarer than the A380' },
    { feature: 'Very long fuselage', detail: 'A340-600 was the longest aircraft until the 777-9' },
    { feature: 'No winglets', detail: 'Clean wingtips — rare in modern aviation' },
  ],
  'A350': [
    { feature: 'Curved wingtips', detail: 'Dramatic upward-curved winglets, wider chord than 787' },
    { feature: 'Raccoon mask cockpit', detail: 'Dark cockpit window surround — looks like a "mask"' },
    { feature: 'Carbon fiber fuselage', detail: 'Smoother skin surface — fewer rivets visible' },
  ],
  'A380': [
    { feature: 'Double deck, four engines', detail: 'Full-length upper deck — the largest passenger aircraft ever' },
    { feature: 'Massive vertical tail', detail: 'Tail is as tall as a 5-story building' },
    { feature: 'Distinctive cockpit', detail: 'Small cockpit windows relative to the enormous fuselage' },
  ],
  'A220': [
    { feature: 'PW1500G engines', detail: 'Large geared turbofan engines relative to the aircraft size' },
    { feature: 'Pointed nose', detail: 'Sharp, aerodynamic nose profile' },
    { feature: 'Wide cabin for its size', detail: '5-abreast seating with the widest seats in its class' },
  ],
  'E175': [
    { feature: 'Low-wing design', detail: 'Wings mounted below the fuselage — typical for Embraer' },
    { feature: 'Small, agile frame', detail: 'Compact regional jet — much smaller than narrowbodies' },
    { feature: 'T-tail or conventional tail', detail: 'Varies by model — E-Jets use conventional low tail' },
  ],
  'MD-11': [
    { feature: 'Three engines', detail: 'Two underwing + one in the tail — trijet layout' },
    { feature: 'Winglets', detail: 'Small upward winglets — distinguishes from DC-10' },
    { feature: 'Glass cockpit', detail: 'Updated avionics compared to the DC-10' },
  ],
  'DC-10': [
    { feature: 'Three engines', detail: 'Similar to MD-11 but NO winglets' },
    { feature: 'Round engine intake', detail: 'Center engine mounted in the vertical stabilizer' },
  ],
  'Concorde': [
    { feature: 'Delta wing', detail: 'Massive triangular wing with no horizontal tail' },
    { feature: 'Droop nose', detail: 'Nose lowered for takeoff/landing visibility, raised for cruise' },
    { feature: 'Four Olympus engines', detail: 'Two under each wing with rectangular afterburner nozzles' },
  ],
  '727': [
    { feature: 'Three rear-mounted engines', detail: 'All engines at the back — S-duct center engine' },
    { feature: 'T-tail', detail: 'Horizontal stabilizer on top of the vertical tail' },
    { feature: 'Ventral airstair', detail: 'Built-in staircase in the rear fuselage (famous from D.B. Cooper)' },
  ],
  '707': [
    { feature: 'Four podded engines', detail: 'Pioneering jet airliner design — engines on pylons under swept wings' },
    { feature: 'Narrow body', detail: 'Classic 6-abreast seating — the original jet age' },
  ],
}

/**
 * Get spotter tips for an aircraft by slug.
 * Matches by prefix (e.g., "737-800" matches "737").
 */
export function getSpotterTips(slug: string): SpotterTip[] {
  // Try exact match first
  if (SPOTTER_TIPS[slug]) return SPOTTER_TIPS[slug]

  // Try prefix matching
  for (const [key, tips] of Object.entries(SPOTTER_TIPS)) {
    if (slug.startsWith(key)) return tips
  }

  return []
}
