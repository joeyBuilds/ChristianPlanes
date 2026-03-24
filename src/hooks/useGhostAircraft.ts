import { useQuery } from '@tanstack/react-query'
import type { AircraftSpec } from '@/types/aircraft'
import { slugToUrlSegment } from '@/data/aircraft-catalog'

async function fetchSingleAircraft(slug: string): Promise<AircraftSpec> {
  const segment = slugToUrlSegment(slug)
  const params = new URLSearchParams({ ac1: segment, ac2: segment })
  const res = await fetch(`/api/proxy?${params}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch aircraft: ${res.status}`)
  }
  const data = await res.json()
  return data.aircraft1
}

export function useGhostAircraft(slug: string | null) {
  return useQuery({
    queryKey: ['ghost-aircraft', slug],
    queryFn: () => fetchSingleAircraft(slug!),
    enabled: !!slug,
    staleTime: Infinity,
  })
}
