import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getIcaoTypes } from '@/data/icao-type-mapping'

interface FleetPulseResponse {
  counts: Record<string, number> | null
  updatedAt: string | null
  error?: string
}

interface FleetPulseResult {
  count1: number | null
  count2: number | null
  updatedAt: string | null
  isLoading: boolean
}

async function fetchFleetPulse(types: string[]): Promise<FleetPulseResponse> {
  if (types.length === 0) return { counts: null, updatedAt: null }
  const res = await fetch(`/api/fleet-pulse?types=${types.join(',')}`)
  if (!res.ok) return { counts: null, updatedAt: null, error: `HTTP ${res.status}` }
  return res.json()
}

export function useFleetPulse(
  slug1: string | null,
  slug2: string | null,
): FleetPulseResult {
  const types1 = slug1 ? getIcaoTypes(slug1) : []
  const types2 = slug2 ? getIcaoTypes(slug2) : []
  const allTypes = [...new Set([...types1, ...types2])]

  const { data, isLoading } = useQuery({
    queryKey: ['fleet-pulse', allTypes.sort().join(',')],
    queryFn: () => fetchFleetPulse(allTypes),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
    placeholderData: keepPreviousData,
    enabled: allTypes.length > 0,
  })

  const counts = data?.counts

  // Sum counts across all ICAO types for each aircraft slug
  const count1 =
    counts && types1.length > 0
      ? types1.reduce((sum, t) => sum + (counts[t] ?? 0), 0)
      : null
  const count2 =
    counts && types2.length > 0
      ? types2.reduce((sum, t) => sum + (counts[t] ?? 0), 0)
      : null

  return {
    count1,
    count2,
    updatedAt: data?.updatedAt ?? null,
    isLoading,
  }
}
