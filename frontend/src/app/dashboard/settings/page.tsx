'use client'

import { useState } from 'react'
import { 
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-sm text-gray-300">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="h-5 w-5 text-yellow-400 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-white">Profile Settings</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300">First Name</label>
                <input
                  type="text"
                  defaultValue="Admin"
                  className="mt-1 block w-full px-3 py-2 border border-granite-600 rounded-md shadow-sm bg-granite-700 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Last Name</label>
                <input
                  type="text"
                  defaultValue="User"
                  className="mt-1 block w-full px-3 py-2 border border-granite-600 rounded-md shadow-sm bg-granite-700 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  defaultValue="admin@granitetech.com"
                  className="mt-1 block w-full px-3 py-2 border border-granite-600 rounded-md shadow-sm bg-granite-700 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>
            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-900 hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <BellIcon className="h-5 w-5 text-yellow-400 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-white">Notification Preferences</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Email Notifications</p>
                  <p className="text-sm text-gray-400">Receive notifications via email</p>
                </div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                    notifications.email ? 'bg-yellow-600' : 'bg-gray-700'
                  }`}
                  onClick={() => setNotifications(prev => ({...prev, email: !prev.email}))}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.email ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Push Notifications</p>
                  <p className="text-sm text-gray-400">Receive push notifications</p>
                </div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                    notifications.push ? 'bg-yellow-600' : 'bg-gray-700'
                  }`}
                  onClick={() => setNotifications(prev => ({...prev, push: !prev.push}))}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.push ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <ShieldCheckIcon className="h-5 w-5 text-yellow-400 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-white">Security</h3>
            </div>
            <div className="space-y-4">
              <div>
                <button className="inline-flex items-center px-4 py-2 border border-granite-600 rounded-md shadow-sm text-sm font-medium text-white bg-granite-700 hover:bg-granite-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                  Change Password
                </button>
              </div>
              <div>
                <button className="inline-flex items-center px-4 py-2 border border-granite-600 rounded-md shadow-sm text-sm font-medium text-white bg-granite-700 hover:bg-granite-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                  Enable Two-Factor Authentication
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}