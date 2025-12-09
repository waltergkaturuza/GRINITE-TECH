'use client'

import { useState } from 'react'
import { PhotoIcon } from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="p-6 bg-gradient-to-br from-granite-800 via-jungle-900 to-crimson-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
        
        {/* Company Information */}
        <div className="bg-granite-800 shadow rounded-lg border border-granite-700 mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-white mb-4">Company Information</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300">Company Name</label>
                <input
                  type="text"
                  defaultValue="Quantis Technologies"
                  className="mt-1 block w-full px-3 py-2 border border-granite-600 rounded-md shadow-sm bg-granite-700 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  defaultValue="admin@quantistech.co.zw"
                  className="mt-1 block w-full px-3 py-2 border border-granite-600 rounded-md shadow-sm bg-granite-700 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300">Address</label>
                <textarea
                  rows={3}
                  defaultValue="123 Tech Street, Innovation City, TC 12345"
                  className="mt-1 block w-full px-3 py-2 border border-granite-600 rounded-md shadow-sm bg-granite-700 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>
            <div className="mt-6">
              <button 
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-800 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 active:bg-green-700 transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-granite-800 shadow rounded-lg border border-granite-700 mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-white mb-4">Company Logo</h3>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-granite-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-900 hover:text-yellow-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
                    <span className="px-2 py-1">Upload a file</span>
                    <input type="file" className="sr-only" accept="image/*" />
                  </label>
                  <p className="pl-1 text-gray-400">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-white mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="email-notifications"
                  name="email-notifications"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-yellow-900 focus:ring-yellow-500 border-granite-600 rounded bg-granite-700"
                />
                <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-300">
                  Email notifications for new project requests
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="sms-notifications"
                  name="sms-notifications"
                  type="checkbox"
                  className="h-4 w-4 text-yellow-900 focus:ring-yellow-500 border-granite-600 rounded bg-granite-700"
                />
                <label htmlFor="sms-notifications" className="ml-2 block text-sm text-gray-300">
                  SMS notifications for urgent requests
                </label>
              </div>
            </div>
            <div className="mt-6">
              <button 
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-800 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 active:bg-green-700 transition-colors duration-200"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}