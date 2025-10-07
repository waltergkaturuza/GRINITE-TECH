import axios from 'axios'

const api = axios.create({ 
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://grinite-tech.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },
  updateProfile: async (userData: any) => {
    const response = await api.put('/auth/profile', userData)
    return response.data
  },
  changePassword: async (passwordData: any) => {
    const response = await api.put('/auth/change-password', passwordData)
    return response.data
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },
  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password })
    return response.data
  },
  logout: async () => {
    const response = await api.post('/auth/logout')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    return response.data
  },
  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    return response.data
  },
}

export const usersAPI = {
  getUsers: async (params?: any) => {
    const response = await api.get('/users', { params })
    return response.data
  },
  getUser: async (id: string) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },
  createUser: async (userData: any) => {
    const response = await api.post('/users', userData)
    return response.data
  },
  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },
  // Legacy methods for backward compatibility
  getAll: async () => {
    const response = await api.get('/users')
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },
  create: async (userData: any) => {
    const response = await api.post('/users', userData)
    return response.data
  },
  update: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },
}

export const projectsAPI = {
  getProjects: async (params?: {
    page?: number
    limit?: number
    status?: string
    type?: string
    clientId?: string
    search?: string
  }) => {
    const response = await api.get('/projects', { params })
    return response.data
  },
  getProject: async (id: string) => {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },
  createProject: async (projectData: {
    title: string
    description?: string
    type: string
    status?: string
    budget?: number
    startDate?: string
    endDate?: string
    estimatedHours?: number
    clientId?: string
  }) => {
    const response = await api.post('/projects', projectData)
    return response.data
  },
  updateProject: async (id: string, projectData: Partial<{
    title: string
    description: string
    type: string
    status: string
    budget: number
    startDate: string
    endDate: string
    estimatedHours: number
    actualHours: number
    completionPercentage: number
    clientId: string
  }>) => {
    const response = await api.patch(`/projects/${id}`, projectData)
    return response.data
  },
  deleteProject: async (id: string) => {
    const response = await api.delete(`/projects/${id}`)
    return response.data
  },
  getProjectStats: async () => {
    const response = await api.get('/projects/stats')
    return response.data
  },
  getProjectsByStatus: async (status: string) => {
    const response = await api.get(`/projects/status/${status}`)
    return response.data
  },
  // Legacy methods for backward compatibility
  getAll: async () => {
    const response = await api.get('/projects')
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },
  create: async (projectData: any) => {
    const response = await api.post('/projects', projectData)
    return response.data
  },
  update: async (id: string, projectData: any) => {
    const response = await api.put(`/projects/${id}`, projectData)
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`)
    return response.data
  },
}

export const productsAPI = {
  getProducts: async (params?: {
    page?: number
    limit?: number
    category?: string
    featured?: boolean
    inStock?: boolean
    search?: string
  }) => {
    const response = await api.get('/products', { params })
    return response.data
  },
  getProduct: async (id: string) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },
  createProduct: async (productData: {
    name: string
    description?: string
    shortDescription?: string
    price: number
    category: string
    images?: string[]
    videos?: string[]
    gifs?: string[]
    specifications?: any
    features?: string[]
    technologies?: string[]
    advantages?: string[]
    functionalities?: string[]
    costBreakdown?: any
    timeline?: any
    teamSize?: number
    complexity?: string
    deliverables?: string[]
    supportIncluded?: boolean
    warrantyMonths?: number
    inStock?: boolean
    featured?: boolean
    demoUrl?: string
    caseStudies?: any[]
    testimonials?: any[]
  }) => {
    const response = await api.post('/products', productData)
    return response.data
  },
  updateProduct: async (id: string, productData: any) => {
    const response = await api.patch(`/products/${id}`, productData)
    return response.data
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },
  uploadMedia: async (id: string, files: File[], type: 'images' | 'videos' | 'gifs') => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    formData.append('type', type)
    
    const response = await api.post(`/products/${id}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  // Legacy methods for backward compatibility
  getAll: async () => {
    const response = await api.get('/products')
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },
  create: async (productData: any) => {
    const response = await api.post('/products', productData)
    return response.data
  },
  update: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },
}

