import { cn } from '@/lib/utils'

interface StatBarProps {
  label: string
  value1: number
  value2: number
  formatted1: string
  formatted2: string
  higherIsBetter?: boolean
}

export function StatBar({ label, value1, value2, formatted1, formatted2, higherIsBetter = true }: StatBarProps) {
  const max = Math.max(value1, value2)
  const min = Math.min(value1, value2)
  const pct1 = max > 0 ? (value1 / max) * 100 : 0
  const pct2 = max > 0 ? (value2 / max) * 100 : 0

  const winner1 = higherIsBetter ? value1 > value2 : value1 < value2
  const winner2 = higherIsBetter ? value2 > value1 : value2 < value1
  const tie = value1 === value2

  // Compute delta details
  const diff = Math.abs(value1 - value2)
  const pctDiff = min > 0 ? ((diff / min) * 100) : 0
  const diffFormatted = pctDiff < 0.1 ? '' : `${pctDiff < 10 ? pctDiff.toFixed(1) : Math.round(pctDiff)}%`

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center py-2">
      {/* Aircraft 1 side */}
      <div className="flex items-center gap-2">
        <span className={cn(
          'text-sm font-mono tabular-nums shrink-0 min-w-[80px] text-right',
          winner1 && !tie ? 'text-blue-500 font-semibold' : 'text-muted-foreground'
        )}>
          {formatted1}
        </span>
        <div className="flex-1 flex items-center gap-1.5">
          <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden flex justify-end">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                winner1 && !tie ? 'bg-blue-500' : 'bg-blue-400/40'
              )}
              style={{ width: `${pct1}%` }}
            />
          </div>
          {/* Delta badge — winner side only */}
          {winner1 && !tie && diffFormatted && (
            <span className="text-[10px] font-semibold text-blue-500/70 tabular-nums shrink-0 font-mono">
              +{diffFormatted}
            </span>
          )}
        </div>
      </div>

      {/* Label */}
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[90px] text-center">
        {label}
      </span>

      {/* Aircraft 2 side */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1.5">
          {/* Delta badge — winner side only */}
          {winner2 && !tie && diffFormatted && (
            <span className="text-[10px] font-semibold text-red-500/70 tabular-nums shrink-0 font-mono">
              +{diffFormatted}
            </span>
          )}
          <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                winner2 && !tie ? 'bg-red-500' : 'bg-red-400/40'
              )}
              style={{ width: `${pct2}%` }}
            />
          </div>
        </div>
        <span className={cn(
          'text-sm font-mono tabular-nums shrink-0 min-w-[80px]',
          winner2 && !tie ? 'text-red-500 font-semibold' : 'text-muted-foreground'
        )}>
          {formatted2}
        </span>
      </div>
    </div>
  )
}
