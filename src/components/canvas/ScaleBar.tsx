interface ScaleBarProps {
  pixelsPerMeter: number
  x: number
  y: number
}

export function ScaleBar({ pixelsPerMeter, x, y }: ScaleBarProps) {
  // Choose a nice round scale length
  const candidates = [1, 2, 5, 10, 20, 50, 100]
  let scaleMeters = 10
  for (const c of candidates) {
    if (c * pixelsPerMeter >= 40 && c * pixelsPerMeter <= 200) {
      scaleMeters = c
      break
    }
  }
  const scalePixels = scaleMeters * pixelsPerMeter

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-4} y={-6} width={scalePixels + 8} height={24} rx={3} fill="#0a1929" fillOpacity={0.85} stroke="#1e4d7a" strokeWidth={0.5} />
      <line x1={0} y1={0} x2={scalePixels} y2={0} stroke="#60a5fa" strokeWidth={1.5} />
      <line x1={0} y1={-3} x2={0} y2={4} stroke="#60a5fa" strokeWidth={1} />
      <line x1={scalePixels} y1={-3} x2={scalePixels} y2={4} stroke="#60a5fa" strokeWidth={1} />
      {/* Midpoint tick */}
      <line x1={scalePixels / 2} y1={-1} x2={scalePixels / 2} y2={3} stroke="#60a5fa" strokeWidth={0.5} opacity={0.6} />
      <text
        x={scalePixels / 2}
        y={14}
        textAnchor="middle"
        fill="#93c5fd"
        fontSize={9}
        fontFamily="'JetBrains Mono', 'SF Mono', 'Fira Code', monospace"
        fontWeight={500}
      >
        {scaleMeters} m
      </text>
    </g>
  )
}
