import { Plane } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h1 className="text-sm sm:text-lg font-semibold text-foreground">Aircraft Compare</h1>
        </div>
      </div>
    </header>
  )
}
