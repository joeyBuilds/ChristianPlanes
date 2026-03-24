import { useState, useRef, useEffect, type RefObject } from 'react'
import { Download, Check, Loader2 } from 'lucide-react'
import { toPng } from 'html-to-image'
import { cn } from '@/lib/utils'

interface ExportButtonProps {
  canvasRef: RefObject<HTMLDivElement | null>
  statsRef: RefObject<HTMLDivElement | null>
}

export function ExportButton({ canvasRef, statsRef }: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const [includeStats, setIncludeStats] = useState(false)
  const [includeControls, setIncludeControls] = useState(false)
  const [exporting, setExporting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function handleExport() {
    if (!canvasRef.current) return
    setExporting(true)

    try {
      // Build list of elements to capture
      const elements: HTMLElement[] = [canvasRef.current]

      if (includeControls) {
        // The controls bar is the next sibling of the canvas container
        const controlsEl = canvasRef.current.nextElementSibling as HTMLElement | null
        if (controlsEl) elements.push(controlsEl)
      }

      if (includeStats && statsRef.current) {
        elements.push(statsRef.current)
      }

      if (elements.length === 1) {
        // Single element — direct capture
        const dataUrl = await toPng(elements[0], {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: getComputedStyle(document.documentElement)
            .getPropertyValue('--background')
            .trim() || '#0a0a0a',
        })
        downloadImage(dataUrl)
      } else {
        // Multiple elements — capture each and stitch vertically
        const canvases: HTMLCanvasElement[] = []
        const gap = 16 // px gap between sections

        for (const el of elements) {
          const dataUrl = await toPng(el, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: getComputedStyle(document.documentElement)
              .getPropertyValue('--background')
              .trim() || '#0a0a0a',
          })
          const img = await loadImage(dataUrl)
          const cvs = document.createElement('canvas')
          cvs.width = img.width
          cvs.height = img.height
          const ctx = cvs.getContext('2d')!
          ctx.drawImage(img, 0, 0)
          canvases.push(cvs)
        }

        // Stitch together
        const maxWidth = Math.max(...canvases.map(c => c.width))
        const totalHeight = canvases.reduce((sum, c) => sum + c.height, 0) + gap * 2 * (canvases.length - 1)
        const padding = 32 * 2 // 2x pixel ratio

        const final = document.createElement('canvas')
        final.width = maxWidth + padding * 2
        final.height = totalHeight + padding * 2

        const ctx = final.getContext('2d')!

        // Background
        const bgColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--background')
          .trim() || '#0a0a0a'
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, final.width, final.height)

        let y = padding
        for (let i = 0; i < canvases.length; i++) {
          const cvs = canvases[i]
          const x = padding + (maxWidth - cvs.width) / 2
          ctx.drawImage(cvs, x, y)
          y += cvs.height + gap * 2
        }

        // Add watermark
        ctx.fillStyle = 'rgba(148,163,184,0.3)'
        ctx.font = `${12 * 2}px "JetBrains Mono", "SF Mono", monospace`
        ctx.textAlign = 'right'
        ctx.fillText('christianplanes.com', final.width - padding, final.height - padding / 2)

        const dataUrl = final.toDataURL('image/png')
        downloadImage(dataUrl)
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
      setOpen(false)
    }
  }

  const pill = 'px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium rounded-full transition-all flex items-center gap-1 sm:gap-1.5 border cursor-pointer whitespace-nowrap'
  const exportActive = 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
  const exportInactive = 'text-cyan-700/50 dark:text-cyan-500/40 border-transparent hover:bg-cyan-500/8 hover:border-cyan-500/20'

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(pill, open ? exportActive : exportInactive)}
        disabled={exporting}
      >
        {exporting ? (
          <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
        ) : (
          <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        )}
        Export
      </button>

      {open && (
        <div className="absolute z-50 bottom-full mb-2 right-0 w-56 rounded-lg border border-border bg-popover shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Export options
            </span>
          </div>

          <div className="p-2 space-y-1">
            {/* Canvas — always included, shown as locked */}
            <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-foreground/80 cursor-default">
              <div className="w-4 h-4 rounded border border-cyan-500/50 bg-cyan-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-cyan-500" />
              </div>
              Aircraft canvas
            </label>

            {/* Controls toggle */}
            <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm hover:bg-muted/50 transition-colors cursor-pointer">
              <button
                type="button"
                role="checkbox"
                aria-checked={includeControls}
                onClick={() => setIncludeControls(!includeControls)}
                className={cn(
                  'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                  includeControls
                    ? 'border-cyan-500/50 bg-cyan-500/20'
                    : 'border-border bg-transparent'
                )}
              >
                {includeControls && <Check className="w-3 h-3 text-cyan-500" />}
              </button>
              View controls
            </label>

            {/* Stats toggle */}
            <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm hover:bg-muted/50 transition-colors cursor-pointer">
              <button
                type="button"
                role="checkbox"
                aria-checked={includeStats}
                onClick={() => setIncludeStats(!includeStats)}
                className={cn(
                  'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                  includeStats
                    ? 'border-cyan-500/50 bg-cyan-500/20'
                    : 'border-border bg-transparent'
                )}
              >
                {includeStats && <Check className="w-3 h-3 text-cyan-500" />}
              </button>
              Stats panel
            </label>
          </div>

          <div className="p-2 border-t border-border/60">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Exporting…
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Download PNG
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function downloadImage(dataUrl: string) {
  const link = document.createElement('a')
  link.download = `aircraft-comparison-${Date.now()}.png`
  link.href = dataUrl
  link.click()
}
