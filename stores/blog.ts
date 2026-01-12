import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export interface Journal {
  _id: string
  images: string[]
  text: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface Rabbit {
  _id: string
  images: string[]
  name: string
  description?: string
  birthDate?: string
  age?: number
  favoriteSnake?: string
  createdAt: string
  updatedAt: string
}

export const useBlogStore = defineStore('blog', () => {
  const journals = ref<Journal[]>([])
  const rabbits = ref<Rabbit[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const authStore = useAuthStore()

  // Fetch journals from API
  async function fetchJournals() {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${authStore.baseURL}/api/v1/journals`)
      const data = await response.json()
      if (data.status === 'success') {
        journals.value = data.data.journals || []
      } else {
        error.value = data.message || 'Failed to fetch journals'
        journals.value = []
      }
    } catch (e) {
      error.value = 'Network error. Please try again.'
      journals.value = []
      console.error('Error fetching journals:', e)
    } finally {
      loading.value = false
    }
  }

  // Fetch rabbits from API
  async function fetchRabbits() {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${authStore.baseURL}/api/v1/rabbits`)
      const data = await response.json()
      if (data.status === 'success') {
        rabbits.value = data.data.rabbits || []
      } else {
        error.value = data.message || 'Failed to fetch rabbits'
        rabbits.value = []
      }
    } catch (e) {
      error.value = 'Network error. Please try again.'
      rabbits.value = []
      console.error('Error fetching rabbits:', e)
    } finally {
      loading.value = false
    }
  }

  // Initialize data from API
  async function initializeData() {
    await Promise.all([fetchJournals(), fetchRabbits()])
  }

  // Create journal (admin only)
  async function createJournal(formData: FormData) {
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    try {
      // For FormData, only set Authorization header, let browser set Content-Type with boundary
      const authHeaders = authStore.getAuthHeader()
      const headers: Record<string, string> = {}
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization
      }
      
      const response = await fetch(`${authStore.baseURL}/api/v1/dashboard/journals`, {
        method: 'POST',
        headers,
        body: formData,
      })

      let data
      try {
        data = await response.json()
      } catch (e) {
        const text = await response.text()
        console.error('Failed to parse response:', text)
        return { success: false, error: 'Server error. Please check console for details.' }
      }
      
      console.log('Server response status:', response.status)
      console.log('Server response:', data)
      
      if (!response.ok) {
        // Handle validation errors - show detailed error message
        let errorMsg = data.message || data.error || 'Failed to create journal'
        
        // If there's a detailed error object, include it
        if (data.error && typeof data.error === 'object') {
          const errorDetails = Object.entries(data.error)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
          errorMsg = errorDetails || errorMsg
        }
        
        console.error('Server error:', errorMsg)
        console.error('Full error object:', data.error)
        return { success: false, error: errorMsg }
      }
      
      if (data.status === 'success') {
        await fetchJournals()
        return { success: true, data: data.data.journal }
      } else {
        return { success: false, error: data.message || 'Failed to create journal' }
      }
    } catch (e) {
      console.error('Error creating journal:', e)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  // Create rabbit (admin only)
  async function createRabbit(formData: FormData) {
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    try {
      // Don't set Content-Type for FormData - browser will set it with boundary
      const headers: HeadersInit = {
        ...authStore.getAuthHeader(),
      }
      // Remove Content-Type if it exists - FormData needs browser to set it
      delete (headers as any)['Content-Type']
      
      const response = await fetch(`${authStore.baseURL}/api/v1/dashboard/rabbits`, {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await response.json()
      
      if (!response.ok) {
        // Handle validation errors
        const errorMsg = data.message || data.error || 'Failed to create rabbit'
        return { success: false, error: errorMsg }
      }
      
      if (data.status === 'success') {
        await fetchRabbits()
        return { success: true, data: data.data.rabbit }
      } else {
        return { success: false, error: data.message || 'Failed to create rabbit' }
      }
    } catch (e) {
      console.error('Error creating rabbit:', e)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  // Get journal by ID
  function getJournal(id: string) {
    return journals.value.find(journal => journal._id === id)
  }

  // Get rabbit by ID
  function getRabbit(id: string) {
    return rabbits.value.find(rabbit => rabbit._id === id)
  }

  return {
    journals,
    rabbits,
    loading,
    error,
    fetchJournals,
    fetchRabbits,
    initializeData,
    createJournal,
    createRabbit,
    getJournal,
    getRabbit,
  }
})
