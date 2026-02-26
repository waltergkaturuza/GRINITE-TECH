'use client'

import { useEffect, useState } from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { projectsAPI, invoicesAPI, usersAPI } from '@/lib/api';

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
  topPages: { path: string; count: number }[];
  eventsByName: Record<string, number>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [kpis, setKpis] = useState<BusinessKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [analyticsRes, projectStats, invoiceStats, userStats] = await Promise.allSettled([
          api.get('/analytics/summary'),
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
      </div>
    );
  }

  const days = data ? Object.keys(data.viewsByDay).sort() : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="mt-2 text-sm text-gray-300">
          {data
            ? `Last ${data.windowDays} days · ${data.totalPageViews} page views · ${data.uniqueSessions} unique sessions`
            : 'Web analytics summary is unavailable'}
        </p>
        {error && <p className="mt-1 text-sm text-amber-400">{error}</p>}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-white mb-4">Page views over time</h3>
            <div className="h-64 bg-granite-900 rounded flex items-end space-x-1 px-4 pb-4">
              {days.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-gray-400">No data yet</p>
                </div>
              )}
              {data && days.map((day) => {
                const max = Math.max(...days.map(d => data.viewsByDay[d] || 0)) || 1;
                const value = data.viewsByDay[day] || 0;
                const height = (value / max) * 100;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-crimson-600 to-amber-400 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                    <span className="mt-1 text-[10px] text-gray-400 truncate">
                      {day.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
          <div className="px-4 py-5 sm:p-6 space-y-4">
            <h3 className="text-lg leading-6 font-medium text-white">Top pages</h3>
            <ul className="divide-y divide-granite-700">
              {data?.topPages?.map((p) => (
                <li key={p.path} className="py-2 flex items-center justify-between">
                  <span className="text-sm text-gray-200">{p.path}</span>
                  <span className="text-sm font-medium text-gray-100">{p.count}</span>
                </li>
              ))}
              {(!data?.topPages || data.topPages.length === 0) && (
                <li className="py-2 text-sm text-gray-400">No page views yet</li>
              )}
            </ul>

            <h3 className="text-lg leading-6 font-medium text-white mt-4">Events</h3>
            <ul className="divide-y divide-granite-700">
              {data?.eventsByName && Object.entries(data.eventsByName).map(([name, count]) => (
                <li key={name} className="py-2 flex items-center justify-between">
                  <span className="text-sm text-gray-200">{name}</span>
                  <span className="text-sm font-medium text-gray-100">{count}</span>
                </li>
              ))}
              {(!data?.eventsByName || Object.keys(data.eventsByName).length === 0) && (
                <li className="py-2 text-sm text-gray-400">No events tracked yet</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}