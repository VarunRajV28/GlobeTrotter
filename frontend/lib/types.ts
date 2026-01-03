export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  language_preference: string
}

export interface Trip {
  id: string
  user_id: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  cover_image: string | null
  is_public: boolean
  budget_limit: number | null
  created_at: string
}

export interface Stop {
  id: string
  trip_id: string
  city_name: string
  country_name: string | null
  arrival_date: string | null
  departure_date: string | null
  order: number
  lat: number | null
  lng: number | null
}

export interface Activity {
  id: string
  stop_id: string
  name: string
  description: string | null
  start_time: string | null
  end_time: string | null
  cost: number
  category: string | null
  order: number
}
