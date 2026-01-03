export interface User {
  id: string
  email: string
  name: string
  avatar?: string | null
  role?: 'USER' | 'ADMIN'
  createdAt?: string
  updatedAt?: string
}

export interface City {
  id: string
  name: string
  country: string
  imageUrl: string
  description: string
  costIndex: number
  popularity: number
  createdAt?: string
  updatedAt?: string
}

export interface Activity {
  id: string
  name: string
  description: string
  category: string
  estimatedCost: number
  duration: number
  imageUrl: string
  cityId: string
  createdAt?: string
  updatedAt?: string
}

export interface ActivityWithCity extends Activity {
  city: City
}

export interface Trip {
  id: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
  budget?: number
  status?: 'PLANNING' | 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  userId?: string
  isPublic?: boolean
  coverImageUrl?: string
  destinations?: string[]
  createdAt?: string
  updatedAt?: string
  tripActivities?: TripActivity[]
  user?: User
}

export interface TripActivity {
  id: string
  tripId: string
  activityId: string
  date: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  activity: ActivityWithCity
}

export interface ShareLink {
  id: string
  tripId: string
  token: string
  expiresAt?: string
  createdAt?: string
  trip?: Trip
}
