export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

export interface City {
  id: string
  name: string
  country: string
  image_url: string
  description: string
  cost_index: number
  popularity: number
}

export interface Activity {
  id: string
  name: string
  description: string
  category: string
  cost: number
  duration: string
  image_url: string
}
