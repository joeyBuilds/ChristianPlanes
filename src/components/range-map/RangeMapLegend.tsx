interface RangeMapLegendProps {
  aircraft1Name: string
  aircraft2Name: string
  range1Km: number
  range2Km: number
  unitSystem: 'metric' | 'imperial'
}

export function RangeMapLegend({
  aircraft1Name,
  aircraft2Name,
  range1Km,
  range2Km,
  unitSystem,
}: RangeMapLegendProps) {
  const format = (km: number) => {
    if (unitSystem === 'imperial') {
      const nm = Math.round(km / 1.852)
      return `${nm.toLocaleString()} nm`
    }
    return `${Math.round(km).toLocaleString()} km`
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-blue-400/30 border border-blue-400/60" />
        <span>{aircraft1Name}</span>
        <span className="font-mono tabular-nums">{format(range1Km)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-red-400/30 border border-red-400/60" />
        <span>{aircraft2Name}</span>
        <span className="font-mono tabular-nums">{format(range2Km)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-purple-400/30 border border-purple-400/60" />
        <span>Both can reach</span>
      </div>
    </div>
  )
}
