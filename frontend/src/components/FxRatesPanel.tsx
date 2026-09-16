'use client'

import { useEffect, useState } from 'react'
import {
  CURRENCY_OPTIONS,
  currencyLabel,
  defaultFxConfig,
  loadFxConfig,
  saveFxConfig,
  type FxConfig,
} from '@/lib/money'

type FxRatesPanelProps = {
  tone?: 'dark' | 'light'
  onChange?: (fx: FxConfig) => void
}

export default function FxRatesPanel({ tone = 'dark', onChange }: FxRatesPanelProps) {
  const [fx, setFx] = useState<FxConfig>(defaultFxConfig)

  useEffect(() => {
    const loaded = loadFxConfig()
    setFx(loaded)
    onChange?.(loaded)
  }, [onChange])

  const update = (next: FxConfig) => {
    setFx(next)
    saveFxConfig(next)
    onChange?.(next)
  }

  const isDark = tone === 'dark'
  const panel = isDark
    ? 'border-white/10 bg-white/5 text-white'
    : 'border-gray-200 bg-white text-gray-900'
  const muted = isDark ? 'text-gray-400' : 'text-gray-500'
  const input = isDark
    ? 'bg-granite-700 border-granite-600 text-white'
    : 'bg-white border-gray-300 text-gray-900'

  const reporting = currencyLabel(fx.reportingCurrency)

  return (
    <div className={`rounded-lg border p-4 ${panel}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium">Exchange rates</p>
          <p className={`mt-1 text-xs ${muted}`}>
            Currencies stay separate. Turn on a combined total only after you set how many units equal 1 {reporting}.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={fx.combine}
            onChange={(e) => update({ ...fx, combine: e.target.checked })}
            className="rounded border-gray-500"
          />
          Combine into {reporting}
        </label>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CURRENCY_OPTIONS.filter((item) => item.code !== fx.reportingCurrency).map((item) => (
          <label key={item.code} className={`text-xs ${muted}`}>
            1 {reporting} = {currencyLabel(item.code)}
            <input
              type="number"
              min="0"
              step="0.0001"
              value={fx.unitsPerReporting[item.code] || ''}
              onChange={(e) =>
                update({
                  ...fx,
                  unitsPerReporting: {
                    ...fx.unitsPerReporting,
                    [item.code]: parseFloat(e.target.value) || 0,
                  },
                })
              }
              placeholder="e.g. 28"
              className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${input}`}
            />
          </label>
        ))}
      </div>
    </div>
  )
}
