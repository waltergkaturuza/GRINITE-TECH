'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { projectsAPI, invoicesAPI, usersAPI } from '@/lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend)

type RangeOption = { label: string; windowDays: number }
const RANGE_OPTIONS: RangeOption[] = [
  { label: '7 days', windowDays: 7 },
  { label: '14 days', windowDays: 14 },
  { label: '30 days', windowDays: 30 },
  { label: '3 months', windowDays: 90 },
  { label: '1 year', windowDays: 365 },
]

interface BusinessKpis {
  totalRevenue: number
  activeClients: number
  totalProjects: number
  growthPercent: number
}

interface AnalyticsSummary {
  windowDays: number;
  totalPageViews: number;
  totalEvents: number;
  uniqueSessions: number;
  viewsByDay: Record<string, number>;
  sessionsByDay?: Record<string, number>;
  topPages: { path: string; count: number }[];
  eventsByName: Record<string, number>;
  eventsByDay?: Record<string, number>;
  eventsByDayByName?: Record<string, Record<string, number>>;
  devices?: Record<string, number>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [kpis, setKpis] = useState<BusinessKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeOpen, setRangeOpen] = useState(false)
  const [windowDays, setWindowDays] = useState<number>(14)
  const rangeRef = useRef<HTMLDivElement | null>(null)
  const [eventType, setEventType] = useState<string>('__all__')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [analyticsRes, projectStats, invoiceStats, userStats] = await Promise.allSettled([
          api.get('/analytics/summary', { params: { windowDays } }),
          projectsAPI.getProjectStats(),
          invoicesAPI.getInvoiceStats(),
          usersAPI.getStats(),
        ]);

        if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data?.data) {
          setData(analyticsRes.value.data.data);
        }

        const proj = projectStats.status === 'fulfilled' ? projectStats.value : null;
        const inv = invoiceStats.status === 'fulfilled' ? invoiceStats.value : null;
        const usr = userStats.status === 'fulfilled' ? userStats.value : null;

        setKpis({
          totalRevenue: inv?.total_revenue ?? 0,
          activeClients: usr?.clients ?? usr?.active ?? 0,
          totalProjects: proj?.total ?? 0,
          growthPercent: inv?.monthly_growth ?? 0,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [windowDays]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rangeOpen) return
      const target = e.target as Node | null
      if (!target) return
      if (!rangeRef.current?.contains(target)) setRangeOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRangeOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [rangeOpen])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
      </div>
    );
  }

  const days = useMemo(() => {
    if (!data) return []
    const keys = new Set<string>([
      ...Object.keys(data.viewsByDay || {}),
      ...Object.keys(data.sessionsByDay || {}),
      ...Object.keys(data.eventsByDay || {}),
    ])
    return Array.from(keys).sort()
  }, [data])

  const eventTypes = useMemo(() => {
    const names = Object.keys(data?.eventsByName || {}).sort()
    return ['__all__', ...names]
  }, [data])

  const pageViewsChartData = useMemo(() => {
    const labels = days.map((d) => d.slice(5))
    const pageViews = days.map((d) => data?.viewsByDay?.[d] || 0)
    const sessions = days.map((d) => data?.sessionsByDay?.[d] || 0)
    return {
      labels,
      datasets: [
        {
          label: 'Total',
          data: pageViews,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.12)',
          tension: 0.35,
          pointRadius: 2,
        },
        {
          label: 'Unique Sessions',
          data: sessions,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.10)',
          tension: 0.35,
          pointRadius: 2,
        },
      ],
    }
  }, [data, days])

  const eventsChartData = useMemo(() => {
    const labels = days.map((d) => d.slice(5))
    const series =
      eventType === '__all__'
        ? days.map((d) => data?.eventsByDay?.[d] || 0)
        : days.map((d) => data?.eventsByDayByName?.[eventType]?.[d] || 0)

    return {
      labels,
      datasets: [
        {
          label: 'Events',
          data: series,
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.10)',
          tension: 0.35,
          pointRadius: 2,
        },
      ],
    }
  }, [data, days, eventType])

  const lineOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#cbd5e1' },
        },
        tooltip: {
          enabled: true,
        },
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(148, 163, 184, 0.08)' },
        },
        y: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(148, 163, 184, 0.08)' },
        },
      },
    } as const
  }, [])

  const devices = useMemo(() => {
    const raw = data?.devices || {}
    const normalized = {
      desktop: raw.desktop || 0,
      mobile: raw.mobile || 0,
      tablet: raw.tablet || 0,
      bot: raw.bot || 0,
      other: raw.other || 0,
    }
    const total = Object.values(normalized).reduce((a, b) => a + b, 0) || 0
    return { normalized, total }
  }, [data])

  const devicesChartData = useMemo(() => {
    const labels = ['Desktop', 'Mobile', 'Tablet', 'Bots', 'Other']
    const values = [
      devices.normalized.desktop,
      devices.normalized.mobile,
      devices.normalized.tablet,
      devices.normalized.bot,
      devices.normalized.other,
    ]
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ['#06b6d4', '#f59e0b', '#a78bfa', '#fb7185', '#94a3b8'],
          borderColor: 'rgba(15, 23, 42, 0.6)',
          borderWidth: 2,
        },
      ],
    }
  }, [devices])

  const doughnutOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: { color: '#cbd5e1', boxWidth: 10 },
        },
      },
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="mt-2 text-sm text-gray-300">
            {data
              ? `Last ${data.windowDays} days · ${data.totalPageViews} page views · ${data.uniqueSessions} unique sessions`
              : 'Web analytics summary is unavailable'}
          </p>
          {error && <p className="mt-1 text-sm text-amber-400">{error}</p>}
        </div>

        {/* Range filter (like screenshot) */}
        <div className="relative" ref={rangeRef}>
          <button
            onClick={() => setRangeOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
          >
            <span>{RANGE_OPTIONS.find((o) => o.windowDays === windowDays)?.label ?? `${windowDays} days`}</span>
            <svg className="h-4 w-4 opacity-80" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5.5 7.5L10 12L14.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {rangeOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-granite-800 shadow-xl overflow-hidden z-50">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.windowDays}
                  onClick={() => { setWindowDays(opt.windowDays); setRangeOpen(false) }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    opt.windowDays === windowDays
                      ? 'bg-amber-900/40 text-amber-200'
                      : 'text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Business KPIs - real data from backend */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-blue-100 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-white">
                    ${(kpis?.totalRevenue ?? 0).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-700 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-green-100 truncate">Active Clients</dt>
                  <dd className="text-lg font-medium text-white">{kpis?.activeClients ?? 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-yellow-100 truncate">Projects</dt>
                  <dd className="text-lg font-medium text-white">{kpis?.totalProjects ?? 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-purple-100 truncate">Growth</dt>
                  <dd className="text-lg font-medium text-white">
                    {kpis != null
                      ? `${kpis.growthPercent >= 0 ? '+' : ''}${kpis.growthPercent.toFixed(1)}%`
                      : '—'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page visits & events tracking - from web analytics when available */}
      {data && (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-blue-100 truncate">Total page views</dt>
                  <dd className="text-lg font-medium text-white">{data.totalPageViews}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-emerald-100 truncate">Unique sessions</dt>
                  <dd className="text-lg font-medium text-white">{data.uniqueSessions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-purple-100 truncate">Tracked events</dt>
                  <dd className="text-lg font-medium text-white">{data.totalEvents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Charts (like screenshot) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg leading-6 font-medium text-white">Events</h3>
                <p className="mt-1 text-xs text-slate-300">Page views over time</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">By type</span>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="rounded-lg border border-white/10 bg-granite-900 px-2 py-1 text-xs text-white"
                >
                  <option value="__all__">All</option>
                  {eventTypes
                    .filter((v) => v !== '__all__')
                    .map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                </select>
                <span className="text-xs text-slate-400">{data ? `${data.windowDays} days` : ''}</span>
              </div>
            </div>

            <div className="h-64">
              {days.length === 0 ? (
                <div className="h-full rounded bg-granite-900 flex items-center justify-center">
                  <p className="text-sm text-gray-400">No data yet</p>
                </div>
              ) : (
                <Line data={eventsChartData as any} options={lineOptions as any} />
              )}
            </div>
          </div>
        </div>

        <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg leading-6 font-medium text-white">Page Views</h3>
                <p className="mt-1 text-xs text-slate-300">Total vs unique sessions</p>
              </div>
              <span className="text-xs text-slate-400">{data ? `${data.windowDays} days` : ''}</span>
            </div>

            <div className="h-64">
              {days.length === 0 ? (
                <div className="h-full rounded bg-granite-900 flex items-center justify-center">
                  <p className="text-sm text-gray-400">No data yet</p>
                </div>
              ) : (
                <Line data={pageViewsChartData as any} options={lineOptions as any} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
          <div className="px-4 py-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg leading-6 font-medium text-white">Top pages</h3>
              <span className="text-xs text-slate-400">{data ? `${data.windowDays} days` : ''}</span>
            </div>

            <ul className="divide-y divide-granite-700">
              {data?.topPages?.map((p) => (
                <li key={p.path} className="py-2 flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-200 truncate">{p.path}</span>
                  <span className="text-sm font-medium text-gray-100 tabular-nums">{p.count}</span>
                </li>
              ))}
              {(!data?.topPages || data.topPages.length === 0) && (
                <li className="py-2 text-sm text-gray-400">No page views yet</li>
              )}
            </ul>

            <h3 className="text-lg leading-6 font-medium text-white mt-4">Events (totals)</h3>
            <ul className="divide-y divide-granite-700">
              {data?.eventsByName && Object.entries(data.eventsByName).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                <li key={name} className="py-2 flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-200 truncate">{name}</span>
                  <span className="text-sm font-medium text-gray-100 tabular-nums">{count}</span>
                </li>
              ))}
              {(!data?.eventsByName || Object.keys(data.eventsByName).length === 0) && (
                <li className="py-2 text-sm text-gray-400">No events tracked yet</li>
              )}
            </ul>
          </div>
        </div>

        <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg leading-6 font-medium text-white">Devices</h3>
                <p className="mt-1 text-xs text-slate-300">Browser device types</p>
              </div>
              <span className="text-xs text-slate-400">{data ? `${data.windowDays} days` : ''}</span>
            </div>

            <div className="h-64">
              {devices.total <= 0 ? (
                <div className="h-full rounded bg-granite-900 flex items-center justify-center">
                  <p className="text-sm text-gray-400">No device data yet</p>
                </div>
              ) : (
                <Doughnut data={devicesChartData as any} options={doughnutOptions as any} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}