import type { City, Trip, User } from "@/lib/types/database"

export const MOCK_USERS: User[] = [
  {
    id: "user_1",
    email: "sarah@example.com",
    name: "Sarah Jenkins",
    avatar: "/traveler-portrait.jpg",
  },
]

export const MOCK_CITIES: City[] = [
  {
    id: "city_1",
    name: "Paris",
    country: "France",
    image_url: "/paris-eiffel-tower.png",
    description: "The City of Light, home to world-class art, food, and culture.",
    cost_index: 4,
    popularity: 5,
  },
  {
    id: "city_2",
    name: "Tokyo",
    country: "Japan",
    image_url: "/tokyo-skyline-night.png",
    description: "A neon-lit metropolis where tradition meets futuristic technology.",
    cost_index: 3,
    popularity: 5,
  },
  {
    id: "city_3",
    name: "Barcelona",
    country: "Spain",
    image_url: "/barcelona-sagrada-familia.jpg",
    description: "Vibrant Mediterranean city known for Gaudí's architecture and tapas.",
    cost_index: 2,
    popularity: 4,
  },
]

export const MOCK_TRIPS: Trip[] = [
  {
    id: "trip_1",
    user_id: "user_1",
    name: "European Summer Escape",
    description: "Exploring the best of Western Europe's history and gastronomy.",
    start_date: "2024-07-15",
    end_date: "2024-07-30",
    cover_image: "/europe-travel-collage.jpg",
    is_public: true,
    budget_limit: 5000,
    created_at: new Date().toISOString(),
  },
]
