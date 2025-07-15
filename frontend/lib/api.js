import { BASE_API_URL } from "./contants"
import { message } from "antd" // Import message dari antd

export async function authenticatedFetch(url, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null // Get token from localStorage
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Token ${token}` // Add Authorization header
  }

  const response = await fetch(`${BASE_API_URL}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    // Handle unauthorized access, e.g., redirect to login
    if (response.status === 401 || response.status === 403) {
      message.error("Authentication required. Please log in again.")
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken")
        window.location.href = "/login" // Redirect to login page
      }
    }
    const errorData = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(errorData.detail || `API request failed with status ${response.status}`)
  }

  return response.json()
}
