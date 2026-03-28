#!/usr/bin/env node

/**
 * Downloads OurAirports CSV and filters to commercial airports.
 * Outputs public/data/airports.json (~4,500 entries).
 *
 * Run: node scripts/prepare-airports.mjs
 */

import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT = join(__dirname, '..', 'public', 'data', 'airports.json')

const CSV_URL = 'https://davidmegginson.github.io/ourairports-data/airports.csv'

async function main() {
  console.log('Downloading OurAirports CSV...')
  const res = await fetch(CSV_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()

  const lines = text.split('\n')
  const header = parseCSVLine(lines[0])
  const colIdx = Object.fromEntries(header.map((h, i) => [h, i]))

  const airports = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cols = parseCSVLine(line)

    const type = cols[colIdx['type']]
    const scheduled = cols[colIdx['scheduled_service']]
    const iata = cols[colIdx['iata_code']]?.trim()
    const lat = parseFloat(cols[colIdx['latitude_deg']])
    const lon = parseFloat(cols[colIdx['longitude_deg']])

    // Only large/medium airports with scheduled service and an IATA code
    if (!['large_airport', 'medium_airport'].includes(type)) continue
    if (scheduled !== 'yes') continue
    if (!iata || iata.length !== 3) continue
    if (isNaN(lat) || isNaN(lon)) continue

    airports.push({
      iata,
      icao: cols[colIdx['ident']]?.trim() || '',
      name: cols[colIdx['name']]?.trim() || '',
      city: (cols[colIdx['municipality']]?.trim() || ''),
      country: cols[colIdx['iso_country']]?.trim() || '',
      lat: Math.round(lat * 10000) / 10000,
      lon: Math.round(lon * 10000) / 10000,
    })
  }

  // Sort by IATA code for easy searching
  airports.sort((a, b) => a.iata.localeCompare(b.iata))

  mkdirSync(dirname(OUTPUT), { recursive: true })
  writeFileSync(OUTPUT, JSON.stringify(airports))

  console.log(`Wrote ${airports.length} airports to ${OUTPUT}`)
  console.log(`File size: ${(writeFileSync.length / 1024).toFixed(0) || Math.round(JSON.stringify(airports).length / 1024)}KB`)
}

/** Simple CSV line parser that handles quoted fields */
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        result.push(current)
        current = ''
      } else {
        current += ch
      }
    }
  }
  result.push(current)
  return result
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