export const chatAPI = {
  getSessions: async (userId?: string) => {
    const response = await api.get('/chat/sessions', { params: { userId } })
    return response.data
  },
  getSession: async (id: string) => {
    const response = await api.get(`/chat/sessions/${id}`)
    return response.data
  },
  createSession: async (sessionData: {
    sessionId: string
    userId?: string
    messages: any[]
    metadata?: Record<string, any>
  }) => {
    const response = await api.post('/chat/sessions', sessionData)
    return response.data
  },
  updateSession: async (id: string, sessionData: any) => {
    const response = await api.patch(`/chat/sessions/${id}`, sessionData)
    return response.data
  },
  deleteSession: async (id: string) => {
    const response = await api.delete(`/chat/sessions/${id}`)
    return response.data
  },
  addMessage: async (sessionId: string, messageData: any) => {
    const response = await api.post(`/chat/sessions/${sessionId}/messages`, messageData)
    return response.data
  },
  createFeedback: async (feedbackData: {
    messageId: string
    sessionId?: string
    userId?: string
    rating: number
    comment?: string
    metadata?: Record<string, any>
  }) => {
    const response = await api.post('/chat/feedback', feedbackData)
    return response.data
  },
  getFeedback: async (sessionId?: string, userId?: string) => {
    const response = await api.get('/chat/feedback', { params: { sessionId, userId } })
    return response.data
  },
  getAnalytics: async () => {
    const response = await api.get('/chat/analytics')
    return response.data
  },
}

