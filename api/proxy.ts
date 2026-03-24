import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as cheerio from 'cheerio'

interface DualUnit {
  metric: number
  imperial: number
  metricUnit: string
  imperialUnit: string
}

interface AircraftSpec {
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
  maxCapacity: string
}

function parseNumber(text: string): number {
  const cleaned = text.replace(/,/g, '').replace(/[^\d.]/g, '')
  return parseFloat(cleaned) || 0
}

function parseMetricValue(text: string): number {
  return parseNumber(text)
}

function parseImperialFeetInches(text: string): number {
  const match = text.match(/([\d,]+)\s*ft\s*([\d]+)?\s*in?/)
  if (match) {
    const feet = parseNumber(match[1])
    const inches = match[2] ? parseNumber(match[2]) : 0
    return feet + inches / 12
  }
  return parseNumber(text)
}

function parseImperialValue(text: string): number {
  if (text.includes('ft') && text.includes('in')) {
    return parseImperialFeetInches(text)
  }
  return parseNumber(text)
}

function parseDualUnit(
  metricText: string,
  imperialText: string,
  metricUnit: string,
  imperialUnit: string
): DualUnit {
  return {
    metric: parseMetricValue(metricText),
    imperial: parseImperialValue(imperialText),
    metricUnit,
    imperialUnit,
  }
}

const statConfig: Record<string, { metricUnit: string; imperialUnit: string }> = {
  length: { metricUnit: 'm', imperialUnit: 'ft' },
  wingspan: { metricUnit: 'm', imperialUnit: 'ft' },
  wingarea: { metricUnit: 'm²', imperialUnit: 'ft²' },
  height: { metricUnit: 'm', imperialUnit: 'ft' },
  'thrust per engine': { metricUnit: 'kN', imperialUnit: 'lbf' },
  'total thrust': { metricUnit: 'kN', imperialUnit: 'lbf' },
  mtow: { metricUnit: 'kg', imperialUnit: 'lbs' },
  range: { metricUnit: 'km', imperialUnit: 'nm' },
}

function parseComparisonHtml(html: string, slug1: string, slug2: string) {
  const $ = cheerio.load(html)
  const table = $('table.compareTabela')

  const aircraft1: Partial<AircraftSpec> = { slug: slug1 }
  const aircraft2: Partial<AircraftSpec> = { slug: slug2 }

  // Get aircraft names from header
  const headers = table.find('th')
  if (headers.length >= 3) {
    aircraft1.name = $(headers[0]).text().trim()
    aircraft2.name = $(headers[2]).text().trim()
  }

  // Parse each data row
  table.find('tr').each((_, row) => {
    const tds = $(row).find('td')
    if (tds.length === 0) return

    // Find the label cell (contains <b> tag)
    let label = ''
    let labelIndex = -1
    tds.each((i, td) => {
      const bold = $(td).find('b')
      if (bold.length > 0) {
        label = bold.text().trim().toLowerCase()
        labelIndex = i
      }
    })

    if (!label || labelIndex === -1) return

    const config = statConfig[label]

    if (tds.length === 5 && config) {
      // Dual-unit row: [ac1 metric] [ac1 imperial] [label] [ac2 metric] [ac2 imperial]
      const ac1Metric = $(tds[0]).text().trim()
      const ac1Imperial = $(tds[1]).text().trim()
      const ac2Metric = $(tds[3]).text().trim()
      const ac2Imperial = $(tds[4]).text().trim()

      const val1 = parseDualUnit(ac1Metric, ac1Imperial, config.metricUnit, config.imperialUnit)
      const val2 = parseDualUnit(ac2Metric, ac2Imperial, config.metricUnit, config.imperialUnit)

      const key = label === 'wingarea' ? 'wingArea'
        : label === 'thrust per engine' ? 'thrustPerEngine'
        : label === 'total thrust' ? 'totalThrust'
        : label as keyof AircraftSpec

      ;(aircraft1 as Record<string, unknown>)[key] = val1
      ;(aircraft2 as Record<string, unknown>)[key] = val2
    } else if (tds.length === 3 || (tds.length === 5 && !config)) {
      // Single-value row or unrecognized dual row
      const ac1Text = $(tds[0]).text().trim()
      const ac2Text = $(tds[tds.length - 1]).text().trim()

      if (label === 'engines') {
        aircraft1.engines = parseInt(ac1Text) || 0
        aircraft2.engines = parseInt(ac2Text) || 0
      } else if (label === 'cruise speed') {
        aircraft1.cruiseSpeed = ac1Text
        aircraft2.cruiseSpeed = ac2Text
      } else if (label === 'capacity') {
        aircraft1.capacity = ac1Text
        aircraft2.capacity = ac2Text
      } else if (label === 'max. capacity') {
        aircraft1.maxCapacity = ac1Text
        aircraft2.maxCapacity = ac2Text
      }
    }
  })

  const defaultDual: DualUnit = { metric: 0, imperial: 0, metricUnit: '', imperialUnit: '' }

  const fillDefaults = (ac: Partial<AircraftSpec>): AircraftSpec => ({
    name: ac.name || '',
    slug: ac.slug || '',
    length: ac.length || defaultDual,
    wingspan: ac.wingspan || defaultDual,
    wingArea: ac.wingArea || defaultDual,
    height: ac.height || defaultDual,
    engines: ac.engines || 0,
    thrustPerEngine: ac.thrustPerEngine || defaultDual,
    totalThrust: ac.totalThrust || defaultDual,
    mtow: ac.mtow || defaultDual,
    range: ac.range || defaultDual,
    cruiseSpeed: ac.cruiseSpeed || '',
    capacity: ac.capacity || '',
    maxCapacity: ac.maxCapacity || '',
  })

  return {
    aircraft1: fillDefaults(aircraft1),
    aircraft2: fillDefaults(aircraft2),
    fetchedAt: new Date().toISOString(),
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { ac1, ac2 } = req.query

  if (!ac1 || !ac2 || typeof ac1 !== 'string' || typeof ac2 !== 'string') {
    return res.status(400).json({ error: 'Missing ac1 and ac2 query parameters' })
  }

  const slug1 = ac1.replace(/ /g, '_')
  const slug2 = ac2.replace(/ /g, '_')
  const url = `https://www.aviatorjoe.net/go/compare/${slug1}/${slug2}/`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return res.status(502).json({ error: `AviatorJoe returned ${response.status}` })
    }

    const html = await response.text()
    const data = parseComparisonHtml(html, ac1, ac2)

    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400')
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch comparison data' })
  }
}
