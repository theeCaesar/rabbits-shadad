import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  _id: string
  name?: string
  phone: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const baseURL = 'https://rabbits-vw60.onrender.com'

  // Check if user is authenticated
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Check if user is admin
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Initialize from localStorage
  function initializeAuth() {
    if (import.meta.client && typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('authToken')
      const savedUser = localStorage.getItem('authUser')
      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      }
    }
  }

  // Login function
  async function login(phone: string, password: string) {
    try {
      const response = await fetch(`${baseURL}/api/v1/dashboard/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      })

      const data = await response.json()

      if (data.status === 'success' && data.token) {
        token.value = data.token
        user.value = data.data.user

        // Save to localStorage
        if (import.meta.client) {
          localStorage.setItem('authToken', data.token)
          localStorage.setItem('authUser', JSON.stringify(data.data.user))
        }

        return { success: true }
      } else {
        return { success: false, error: data.message || 'Login failed' }
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  // Logout function
  function logout() {
    token.value = null
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
    }
  }

  // Get authorization header
  function getAuthHeader() {
    if (token.value) {
      return {
        'Authorization': `Bearer ${token.value}`
      }
    }
    return {}
  }

  // Initialize on store creation
  if (import.meta.client && typeof window !== 'undefined') {
    initializeAuth()
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    getAuthHeader,
    initializeAuth,
    baseURL,
  }
})