export const requestsAPI = {
  submitRequest: async (requestData: any, files?: File[]) => {
    const formData = new FormData()
    
    Object.keys(requestData).forEach(key => {
      if (requestData[key] !== null && requestData[key] !== undefined) {
        formData.append(key, requestData[key])
      }
    })
    
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file)
      })
    }
    
    const response = await api.post('/requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  getRequests: async (params?: {
    page?: number
    limit?: number
    status?: string
    type?: string
    email?: string
    search?: string
  }) => {
    const response = await api.get('/requests', { params })
    return response.data
  },
  getRequest: async (id: string) => {
    const response = await api.get(`/requests/${id}`)
    return response.data
  },
  getRequestsByEmail: async (email: string) => {
    const response = await api.get(`/requests/by-email/${email}`)
    return response.data
  },
  updateRequest: async (id: string, updateData: any) => {
    const response = await api.patch(`/requests/${id}`, updateData)
    return response.data
  },
  deleteRequest: async (id: string) => {
    const response = await api.delete(`/requests/${id}`)
    return response.data
  },
  addMessage: async (requestId: string, messageData: any, attachments?: File[]) => {
    const formData = new FormData()
    
    Object.keys(messageData).forEach(key => {
      if (messageData[key] !== null && messageData[key] !== undefined) {
        formData.append(key, messageData[key])
      }
    })
    
    if (attachments && attachments.length > 0) {
      attachments.forEach(file => {
        formData.append('attachments', file)
      })
    }
    
    const response = await api.post(`/requests/${requestId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  getMessages: async (requestId: string) => {
    const response = await api.get(`/requests/${requestId}/messages`)
    return response.data
  },
  getStats: async () => {
    const response = await api.get('/requests/stats')
    return response.data
  },
}

export const servicesAPI = {
  getServices: async (params?: any) => {
    const response = await api.get('/services', { params })
    return response.data
  },
  getService: async (id: string) => {
    const response = await api.get(`/services/${id}`)
    return response.data
  },
  createService: async (serviceData: any) => {
    const response = await api.post('/services', serviceData)
    return response.data
  },
  updateService: async (id: string, serviceData: any) => {
    const response = await api.patch(`/services/${id}`, serviceData)
    return response.data
  },
  deleteService: async (id: string) => {
    const response = await api.delete(`/services/${id}`)
    return response.data
  },
  // Legacy methods for backward compatibility
  getAll: async () => {
    const response = await api.get('/services')
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get(`/services/${id}`)
    return response.data
  },
  create: async (serviceData: any) => {
    const response = await api.post('/services', serviceData)
    return response.data
  },
  update: async (id: string, serviceData: any) => {
    const response = await api.put(`/services/${id}`, serviceData)
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`/services/${id}`)
    return response.data
  },
}

export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },
  getRecentActivity: async () => {
    const response = await api.get('/dashboard/activity')
    return response.data
  },
  getNotifications: async () => {
    const response = await api.get('/dashboard/notifications')
    return response.data
  },
  markNotificationRead: async (id: string) => {
    const response = await api.patch(`/dashboard/notifications/${id}/read`)
    return response.data
  },
}

export const invoicesAPI = {
  getInvoices: async (params?: {
    page?: number
    limit?: number
    status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  }) => {
    const response = await api.get('/invoices', { params })
    return response.data
  },
  getInvoice: async (id: number) => {
    const response = await api.get(`/invoices/${id}`)
    return response.data
  },
  createInvoice: async (invoiceData: {
    client_id: string
    issue_date: string
    due_date: string
    payment_terms?: 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'due_on_receipt'
    tax_rate?: number
    discount_amount?: number
    notes?: string
    terms_conditions?: string
    billing_address?: string
    billing_email?: string
    billing_phone?: string
    items: Array<{
      description: string
      quantity: number
      unit_price: number
      tax_rate?: number
    }>
  }) => {
    const response = await api.post('/invoices', invoiceData)
    return response.data
  },
  updateInvoice: async (id: number, invoiceData: any) => {
    const response = await api.patch(`/invoices/${id}`, invoiceData)
    return response.data
  },
  updateInvoiceStatus: async (id: number, statusData: {
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
    payment_date?: string
    payment_method?: string
    payment_reference?: string
  }) => {
    const response = await api.patch(`/invoices/${id}/status`, statusData)
    return response.data
  },
  deleteInvoice: async (id: number) => {
    const response = await api.delete(`/invoices/${id}`)
    return response.data
  },
  sendInvoice: async (id: number) => {
    const response = await api.post(`/invoices/${id}/send`)
    return response.data
  },
  duplicateInvoice: async (id: number) => {
    const response = await api.post(`/invoices/${id}/duplicate`)
    return response.data
  },
  getInvoiceStats: async () => {
    const response = await api.get('/invoices/stats')
    return response.data
  },
}

export const adminAPI = {
  getStats: async () => {
    const response = await api.get('/admin/stats')
    return response.data
  },
  getRecentClients: async (limit = 5) => {
    const response = await api.get(`/admin/recent-clients?limit=${limit}`)
    return response.data
  },
  getRecentProjects: async (limit = 5) => {
    const response = await api.get(`/admin/recent-projects?limit=${limit}`)
    return response.data
  },
  getRecentOrders: async (limit = 5) => {
    const response = await api.get(`/admin/recent-orders?limit=${limit}`)
    return response.data
  },
  getDashboardData: async () => {
    const response = await api.get('/admin/dashboard')
    return response.data
  },
  getSystemHealth: async () => {
    const response = await api.get('/admin/health')
    return response.data
  },
}

export const cartAPI = {
  getCart: async () => {
    const response = await api.get('/cart')
    return response.data
  },
  addItem: async (productId: string, quantity: number = 1) => {
    const response = await api.post('/cart/items', { productId, quantity })
    return response.data
  },
  updateItem: async (itemId: string, quantity: number) => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity })
    return response.data
  },
  removeItem: async (itemId: string) => {
    const response = await api.delete(`/cart/items/${itemId}`)
    return response.data
  },
  clearCart: async () => {
    const response = await api.delete('/cart')
    return response.data
  },
}

export const ordersAPI = {
  createOrder: async (orderData: any) => {
    const response = await api.post('/orders', orderData)
    return response.data
  },
  getOrders: async (params?: any) => {
    const response = await api.get('/orders', { params })
    return response.data
  },
  getOrder: async (id: string) => {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },
  updateOrder: async (id: string, orderData: any) => {
    const response = await api.put(`/orders/${id}`, orderData)
    return response.data
  },
  cancelOrder: async (id: string) => {
    const response = await api.delete(`/orders/${id}`)
    return response.data
  },
}

// Project Tracking API
export const milestonesAPI = {
  getMilestones: async (projectId?: string) => {
    const params = projectId ? { projectId } : {}
    const response = await api.get('/milestones', { params })
    return response.data
  },
  getMilestone: async (id: string) => {
    const response = await api.get(`/milestones/${id}`)
    return response.data
  },
  createMilestone: async (milestoneData: {
    name: string
    description?: string
    projectId: string
    status?: string
    orderIndex?: number
    dueDate?: string
    estimatedHours?: number
  }) => {
    const response = await api.post('/milestones', milestoneData)
    return response.data
  },
  updateMilestone: async (id: string, milestoneData: any) => {
    const response = await api.patch(`/milestones/${id}`, milestoneData)
    return response.data
  },
  deleteMilestone: async (id: string) => {
    const response = await api.delete(`/milestones/${id}`)
    return response.data
  },
  updateProgress: async (id: string) => {
    const response = await api.patch(`/milestones/${id}/progress`)
    return response.data
  }
}

export const modulesAPI = {
  getModules: async (milestoneId?: string) => {
    const params = milestoneId ? { milestoneId } : {}
    const response = await api.get('/modules', { params })
    return response.data
  },
  getModule: async (id: string) => {
    const response = await api.get(`/modules/${id}`)
    return response.data
  },
  createModule: async (moduleData: {
    name: string
    description?: string
    milestoneId: string
    status?: string
    orderIndex?: number
    estimatedHours?: number
  }) => {
    const response = await api.post('/modules', moduleData)
    return response.data
  },
  updateModule: async (id: string, moduleData: any) => {
    const response = await api.patch(`/modules/${id}`, moduleData)
    return response.data
  },
  deleteModule: async (id: string) => {
    const response = await api.delete(`/modules/${id}`)
    return response.data
  },
  updateProgress: async (id: string) => {
    const response = await api.patch(`/modules/${id}/progress`)
    return response.data
  }
}

export const featuresAPI = {
  getFeatures: async (moduleId?: string) => {
    const params = moduleId ? { moduleId } : {}
    const response = await api.get('/features', { params })
    return response.data
  },
  getFeature: async (id: string) => {
    const response = await api.get(`/features/${id}`)
    return response.data
  },
  createFeature: async (featureData: {
    name: string
    description?: string
    moduleId: string
    status?: string
    priority?: string
    orderIndex?: number
    estimatedHours?: number
    notes?: string
  }) => {
    const response = await api.post('/features', featureData)
    return response.data
  },
  updateFeature: async (id: string, featureData: any) => {
    const response = await api.patch(`/features/${id}`, featureData)
    return response.data
  },
  deleteFeature: async (id: string) => {
    const response = await api.delete(`/features/${id}`)
    return response.data
  },
  toggleFeature: async (id: string, isCompleted: boolean) => {
    const response = await api.patch(`/features/${id}/toggle`, { isCompleted })
    return response.data
  }
}

// Project Types API
export const projectTypesAPI = {
  getProjectTypes: async (params?: { includeInactive?: boolean; category?: string }) => {
    const response = await api.get('/project-types', { params })
    return response.data
  },
  getCategories: async () => {
    const response = await api.get('/project-types/categories')
    return response.data
  },
  getProjectType: async (id: string) => {
    const response = await api.get(`/project-types/${id}`)
    return response.data
  },
  createProjectType: async (projectTypeData: {
    value: string
    label: string
    category: string
    description?: string
    icon?: string
    orderIndex?: number
  }) => {
    const response = await api.post('/project-types', projectTypeData)
    return response.data
  },
  updateProjectType: async (id: string, projectTypeData: any) => {
    const response = await api.patch(`/project-types/${id}`, projectTypeData)
    return response.data
  },
  deleteProjectType: async (id: string) => {
    const response = await api.delete(`/project-types/${id}`)
    return response.data
  },
  deactivateProjectType: async (id: string) => {
    const response = await api.patch(`/project-types/${id}/deactivate`)
    return response.data
  },
  reactivateProjectType: async (id: string) => {
    const response = await api.patch(`/project-types/${id}/reactivate`)
    return response.data
  },
  seedDefaultTypes: async () => {
    const response = await api.post('/project-types/seed')
    return response.data
  }
}

export default api