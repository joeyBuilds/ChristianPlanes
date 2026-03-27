import { useMemo } from 'react'

interface ReferenceObjectsProps {
  pixelsPerMeter: number
  groundY: number
  x: number
  canvasWidth: number
  isDark: boolean
  viewAngle: 'side' | 'top' | 'front'
}

interface RefObject {
  label: string
  lengthM: number
  heightM?: number   // side view only
  widthM?: number    // top-down footprint width
  color: string
  icon?: string
}

// Curated references that aviation geeks will appreciate
const SIDE_REFERENCES: RefObject[] = [
  { label: 'Tennis Court', lengthM: 23.77, heightM: 1.07, color: '#22c55e' },
  { label: 'Blue Whale', lengthM: 30, heightM: 4.5, color: '#06b6d4' },
  { label: 'Basketball Court', lengthM: 28, heightM: 0, color: '#f59e0b' },
  { label: 'Football Pitch', lengthM: 100, heightM: 0, color: '#10b981' },
  { label: 'Statue of Liberty', lengthM: 18.3, heightM: 46, color: '#a78bfa' }, // statue without pedestal base width ~18m
  { label: 'Person (1.8m)', lengthM: 0.5, heightM: 1.8, color: '#94a3b8' },
]

const TOP_REFERENCES: RefObject[] = [
  { label: 'Tennis Court', lengthM: 23.77, widthM: 10.97, color: '#22c55e' },
  { label: 'Basketball Court', lengthM: 28, widthM: 15, color: '#f59e0b' },
  { label: 'Football Pitch', lengthM: 100, widthM: 64, color: '#10b981' },
  { label: 'Swimming Pool (Olympic)', lengthM: 50, widthM: 25, color: '#06b6d4' },
]

const FONT = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace"

export function ReferenceObjects({ pixelsPerMeter, groundY, x, canvasWidth, isDark, viewAngle }: ReferenceObjectsProps) {
  const refs = viewAngle === 'top' ? TOP_REFERENCES : SIDE_REFERENCES

  // Select which references fit the current scale — show objects within a reasonable pixel range
  const visibleRefs = useMemo(() => {
    return refs.filter(ref => {
      const pxLen = ref.lengthM * pixelsPerMeter
      // Must be at least 15px to be visible, and not wider than canvas
      return pxLen >= 15 && pxLen < canvasWidth * 0.8
    })
  }, [refs, pixelsPerMeter, canvasWidth])

  if (visibleRefs.length === 0) return null

  const labelOpacity = isDark ? 0.8 : 0.7

  return (
    <g>
      {viewAngle === 'side'
        ? visibleRefs.map((ref, i) => (
            <SideRefObject
              key={ref.label}
              ref_={ref}
              pixelsPerMeter={pixelsPerMeter}
              groundY={groundY}
              x={x + i * 12} // slight stagger so ground-level objects don't fully overlap
              labelOpacity={labelOpacity}
              isDark={isDark}
            />
          ))
        : visibleRefs.map((ref, i) => (
            <TopRefObject
              key={ref.label}
              ref_={ref}
              pixelsPerMeter={pixelsPerMeter}
              groundY={groundY}
              x={x + i * 12}
              labelOpacity={labelOpacity}
              isDark={isDark}
            />
          ))
      }
    </g>
  )
}

