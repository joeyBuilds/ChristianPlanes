import { useQuery } from '@tanstack/react-query'
import type { Airport } from '@/types/airport'

async function fetchAirports(): Promise<Airport[]> {
  const res = await fetch('/data/airports.json')
  if (!res.ok) throw new Error(`Failed to load airports: ${res.status}`)
  return res.json()
}

export function useAirports(enabled = true) {
  return useQuery({
    queryKey: ['airports'],
    queryFn: fetchAirports,
    staleTime: Infinity,
    enabled,
  })
}
