import axios, { AxiosResponse, AxiosError } from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API methods
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    company?: string
  }) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword })
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },

  updateProfile: async (profileData: any) => {
    const response = await api.put('/auth/profile', profileData)
    return response.data
  },
}

// Users API methods
export const usersAPI = {
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

// Projects API methods
export const projectsAPI = {
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

// Products API methods
export const productsAPI = {
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

// Chat API methods
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

// Export the main api instance for custom requests
export default api