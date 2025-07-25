import { BASE_API_URL } from "./contants"
import { message } from "antd"

export async function authenticatedFetch(url, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

  let headers
  // Check if Headers constructor is defined in the global scope
  if (typeof Headers !== "undefined") {
    headers = new Headers({
      "Content-Type": "application/json",
    })
    // Add any existing headers from options
    if (options.headers) {
      for (const key in options.headers) {
        headers.set(key, options.headers[key])
      }
    }
    if (token) {
      headers.set("Authorization", `Token ${token}`)
    }
  } else {
    // Fallback to a plain object if Headers is not defined
    console.warn("Headers constructor not found, falling back to plain object for headers.")
    headers = {
      "Content-Type": "application/json",
      ...options.headers, // Merge any existing headers from options
    }
    if (token) {
      headers["Authorization"] = `Token ${token}`
    }
  }

  const response = await fetch(`${BASE_API_URL}${url}`, {
    ...options,
    headers, // Pass the constructed headers (either Headers object or plain object)
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      message.error("Authentication required. Please log in again.")
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken")
        window.location.href = "/login"
      }
    }
    const errorData = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(errorData.detail || `API request failed with status ${response.status}`)
  }

  return response.json()
}
