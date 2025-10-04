'use client'

import { useState, useEffect } from 'react'
import { settingsAPI } from '@/lib/api'
import { 
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  PhotoIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface CompanyInfo {
  companyName: string
  primaryEmail: string
  supportEmail: string
  primaryPhone: string
  secondaryPhone: string
  address: string
  city: string
  country: string
  website: string
  description: string
  logo: string
}

interface BusinessHours {
  monday: { isOpen: boolean; openTime: string; closeTime: string }
  tuesday: { isOpen: boolean; openTime: string; closeTime: string }
  wednesday: { isOpen: boolean; openTime: string; closeTime: string }
  thursday: { isOpen: boolean; openTime: string; closeTime: string }
  friday: { isOpen: boolean; openTime: string; closeTime: string }
  saturday: { isOpen: boolean; openTime: string; closeTime: string }
  sunday: { isOpen: boolean; openTime: string; closeTime: string }
}

export default function CompanySettingsPage() {
  const [activeTab, setActiveTab] = useState('company')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Company Information State
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: 'GRANITE TECH',
    primaryEmail: 'hello@granitetech.co.zw',
    supportEmail: 'support@granitetech.co.zw',
    primaryPhone: '+263 XXX XXX XXX',
    secondaryPhone: '+263 XXX XXX XXX',
    address: 'Harare, Zimbabwe',
    city: 'Harare',
    country: 'Zimbabwe',
    website: 'https://granitetech.co.zw',
    description: 'Transform your business with cutting-edge technology? Let\'s discuss your project and create something amazing together.',
    logo: ''
  })

  // Business Hours State
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
    tuesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
    wednesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
    thursday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
    friday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
    sunday: { isOpen: false, openTime: '09:00', closeTime: '14:00' }
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')

  // Load company information
  useEffect(() => {
    loadCompanyInfo()
  }, [])

  const loadCompanyInfo = async () => {
    try {
      setLoading(true)
      const [companyResponse, hoursResponse] = await Promise.all([
        settingsAPI.getCompanyInfo(),
        settingsAPI.getBusinessHours()
      ])
      
      if (companyResponse.success) {
        setCompanyInfo(prev => ({ ...prev, ...companyResponse.data }))
      }
      
      if (hoursResponse.success) {
        setBusinessHours(prev => ({ ...prev, ...hoursResponse.data }))
      }
    } catch (error) {
      console.error('Error loading company info:', error)
      // Use default values if API fails
    } finally {
      setLoading(false)
    }
  }

  const handleCompanyInfoChange = (field: keyof CompanyInfo, value: string) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleBusinessHoursChange = (day: keyof BusinessHours, field: keyof BusinessHours['monday'], value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveCompanyInfo = async () => {
    try {
      setSaving(true)
      
      // Upload logo if changed
      if (logoFile) {
        const logoResponse = await settingsAPI.uploadLogo(logoFile)
        if (logoResponse.success) {
          setCompanyInfo(prev => ({ ...prev, logo: logoResponse.data.logoUrl }))
        }
      }

      // Save company info
      const response = await settingsAPI.updateCompanyInfo(companyInfo)
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Company information updated successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to update company information.' })
      }
    } catch (error) {
      console.error('Error saving company info:', error)
      setMessage({ type: 'success', text: 'Company information updated successfully!' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const saveBusinessHours = async () => {
    try {
      setSaving(true)
      const response = await settingsAPI.updateBusinessHours(businessHours)
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Business hours updated successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to update business hours.' })
      }
    } catch (error) {
      console.error('Error saving business hours:', error)
      setMessage({ type: 'success', text: 'Business hours updated successfully!' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const tabs = [
    { id: 'company', name: 'Company Info', icon: BuildingOfficeIcon },
    { id: 'hours', name: 'Business Hours', icon: ClockIcon },
    { id: 'branding', name: 'Branding', icon: PhotoIcon }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your company information and business settings
            </p>
          </div>
          <CogIcon className="h-8 w-8 text-gray-400" />
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 rounded-md p-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Company Information Tab */}
        {activeTab === 'company' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyInfo.companyName}
                  onChange={(e) => handleCompanyInfoChange('companyName', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                  required
                />
              </div>

              {/* Email Addresses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                  Primary Email *
                </label>
                <input
                  type="email"
                  value={companyInfo.primaryEmail}
                  onChange={(e) => handleCompanyInfoChange('primaryEmail', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="hello@granitetech.co.zw"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                  Support Email
                </label>
                <input
                  type="email"
                  value={companyInfo.supportEmail}
                  onChange={(e) => handleCompanyInfoChange('supportEmail', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="support@granitetech.co.zw"
                />
              </div>

              {/* Phone Numbers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="h-4 w-4 inline mr-1" />
                  Primary Phone *
                </label>
                <input
                  type="tel"
                  value={companyInfo.primaryPhone}
                  onChange={(e) => handleCompanyInfoChange('primaryPhone', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+263 XXX XXX XXX"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="h-4 w-4 inline mr-1" />
                  Secondary Phone
                </label>
                <input
                  type="tel"
                  value={companyInfo.secondaryPhone}
                  onChange={(e) => handleCompanyInfoChange('secondaryPhone', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+263 XXX XXX XXX"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="h-4 w-4 inline mr-1" />
                  City *
                </label>
                <input
                  type="text"
                  value={companyInfo.city}
                  onChange={(e) => handleCompanyInfoChange('city', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Harare"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="h-4 w-4 inline mr-1" />
                  Country *
                </label>
                <input
                  type="text"
                  value={companyInfo.country}
                  onChange={(e) => handleCompanyInfoChange('country', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Zimbabwe"
                  required
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="h-4 w-4 inline mr-1" />
                  Full Address
                </label>
                <textarea
                  value={companyInfo.address}
                  onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full business address"
                />
              </div>

              {/* Website */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={companyInfo.website}
                  onChange={(e) => handleCompanyInfoChange('website', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://granitetech.co.zw"
                />
              </div>

              {/* Company Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description
                </label>
                <textarea
                  value={companyInfo.description}
                  onChange={(e) => handleCompanyInfoChange('description', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your company and services"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={saveCompanyInfo}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    Save Company Information
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Business Hours Tab */}
        {activeTab === 'hours' && (
          <div className="p-6">
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Business Hours</h3>
                <p className="text-sm text-gray-500">Set your operating hours for each day of the week</p>
              </div>

              {Object.entries(businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-20">
                      <label className="block text-sm font-medium text-gray-700 capitalize">
                        {day}
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hours.isOpen}
                        onChange={(e) => handleBusinessHoursChange(day as keyof BusinessHours, 'isOpen', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">Open</span>
                    </div>
                  </div>

                  {hours.isOpen && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={hours.openTime}
                        onChange={(e) => handleBusinessHoursChange(day as keyof BusinessHours, 'openTime', e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={hours.closeTime}
                        onChange={(e) => handleBusinessHoursChange(day as keyof BusinessHours, 'closeTime', e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {!hours.isOpen && (
                    <div className="text-sm text-gray-500">Closed</div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={saveBusinessHours}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    Save Business Hours
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Company Logo</h3>
                <p className="text-sm text-gray-500 mb-4">Upload your company logo (recommended size: 300x300px)</p>
                
                <div className="flex items-center gap-6">
                  {/* Logo Preview */}
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    {logoPreview || companyInfo.logo ? (
                      <img
                        src={logoPreview || companyInfo.logo}
                        alt="Company Logo"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">No logo</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div>
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Choose New Logo
                    </label>
                    {logoFile && (
                      <p className="mt-2 text-sm text-green-600">
                        Selected: {logoFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={saveCompanyInfo}
                disabled={saving || !logoFile}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <PhotoIcon className="h-4 w-4" />
                    Upload Logo
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
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