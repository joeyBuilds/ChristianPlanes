import { getSpotterTips } from '@/data/spotter-tips'
import { Eye } from 'lucide-react'

interface SpotterCardsProps {
  aircraft1Slug: string | null
  aircraft2Slug: string | null
  aircraft1Name: string
  aircraft2Name: string
}

export function SpotterCards({ aircraft1Slug, aircraft2Slug, aircraft1Name, aircraft2Name }: SpotterCardsProps) {
  const tips1 = aircraft1Slug ? getSpotterTips(aircraft1Slug) : []
  const tips2 = aircraft2Slug ? getSpotterTips(aircraft2Slug) : []

  if (tips1.length === 0 && tips2.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-muted/10">
        <Eye className="w-3.5 h-3.5 text-muted-foreground/60" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
          How to Spot It
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
        {/* Aircraft 1 tips */}
        <div className="p-3 sm:p-4">
          <div className="text-xs font-semibold text-blue-500 mb-2">{aircraft1Name}</div>
          {tips1.length > 0 ? (
            <ul className="space-y-2">
              {tips1.map((tip, i) => (
                <li key={i}>
                  <div className="text-xs font-medium text-foreground">{tip.feature}</div>
                  <div className="text-[11px] text-muted-foreground/70 leading-snug">{tip.detail}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-muted-foreground/40 italic">No spotter tips available</div>
          )}
        </div>
        {/* Aircraft 2 tips */}
        <div className="p-3 sm:p-4">
          <div className="text-xs font-semibold text-red-500 mb-2">{aircraft2Name}</div>
          {tips2.length > 0 ? (
            <ul className="space-y-2">
              {tips2.map((tip, i) => (
                <li key={i}>
                  <div className="text-xs font-medium text-foreground">{tip.feature}</div>
                  <div className="text-[11px] text-muted-foreground/70 leading-snug">{tip.detail}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-muted-foreground/40 italic">No spotter tips available</div>
          )}
        </div>
      </div>
    </div>
  )
}
