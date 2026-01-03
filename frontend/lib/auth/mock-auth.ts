import type { User } from "@/lib/types/database"

const MOCK_USER: User = {
  id: "1",
  name: "Alex Johnson",
  email: "alex@example.com",
  avatar: "/traveler-portrait.jpg",
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("gt_user")
  return stored ? JSON.parse(stored) : null
}

export async function loginUser(email: string, _password: string): Promise<{ user?: User; error?: string }> {
  // Simple mock login
  if (email) {
    localStorage.setItem("gt_user", JSON.stringify(MOCK_USER))
    return { user: MOCK_USER }
  }
  return { error: "Invalid credentials" }
}

export function logoutUser(): void {
  localStorage.removeItem("gt_user")
}
