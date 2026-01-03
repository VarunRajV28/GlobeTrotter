import type { Trip, City, User, Activity, ActivityWithCity } from "@/lib/types/database"
import { citiesApi, activitiesApi, tripsApi, authApi } from "@/lib/api"

// API-based functions - no mock data
export async function searchCities(query: string = ""): Promise<City[]> {
  try {
    const cities = await citiesApi.search(query)
    return cities
  } catch (error) {
    console.error("Error searching cities:", error)
    return []
  }
}

export async function searchActivities(query: string = ""): Promise<ActivityWithCity[]> {
  try {
    const activities = await activitiesApi.search({ query })
    return activities
  } catch (error) {
    console.error("Error searching activities:", error)
    return []
  }
}

export async function getPopularCities(): Promise<City[]> {
  try {
    return await citiesApi.getPopular()
  } catch (error) {
    console.error("Error fetching popular cities:", error)
    return []
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await authApi.getProfile()
  } catch (error) {
    // If not authenticated, return null
    return null
  }
}

export async function getTripsByUser(): Promise<Trip[]> {
  try {
    const result = await tripsApi.getAll()
    return result.trips
  } catch (error) {
    console.error("Error fetching trips:", error)
    return []
  }
}

export async function getAllCities(): Promise<City[]> {
  try {
    return await citiesApi.getPopular()
  } catch (error) {
    console.error("Error fetching cities:", error)
    return []
  }
}

export async function getTripById(id: string): Promise<Trip | undefined> {
  try {
    return await tripsApi.getById(id)
  } catch (error) {
    console.error("Error fetching trip:", error)
    return undefined
  }
}

