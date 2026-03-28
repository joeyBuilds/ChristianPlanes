import { motion } from 'framer-motion'
import { PlaneTakeoff } from 'lucide-react'

interface FleetPulseBadgeProps {
  count: number | null
  isLoading: boolean
}

export function FleetPulseBadge({ count, isLoading }: FleetPulseBadgeProps) {
  if (count === null && !isLoading) return null

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1 text-xs font-mono font-semibold tabular-nums text-emerald-400 whitespace-nowrap"
    >
      {count !== null ? (
        <>
          <PlaneTakeoff className="w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.7)] animate-pulse" />
          {count.toLocaleString()} in air
        </>
      ) : (
        <span className="w-8 h-2.5 rounded bg-muted/40 animate-pulse" />
      )}
    </motion.span>
  )
}