function SideRefObject({ ref_, pixelsPerMeter, groundY, x, labelOpacity, isDark }: {
  ref_: RefObject; pixelsPerMeter: number; groundY: number; x: number; labelOpacity: number; isDark: boolean
}) {
  const pxLen = ref_.lengthM * pixelsPerMeter
  const pxH = (ref_.heightM || 0) * pixelsPerMeter
  const baseY = groundY

  // For flat objects (basketball court, football pitch) — draw as a ground line with end markers
  if (pxH < 3) {
    return (
      <g opacity={0.6}>
        {/* Ground line */}
        <line
          x1={x} y1={baseY} x2={x + pxLen} y2={baseY}
          stroke={ref_.color} strokeWidth={1.5} strokeDasharray="4 2"
        />
        {/* End caps */}
        <line x1={x} y1={baseY - 4} x2={x} y2={baseY + 4} stroke={ref_.color} strokeWidth={1} />
        <line x1={x + pxLen} y1={baseY - 4} x2={x + pxLen} y2={baseY + 4} stroke={ref_.color} strokeWidth={1} />
        {/* Label */}
        <g transform={`translate(${x + pxLen / 2}, ${baseY + 14})`}>
          <rect
            x={-(ref_.label.length * 3.2 + 8)}
            y={-8}
            width={ref_.label.length * 6.4 + 16}
            height={14}
            rx={3}
            fill={isDark ? 'rgba(10,25,41,0.85)' : 'rgba(255,255,255,0.85)'}
            stroke={ref_.color}
            strokeWidth={0.4}
            strokeOpacity={0.5}
          />
          <text
            textAnchor="middle"
            fill={ref_.color}
            fontSize={8}
            fontFamily={FONT}
            opacity={labelOpacity}
            dy={2}
          >
            {ref_.label} · {ref_.lengthM}m
          </text>
        </g>
      </g>
    )
  }

  // For tall objects (statue of liberty, blue whale, person) — draw as outlined shape
  const objY = baseY - pxH
  return (
    <g opacity={0.5}>
      {/* Outline rectangle */}
      <rect
        x={x}
        y={objY}
        width={pxLen}
        height={pxH}
        rx={2}
        fill="none"
        stroke={ref_.color}
        strokeWidth={0.8}
        strokeDasharray="3 2"
      />
      {/* Height dimension line */}
      <line x1={x - 6} y1={objY} x2={x - 6} y2={baseY} stroke={ref_.color} strokeWidth={0.5} opacity={0.6} />
      <line x1={x - 8} y1={objY} x2={x - 4} y2={objY} stroke={ref_.color} strokeWidth={0.5} opacity={0.6} />
      <line x1={x - 8} y1={baseY} x2={x - 4} y2={baseY} stroke={ref_.color} strokeWidth={0.5} opacity={0.6} />
      {/* Height label */}
      <text
        x={x - 10}
        y={objY + pxH / 2 + 3}
        textAnchor="end"
        fill={ref_.color}
        fontSize={7}
        fontFamily={FONT}
        opacity={labelOpacity * 0.8}
      >
        {ref_.heightM}m
      </text>
      {/* Name label at top */}
      <g transform={`translate(${x + pxLen / 2}, ${objY - 8})`}>
        <rect
          x={-(ref_.label.length * 3 + 6)}
          y={-7}
          width={ref_.label.length * 6 + 12}
          height={13}
          rx={3}
          fill={isDark ? 'rgba(10,25,41,0.85)' : 'rgba(255,255,255,0.85)'}
          stroke={ref_.color}
          strokeWidth={0.4}
          strokeOpacity={0.4}
        />
        <text
          textAnchor="middle"
          fill={ref_.color}
          fontSize={7.5}
          fontFamily={FONT}
          opacity={labelOpacity}
          dy={2}
        >
          {ref_.label}
        </text>
      </g>
    </g>
  )
}

function TopRefObject({ ref_, pixelsPerMeter, groundY, x, labelOpacity, isDark }: {
  ref_: RefObject; pixelsPerMeter: number; groundY: number; x: number; labelOpacity: number; isDark: boolean
}) {
  const pxLen = ref_.lengthM * pixelsPerMeter
  const pxW = (ref_.widthM || 0) * pixelsPerMeter
  // Center vertically around ground line area
  const objY = groundY - pxW

  return (
    <g opacity={0.45}>
      {/* Outline rectangle */}
      <rect
        x={x}
        y={objY}
        width={pxLen}
        height={pxW}
        rx={2}
        fill="none"
        stroke={ref_.color}
        strokeWidth={0.8}
        strokeDasharray="4 2"
      />
      {/* Length dimension at bottom */}
      <line x1={x} y1={objY + pxW + 6} x2={x + pxLen} y2={objY + pxW + 6} stroke={ref_.color} strokeWidth={0.5} opacity={0.5} />
      <line x1={x} y1={objY + pxW + 3} x2={x} y2={objY + pxW + 9} stroke={ref_.color} strokeWidth={0.5} opacity={0.5} />
      <line x1={x + pxLen} y1={objY + pxW + 3} x2={x + pxLen} y2={objY + pxW + 9} stroke={ref_.color} strokeWidth={0.5} opacity={0.5} />
      <text
        x={x + pxLen / 2}
        y={objY + pxW + 16}
        textAnchor="middle"
        fill={ref_.color}
        fontSize={7}
        fontFamily={FONT}
        opacity={labelOpacity * 0.7}
      >
        {ref_.lengthM}m
      </text>
      {/* Name label in center */}
      <g transform={`translate(${x + pxLen / 2}, ${objY + pxW / 2})`}>
        <rect
          x={-(ref_.label.length * 3 + 6)}
          y={-7}
          width={ref_.label.length * 6 + 12}
          height={13}
          rx={3}
          fill={isDark ? 'rgba(10,25,41,0.85)' : 'rgba(255,255,255,0.85)'}
          stroke={ref_.color}
          strokeWidth={0.4}
          strokeOpacity={0.3}
        />
        <text
          textAnchor="middle"
          fill={ref_.color}
          fontSize={7.5}
          fontFamily={FONT}
          opacity={labelOpacity}
          dy={2.5}
        >
          {ref_.label}
        </text>
      </g>
    </g>
  )
}
