import { MOCK_TRIPS, MOCK_CITIES, MOCK_USERS } from "./mock-data"
import type { Trip, City, User } from "@/lib/types/database"

export async function getCurrentUser(): Promise<User | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))
  return MOCK_USERS[0]
}

export async function getTripsByUser(userId: string): Promise<Trip[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return MOCK_TRIPS.filter((trip) => trip.user_id === userId)
}

export async function getAllCities(): Promise<City[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return MOCK_CITIES
}

export async function getTripById(id: string): Promise<Trip | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return MOCK_TRIPS.find((trip) => trip.id === id)
}
