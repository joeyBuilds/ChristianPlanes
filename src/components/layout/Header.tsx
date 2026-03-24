import { Plane } from 'lucide-react'
import { useComparisonStore } from '@/stores/comparison-store'

export function Header() {
  const { unitSystem, setUnitSystem } = useComparisonStore()

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h1 className="text-sm sm:text-lg font-semibold text-foreground">Aircraft Compare</h1>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            {unitSystem === 'metric' ? 'Metric' : 'Imperial'}
          </button>
          <button
            onClick={() => {
              document.documentElement.classList.toggle('dark')
            }}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            Theme
          </button>
        </div>
      </div>
    </header>
  )
}
