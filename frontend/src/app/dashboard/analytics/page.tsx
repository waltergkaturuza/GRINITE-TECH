'use client'

import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="mt-2 text-sm text-gray-300">
          Track your business performance and metrics
        </p>
      </div>

      {/* Stats Grid */}
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
                  <dd className="text-lg font-medium text-white">$87,500</dd>
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
                  <dd className="text-lg font-medium text-white">12</dd>
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
                  <dd className="text-lg font-medium text-white">25</dd>
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
                  <dd className="text-lg font-medium text-white">+23%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-white mb-4">Revenue Over Time</h3>
            <div className="h-64 flex items-center justify-center bg-granite-700 rounded">
              <div className="text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-400">Chart coming soon</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-white mb-4">Project Status</h3>
            <div className="h-64 flex items-center justify-center bg-granite-700 rounded">
              <div className="text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-400">Chart coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}