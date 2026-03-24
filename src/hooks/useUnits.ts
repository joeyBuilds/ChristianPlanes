import { useComparisonStore } from '@/stores/comparison-store'
import type { DualUnit } from '@/types/aircraft'

export function useUnits() {
  const unitSystem = useComparisonStore((s) => s.unitSystem)

  function formatValue(dual: DualUnit, decimals = 1): string {
    const val = unitSystem === 'metric' ? dual.metric : dual.imperial
    const unit = unitSystem === 'metric' ? dual.metricUnit : dual.imperialUnit
    return `${val.toLocaleString(undefined, { maximumFractionDigits: decimals })} ${unit}`
  }

  function getValue(dual: DualUnit): number {
    return unitSystem === 'metric' ? dual.metric : dual.imperial
  }

  function getUnit(dual: DualUnit): string {
    return unitSystem === 'metric' ? dual.metricUnit : dual.imperialUnit
  }

  return { unitSystem, formatValue, getValue, getUnit }
}
