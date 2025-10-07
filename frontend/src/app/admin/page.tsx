'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import { adminAPI, authAPI } from '../../lib/api'
import { 
  ChartBarIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  EyeIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline'

interface AdminData {
  stats: {
    totalRevenue: number
    monthlyRevenue: number
    totalClients: number
    activeProjects: number
    completedProjects: number
    totalProducts: number
    pendingOrders: number
    monthlyGrowth: number
  }
  recentClients: any[]
  recentProjects: any[]
  recentOrders: any[]
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication and admin role
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    
    loadAdminData()
  }, [router])

  const loadAdminData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Verify admin role first
      const userProfile = await authAPI.getProfile()
      if (userProfile.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      // Load admin dashboard data
      const dashboardData = await adminAPI.getDashboardData()
      setAdminData(dashboardData)
      
    } catch (error) {
      console.error('Error loading admin data:', error)
      setError('Failed to load admin dashboard data')
      
      // Fallback to individual API calls if dashboard endpoint doesn't exist
      try {
        const [stats, recentClients, recentProjects, recentOrders] = await Promise.all([
          adminAPI.getStats().catch(() => ({
            totalRevenue: 0,
            monthlyRevenue: 0,
            totalClients: 0,
            activeProjects: 0,
            completedProjects: 0,
            totalProducts: 0,
            pendingOrders: 0,
            monthlyGrowth: 0
          })),
          adminAPI.getRecentClients(5).catch(() => []),
          adminAPI.getRecentProjects(5).catch(() => []),
          adminAPI.getRecentOrders(5).catch(() => [])
        ])
        
        setAdminData({
          stats,
          recentClients,
          recentProjects,
          recentOrders
        })
        setError(null)
      } catch (fallbackError) {
        setError('Unable to load admin data. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in progress':
        return 'bg-blue-100 text-blue-800'
      case 'planning':
        return 'bg-amber-200 text-amber-900'
      case 'review':
        return 'bg-purple-100 text-purple-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-amber-200 text-amber-900'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-granite-100 text-granite-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'in progress':
      case 'processing':
        return <ClockIcon className="h-4 w-4" />
      case 'pending':
      case 'planning':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
        <Navigation />
        <div className="wide-container px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crimson-900 mx-auto"></div>
            <p className="mt-4 text-granite-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !adminData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
        <Navigation />
        <div className="wide-container px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Admin Data</h3>
              <p className="text-red-600 mb-4">{error || 'Failed to load dashboard data'}</p>
              <button 
                onClick={loadAdminData}
                className="bg-crimson-900 text-white px-4 py-2 rounded-lg hover:bg-crimson-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
      <Navigation />

      <div className="wide-container px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-granite-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-granite-600">Manage your business operations and monitor performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-granite-600">Total Revenue</p>
                <p className="text-2xl font-bold text-granite-800">${adminData.stats.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+{adminData.stats.monthlyGrowth}%</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-granite-600">Total Clients</p>
                <p className="text-2xl font-bold text-granite-800">{adminData.stats.totalClients}</p>
                <p className="text-sm text-granite-500 mt-2">Active clients</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-granite-600">Active Projects</p>
                <p className="text-2xl font-bold text-granite-800">{adminData.stats.activeProjects}</p>
                <p className="text-sm text-granite-500 mt-2">{adminData.stats.completedProjects} completed</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BriefcaseIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-granite-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-granite-800">${adminData.stats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-sm text-granite-500 mt-2">This month</p>
              </div>
              <div className="bg-crimson-100 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-crimson-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-granite-200 mb-8">
          <div className="border-b border-granite-200 px-6 py-4">
            <div className="flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                { id: 'tracking', name: 'Project Tracking', icon: PresentationChartLineIcon },
                { id: 'clients', name: 'Clients', icon: UserGroupIcon },
                { id: 'projects', name: 'Projects', icon: BriefcaseIcon },
                { id: 'orders', name: 'Orders', icon: ShoppingCartIcon },
                { id: 'settings', name: 'Settings', icon: CogIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 border-b-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-crimson-600 text-crimson-600'
                      : 'border-transparent text-granite-500 hover:text-granite-700'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Projects */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-granite-800">Recent Projects</h3>
                      <button className="text-crimson-600 hover:text-crimson-700 text-sm font-medium">
                        View All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {adminData.recentProjects.slice(0, 5).map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 border border-granite-200 rounded-lg hover:bg-granite-50 transition-colors duration-200">
                          <div className="flex-1">
                            <h4 className="font-medium text-granite-800">{project.name}</h4>
                            <p className="text-sm text-granite-500">{project.client}</p>
                            <div className="w-full bg-granite-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-crimson-600 h-2 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(project.status)}`}>
                              {getStatusIcon(project.status)}
                              <span className="ml-1">{project.status}</span>
                            </span>
                            <p className="text-sm font-medium text-granite-800 mt-1">${project.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-granite-800">Recent Orders</h3>
                      <button className="text-crimson-600 hover:text-crimson-700 text-sm font-medium">
                        View All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {adminData.recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border border-granite-200 rounded-lg hover:bg-granite-50 transition-colors duration-200">
                          <div className="flex-1">
                            <h4 className="font-medium text-granite-800">{order.product}</h4>
                            <p className="text-sm text-granite-500">{order.client}</p>
                            <p className="text-xs text-granite-400">{new Date(order.date).toLocaleDateString()}</p>
                          </div>
                          <div className="ml-4 text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </span>
                            <p className="text-sm font-medium text-granite-800 mt-1">${order.amount.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Project Tracking Tab */}
            {activeTab === 'tracking' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-granite-800">Project Tracking Overview</h3>
                    <p className="text-granite-600 text-sm">Monitor progress across all your projects with milestones, modules, and features</p>
                  </div>
                  <div className="flex space-x-3">
                    <Link 
                      href="/admin/tracking"
                      className="bg-crimson-600 hover:bg-crimson-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
                    >
                      <PresentationChartLineIcon className="h-5 w-5 mr-2" />
                      View All Tracking
                    </Link>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-600 font-medium">Active Projects</p>
                        <p className="text-2xl font-bold text-blue-800">{adminData.stats.activeProjects}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-600 font-medium">Completed Projects</p>
                        <p className="text-2xl font-bold text-green-800">{adminData.stats.completedProjects}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <PresentationChartLineIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-purple-600 font-medium">Avg Progress</p>
                        <p className="text-2xl font-bold text-purple-800">
                          {adminData.stats.activeProjects > 0 ? 
                            Math.round((adminData.stats.completedProjects / (adminData.stats.activeProjects + adminData.stats.completedProjects)) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Projects with Tracking */}
                <div>
                  <h4 className="text-md font-semibold text-granite-800 mb-4">Recent Projects - Tracking Status</h4>
                  <div className="space-y-3">
                    {adminData.recentProjects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 border border-granite-200 rounded-lg hover:bg-granite-50 transition-colors duration-200">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-granite-800">{project.name}</h5>
                            <Link 
                              href={`/admin/projects/${project.id}/tracking`}
                              className="text-crimson-600 hover:text-crimson-700 text-sm font-medium"
                            >
                              View Tracking →
                            </Link>
                          </div>
                          <p className="text-sm text-granite-500 mb-2">{project.client}</p>
                          <div className="w-full bg-granite-200 rounded-full h-2">
                            <div
                              className="bg-crimson-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-2 text-sm text-granite-600">
                            <span>{project.progress}% Complete</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Link 
                      href="/admin/tracking"
                      className="text-crimson-600 hover:text-crimson-700 font-medium"
                    >
                      View all project tracking →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Clients Tab */}
            {activeTab === 'clients' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-granite-800">Client Management</h3>
                  <button className="bg-crimson-600 hover:bg-crimson-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Client
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-granite-200">
                        <th className="text-left py-3 px-2 font-medium text-granite-700">Client</th>
                        <th className="text-left py-3 px-2 font-medium text-granite-700">Email</th>
                        <th className="text-left py-3 px-2 font-medium text-granite-700">Projects</th>
                        <th className="text-left py-3 px-2 font-medium text-granite-700">Status</th>
                        <th className="text-left py-3 px-2 font-medium text-granite-700">Joined</th>
                        <th className="text-left py-3 px-2 font-medium text-granite-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminData.recentClients.map((client) => (
                        <tr key={client.id} className="border-b border-granite-100 hover:bg-granite-50">
                          <td className="py-3 px-2">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-crimson-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {client.name.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                              <span className="ml-3 font-medium text-granite-800">{client.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-granite-600">{client.email}</td>
                          <td className="py-3 px-2 text-granite-600">{client.projects}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                              {client.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-granite-600">{new Date(client.joinDate).toLocaleDateString()}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-granite-500 hover:text-granite-700 transition-colors duration-200">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-granite-500 hover:text-granite-700 transition-colors duration-200">
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-red-500 hover:text-red-700 transition-colors duration-200">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-granite-800">Project Management</h3>
                  <button className="bg-crimson-600 hover:bg-crimson-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Project
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {adminData.recentProjects.map((project) => (
                    <div key={project.id} className="border border-granite-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-granite-800">{project.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-sm text-granite-600 mb-3">{project.client}</p>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-granite-600 mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-granite-200 rounded-full h-2">
                          <div
                            className="bg-crimson-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-granite-600">Revenue: ${project.revenue.toLocaleString()}</span>
                        <span className="text-granite-600">Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-granite-800">Order Management</h3>
                  <div className="flex items-center space-x-4">
                    <select className="px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500">
                      <option>All Orders</option>
                      <option>Pending</option>
                      <option>Processing</option>
                      <option>Completed</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-granite-200">
                        <th className="text-left py-3 px-2 font-medium text-granite-700">Order ID</th>
                        <th className="text-left py-3 px-2 font-medium text-granite-700">Client</th>
                        <th className="text-left py-3 px-2 font-medium text-granite-700">Product</th>
                        <th className="text-left py-3 px-2 font-medium text-granite-700">Amount</th>
                        <th className="text-left py-3 px-2 font-medium text-granite-700">Status</th>
                        <th className="text-left py-3 px-2 font-medium text-granite-700">Date</th>
                        <th className="text-left py-3 px-2 font-medium text-granite-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminData.recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-granite-100 hover:bg-granite-50">
                          <td className="py-3 px-2 font-medium text-granite-800">#{order.id.padStart(4, '0')}</td>
                          <td className="py-3 px-2 text-granite-600">{order.client}</td>
                          <td className="py-3 px-2 text-granite-600">{order.product}</td>
                          <td className="py-3 px-2 font-medium text-granite-800">${order.amount.toLocaleString()}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-granite-600">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-granite-500 hover:text-granite-700 transition-colors duration-200">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-granite-500 hover:text-granite-700 transition-colors duration-200">
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold text-granite-800 mb-6">Admin Settings</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="border border-granite-200 rounded-lg p-4">
                      <h4 className="font-medium text-granite-800 mb-4">System Settings</h4>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="rounded border-granite-300 text-crimson-600 focus:ring-crimson-500" />
                          <span className="ml-2 text-sm text-granite-700">Email notifications</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="rounded border-granite-300 text-crimson-600 focus:ring-crimson-500" />
                          <span className="ml-2 text-sm text-granite-700">SMS notifications</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-granite-300 text-crimson-600 focus:ring-crimson-500" />
                          <span className="ml-2 text-sm text-granite-700">Maintenance mode</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="border border-granite-200 rounded-lg p-4">
                      <h4 className="font-medium text-granite-800 mb-4">Security</h4>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="rounded border-granite-300 text-crimson-600 focus:ring-crimson-500" />
                          <span className="ml-2 text-sm text-granite-700">Two-factor authentication</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="rounded border-granite-300 text-crimson-600 focus:ring-crimson-500" />
                          <span className="ml-2 text-sm text-granite-700">Session timeout</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-granite-300 text-crimson-600 focus:ring-crimson-500" />
                          <span className="ml-2 text-sm text-granite-700">IP restrictions</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="border border-granite-200 rounded-lg p-4">
                      <h4 className="font-medium text-granite-800 mb-4">Business Settings</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-granite-700 mb-1">Tax Rate (%)</label>
                          <input
                            type="number"
                            defaultValue="8"
                            className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-granite-700 mb-1">Currency</label>
                          <select className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500">
                            <option>USD - US Dollar</option>
                            <option>EUR - Euro</option>
                            <option>GBP - British Pound</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-granite-200 rounded-lg p-4">
                      <h4 className="font-medium text-granite-800 mb-4">Data Management</h4>
                      <div className="space-y-3">
                        <button 
                          onClick={() => router.push('/admin/services')}
                          className="w-full text-left px-3 py-2 border border-granite-300 rounded-lg hover:bg-granite-50 transition-colors duration-200"
                        >
                          Manage Services
                        </button>
                        <button className="w-full text-left px-3 py-2 border border-granite-300 rounded-lg hover:bg-granite-50 transition-colors duration-200">
                          Export Client Data
                        </button>
                        <button className="w-full text-left px-3 py-2 border border-granite-300 rounded-lg hover:bg-granite-50 transition-colors duration-200">
                          Export Project Data
                        </button>
                        <button className="w-full text-left px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-red-600 transition-colors duration-200">
                          Clear Cache
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}