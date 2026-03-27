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

  res.writeHead(404)
  res.end('Not found')
})

server.listen(3001, () => {
  console.log('Dev proxy running on http://localhost:3001')
})
