import http from 'node:http'
import * as cheerio from 'cheerio'

function parseNumber(text) {
  const cleaned = text.replace(/,/g, '').replace(/[^\d.]/g, '')
  return parseFloat(cleaned) || 0
}

function parseImperialFeetInches(text) {
  const match = text.match(/([\d,]+)\s*ft\s*([\d]+)?\s*in?/)
  if (match) {
    const feet = parseNumber(match[1])
    const inches = match[2] ? parseNumber(match[2]) : 0
    return feet + inches / 12
  }
  return parseNumber(text)
}

function parseImperialValue(text) {
  if (text.includes('ft') && text.includes('in')) return parseImperialFeetInches(text)
  return parseNumber(text)
}

function parseDualUnit(metricText, imperialText, metricUnit, imperialUnit) {
  return {
    metric: parseNumber(metricText),
    imperial: parseImperialValue(imperialText),
    metricUnit,
    imperialUnit,
  }
}

const statConfig = {
  length: { metricUnit: 'm', imperialUnit: 'ft' },
  wingspan: { metricUnit: 'm', imperialUnit: 'ft' },
  wingarea: { metricUnit: 'm²', imperialUnit: 'ft²' },
  height: { metricUnit: 'm', imperialUnit: 'ft' },
  'thrust per engine': { metricUnit: 'kN', imperialUnit: 'lbf' },
  'total thrust': { metricUnit: 'kN', imperialUnit: 'lbf' },
  mtow: { metricUnit: 'kg', imperialUnit: 'lbs' },
  range: { metricUnit: 'km', imperialUnit: 'nm' },
}

function parseComparisonHtml(html, slug1, slug2) {
  const $ = cheerio.load(html)
  const table = $('table.compareTabela')

  const aircraft1 = { slug: slug1 }
  const aircraft2 = { slug: slug2 }

  const headers = table.find('th')
  if (headers.length >= 3) {
    aircraft1.name = $(headers[0]).text().trim()
    aircraft2.name = $(headers[2]).text().trim()
  }

  table.find('tr').each((_, row) => {
    const tds = $(row).find('td')
    if (tds.length === 0) return

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
      const val1 = parseDualUnit(
        $(tds[0]).text().trim(), $(tds[1]).text().trim(),
        config.metricUnit, config.imperialUnit
      )
      const val2 = parseDualUnit(
        $(tds[3]).text().trim(), $(tds[4]).text().trim(),
        config.metricUnit, config.imperialUnit
      )
      const key = label === 'wingarea' ? 'wingArea'
        : label === 'thrust per engine' ? 'thrustPerEngine'
        : label === 'total thrust' ? 'totalThrust'
        : label
      aircraft1[key] = val1
      aircraft2[key] = val2
    } else {
      // Text-based rows (engines, cruise, capacity) — grab first and last td text
      const allTds = tds.toArray()
      // Find text cells before and after the label
      let ac1Text = '', ac2Text = ''
      if (labelIndex > 0) {
        ac1Text = $(allTds[0]).text().trim()
      }
      if (labelIndex < allTds.length - 1) {
        ac2Text = $(allTds[allTds.length - 1]).text().trim()
      }
      if (label === 'engines') {
        aircraft1.engines = parseInt(ac1Text) || 0
        aircraft2.engines = parseInt(ac2Text) || 0
      } else if (label === 'cruise speed') {
        aircraft1.cruiseSpeed = ac1Text
        aircraft2.cruiseSpeed = ac2Text
      } else if (label.includes('capacity')) {
        if (ac1Text && !aircraft1.capacity) aircraft1.capacity = ac1Text
        if (ac2Text && !aircraft2.capacity) aircraft2.capacity = ac2Text
      }
    }
  })

  const d = { metric: 0, imperial: 0, metricUnit: '', imperialUnit: '' }
  const fill = (ac) => ({
    name: ac.name || '', slug: ac.slug || '',
    length: ac.length || d, wingspan: ac.wingspan || d,
    wingArea: ac.wingArea || d, height: ac.height || d,
    engines: ac.engines || 0,
    thrustPerEngine: ac.thrustPerEngine || d, totalThrust: ac.totalThrust || d,
    mtow: ac.mtow || d, range: ac.range || d,
    cruiseSpeed: ac.cruiseSpeed || '', capacity: ac.capacity || '',
    maxCapacity: ac.maxCapacity || '',
  })

  return { aircraft1: fill(aircraft1), aircraft2: fill(aircraft2), fetchedAt: new Date().toISOString() }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3001')

  if (url.pathname === '/api/proxy') {
    const ac1 = url.searchParams.get('ac1')
    const ac2 = url.searchParams.get('ac2')

    if (!ac1 || !ac2) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Missing ac1 and ac2' }))
      return
    }

    try {
      const fetchUrl = `https://www.aviatorjoe.net/go/compare/${ac1}/${ac2}/`
      console.log(`Fetching: ${fetchUrl}`)
      const response = await fetch(fetchUrl)
      const html = await response.text()
      const data = parseComparisonHtml(html, ac1, ac2)

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      })
      res.end(JSON.stringify(data, null, 2))
    } catch (err) {
      console.error(err)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Failed to fetch' }))
    }
    return
  }

  if (url.pathname === '/api/fleet-pulse') {
    const typesParam = url.searchParams.get('types') || ''
    const requestedTypes = typesParam.split(',').filter(Boolean)

    if (requestedTypes.length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Missing types parameter' }))
      return
    }

    // Estimate counts based on fleet proportions
    const FLEET_PROPORTIONS = {
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

    // Try OpenSky for live total flight count, fall back to typical average
    let totalFlights = 7000 // typical global average
    let live = false

    try {
      console.log(`Fleet pulse: fetching OpenSky states...`)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const response = await fetch('https://opensky-network.org/api/states/all', {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (response.ok) {
        const data = await response.json()
        totalFlights = (data.states || []).length
        live = true
        console.log(`Fleet pulse: ${totalFlights} live flights`)
      } else {
        console.log(`Fleet pulse: OpenSky returned ${response.status}, using fallback`)
      }
    } catch (err) {
      console.log(`Fleet pulse: OpenSky unavailable (${err.message}), using fallback estimate`)
    }

    // Apply time-of-day variance: flights peak around 14:00-20:00 UTC
    const hour = new Date().getUTCHours()
    const timeOfDayFactor = 0.7 + 0.6 * Math.sin(((hour - 6) / 24) * Math.PI * 2)
    if (!live) {
      totalFlights = Math.round(totalFlights * timeOfDayFactor)
    }

    const counts = {}
    for (const type of requestedTypes) {
      const prop = FLEET_PROPORTIONS[type]
      if (prop) {
        counts[type] = Math.round(totalFlights * prop * (0.90 + Math.random() * 0.20))
      } else {
        counts[type] = 0
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify({ counts, updatedAt: new Date().toISOString(), totalFlights, live }))
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(3001, () => {
  console.log('Dev proxy running on http://localhost:3001')
})
