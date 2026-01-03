// API configuration
const API_BASE_URL = 'http://localhost:5000/api'

// Token management
export const TOKEN_KEY = 'auth_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
}

// API error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Add custom headers from options
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value
      }
    })
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_BASE_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const json = await response.json()

    if (!response.ok) {
      throw new ApiError(
        json.error?.message || json.message || json.error || 'An error occurred',
        response.status,
        json
      )
    }

    // Extract data from wrapped response if it exists
    const data = json.data !== undefined ? json.data : json

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('Network error', 0, error)
  }
}

// Authentication API
export const authApi = {
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await apiRequest<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    setToken(response.token)
    return response
  },

  login: async (data: { email: string; password: string }) => {
    const response = await apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    setToken(response.token)
    return response
  },

  logout: () => {
    removeToken()
  },

  getProfile: async () => {
    return await apiRequest<any>('/auth/me')
  },
}

// Cities API
export const citiesApi = {
  getPopular: async () => {
    return await apiRequest<any[]>('/cities/popular')
  },

  search: async (query: string = '') => {
    const params = query ? `?keyword=${encodeURIComponent(query)}` : ''
    return await apiRequest<any[]>(`/cities/search${params}`)
  },

  getById: async (id: string) => {
    return await apiRequest<any>(`/cities/${id}`)
  },
}

// Activities API
export const activitiesApi = {
  search: async (params: { cityId?: string; category?: string; query?: string } = {}) => {
    const searchParams = new URLSearchParams()
    if (params.cityId) searchParams.append('cityId', params.cityId)
    if (params.category) searchParams.append('category', params.category)
    if (params.query) searchParams.append('query', params.query)
    
    const queryString = searchParams.toString()
    const url = queryString ? `/activities/search?${queryString}` : '/activities/search'
    
    return await apiRequest<any[]>(url)
  },

  getById: async (id: string) => {
    return await apiRequest<any>(`/activities/${id}`)
  },
}

// Trips API
export const tripsApi = {
  getAll: async (params: { page?: number; limit?: number } = {}) => {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    
    const queryString = searchParams.toString()
    const url = queryString ? `/trips?${queryString}` : '/trips'
    
    return await apiRequest<{ trips: any[]; total: number; page: number; limit: number }>(url)
  },

  getById: async (id: string) => {
    return await apiRequest<any>(`/trips/${id}`)
  },

  create: async (data: {
    name: string
    description?: string
    startDate: string
    endDate: string
    budget?: number
    status?: string
  }) => {
    return await apiRequest<any>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: string, data: Partial<{
    name: string
    description: string
    startDate: string
    endDate: string
    budget: number
    status: string
    destinations: any[]
    isPublic: boolean
  }>) => {
    return await apiRequest<any>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return await apiRequest<void>(`/trips/${id}`, {
      method: 'DELETE',
    })
  },

  addActivity: async (tripId: string, data: {
    activityId: string
    date?: string
    notes?: string
  }) => {
    return await apiRequest<any>(`/trips/${tripId}/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  removeActivity: async (tripId: string, activityId: string) => {
    return await apiRequest<void>(`/trips/${tripId}/activities/${activityId}`, {
      method: 'DELETE',
    })
  },

  updateActivity: async (tripId: string, activityId: string, data: {
    date?: string
    notes?: string
  }) => {
    return await apiRequest<any>(`/trips/${tripId}/activities/${activityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

// Share API
export const shareApi = {
  createLink: async (tripId: string, data: { expiresIn?: number } = {}) => {
    return await apiRequest<{ shareLink: any }>(`/shared/trips/${tripId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getSharedTrip: async (token: string) => {
    return await apiRequest<any>(`/shared/${token}`)
  },

  revokeLink: async (tripId: string) => {
    return await apiRequest<void>(`/shared/trips/${tripId}`, {
      method: 'DELETE',
    })
  },
}

// Admin API
export const adminApi = {
  getStats: async () => {
    return await apiRequest<any>('/admin/stats')
  },

  getUsers: async (params: { page?: number; limit?: number } = {}) => {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    
    const queryString = searchParams.toString()
    const url = queryString ? `/admin/users?${queryString}` : '/admin/users'
    
    return await apiRequest<{ users: any[]; total: number; page: number; limit: number }>(url)
  },
}
