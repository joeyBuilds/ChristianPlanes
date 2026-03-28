import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'
import { useComparisonStore } from '@/stores/comparison-store'
import { urlSegmentToSlug } from '@/data/aircraft-catalog'
import { Header } from '@/components/layout/Header'
import { ComparisonCanvas } from '@/components/canvas/ComparisonCanvas'
import { CanvasControls } from '@/components/canvas/CanvasControls'
import { StatsPanel } from '@/components/comparison/StatsPanel'
import { GhostStatsPanel } from '@/components/comparison/GhostStatsPanel'
import { FunFacts } from '@/components/comparison/FunFacts'
import { SpotterCards } from '@/components/comparison/SpotterCards'
import { RangeMapSection } from '@/components/range-map/RangeMapSection'
import { useAircraftData } from '@/hooks/useAircraftData'
import { useGhostAircraft } from '@/hooks/useGhostAircraft'
import { Loader2 } from 'lucide-react'

function ComparisonPage() {
  const { ac1, ac2 } = useParams()
  const navigate = useNavigate()
  const {
    aircraft1Slug,
    aircraft2Slug,
    ghostAircraftSlug,
    setAircraft1,
    setAircraft2,
  } = useComparisonStore()

  useEffect(() => {
    if (ac1) setAircraft1(urlSegmentToSlug(ac1))
    if (ac2) setAircraft2(urlSegmentToSlug(ac2))
  }, [ac1, ac2, setAircraft1, setAircraft2])

  useEffect(() => {
    if (aircraft1Slug && aircraft2Slug) {
      const s1 = aircraft1Slug.replace(/ /g, '_')
      const s2 = aircraft2Slug.replace(/ /g, '_')
      const currentPath = `/compare/${ac1}/${ac2}`
      const newPath = `/compare/${s1}/${s2}`
      if (currentPath !== newPath) {
        navigate(newPath, { replace: true })
      }
    }
  }, [aircraft1Slug, aircraft2Slug, ac1, ac2, navigate])

  const canvasRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, error } = useAircraftData(aircraft1Slug, aircraft2Slug)
  const { data: ghostData } = useGhostAircraft(ghostAircraftSlug)

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-4 py-3 sm:py-6 flex flex-col gap-2 sm:gap-4">
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Fetching aircraft data...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-20 text-destructive">
            Failed to load comparison data. Please try again.
          </div>
        )}

        {data && (
          <>
            <div ref={canvasRef}>
              <ComparisonCanvas
                aircraft1={data.aircraft1}
                aircraft2={data.aircraft2}
              />
            </div>
            <CanvasControls canvasRef={canvasRef} statsRef={statsRef} />
            <div ref={statsRef} className={ghostData ? 'flex flex-col md:flex-row gap-2 sm:gap-4' : ''}>
              <div className={ghostData ? 'flex-1 min-w-0' : ''}>
                <StatsPanel
                  aircraft1={data.aircraft1}
                  aircraft2={data.aircraft2}
                  aircraft1Slug={aircraft1Slug}
                  aircraft2Slug={aircraft2Slug}
                  onSelectAircraft1={setAircraft1}
                  onSelectAircraft2={setAircraft2}
                />
              </div>
              {ghostData && (
                <div className="flex-1 min-w-0">
                  <GhostStatsPanel ghostSpec={ghostData} />
                </div>
              )}
            </div>
            <SpotterCards
              aircraft1Slug={aircraft1Slug}
              aircraft2Slug={aircraft2Slug}
              aircraft1Name={data.aircraft1.name}
              aircraft2Name={data.aircraft2.name}
            />
            <RangeMapSection
              aircraft1={data.aircraft1}
              aircraft2={data.aircraft2}
            />
            <FunFacts
              aircraft1={data.aircraft1}
              aircraft2={data.aircraft2}
            />
          </>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/compare/:ac1/:ac2" element={<ComparisonPage />} />
      <Route path="*" element={<Navigate to="/compare/A220-100/A320-200" replace />} />
    </Routes>
  )
}

export default App
