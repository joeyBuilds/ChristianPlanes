import { useQuery } from '@tanstack/react-query'
import type { AircraftSpec } from '@/types/aircraft'
import { slugToUrlSegment } from '@/data/aircraft-catalog'

interface ComparisonResponse {
  aircraft1: AircraftSpec
  aircraft2: AircraftSpec
  fetchedAt: string
}

async function fetchComparison(ac1: string, ac2: string): Promise<ComparisonResponse> {
  const params = new URLSearchParams({
    ac1: slugToUrlSegment(ac1),
    ac2: slugToUrlSegment(ac2),
  })
  const res = await fetch(`/api/proxy?${params}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch comparison: ${res.status}`)
  }
  return res.json()
}

export function useAircraftData(ac1: string | null, ac2: string | null) {
  return useQuery({
    queryKey: ['comparison', ac1, ac2],
    queryFn: () => fetchComparison(ac1!, ac2!),
    enabled: !!ac1 && !!ac2,
    staleTime: Infinity,
  })
}
