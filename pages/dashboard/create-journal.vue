<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useBlogStore } from '~/stores/blog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

const router = useRouter()
const authStore = useAuthStore()
const blogStore = useBlogStore()

// Redirect if not admin
onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    router.push('/dashboard')
  }
})

const text = ref('')
const date = ref(new Date().toISOString().split('T')[0]) // Format: YYYY-MM-DD
const images = ref<File[]>([])
const loading = ref(false)
const error = ref('')
const success = ref('')

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    images.value = Array.from(target.files)
  }
}

async function handleSubmit() {
  error.value = ''
  success.value = ''

  if (!text.value.trim()) {
    error.value = 'Please enter journal text'
    return
  }

  if (!date.value) {
    error.value = 'Please select a date'
    return
  }

  if (images.value.length === 0) {
    error.value = 'Please select at least one image'
    return
  }

  loading.value = true

  try {
    const formData = new FormData()
    
    // Ensure text is not empty
    const trimmedText = text.value.trim()
    if (!trimmedText) {
      error.value = 'Please enter journal text'
      loading.value = false
      return
    }
    
    // Ensure date is properly formatted - create date at midnight UTC
    const dateStr = date.value // Format: YYYY-MM-DD
    if (!dateStr) {
      error.value = 'Please select a date'
      loading.value = false
      return
    }
    
    // Create date object - ensure it's valid
    const selectedDate = new Date(dateStr + 'T00:00:00.000Z')
    
    // Validate date
    if (isNaN(selectedDate.getTime())) {
      error.value = 'Invalid date format'
      loading.value = false
      return
    }
    
    // Create JSON object with required fields
    const jsonData = {
      text: trimmedText,  // Field name: 'text'
      date: selectedDate.toISOString(), // Field name: 'date' in ISO 8601 format
    }
    
    // Double-check the data
    if (!jsonData.text || jsonData.text.length === 0) {
      error.value = 'Journal text cannot be empty'
      loading.value = false
      return
    }
    
    if (!jsonData.date || jsonData.date.length === 0) {
      error.value = 'Date is required'
      loading.value = false
      return
    }
    
    // Debug: log the data being sent
    console.log('=== Journal Creation Debug ===')
    console.log('Text:', trimmedText)
    console.log('Date ISO:', selectedDate.toISOString())
    console.log('JSON data:', jsonData)
    
    // Append JSON fields directly to FormData as separate fields
    // Send text and date as direct FormData fields
    formData.append('text', jsonData.text)
    formData.append('date', jsonData.date)
    
    // Also append as json field (in case server expects both)
    formData.append('json', JSON.stringify(jsonData))

    // Add images - API expects 'images' as array field
    images.value.forEach((image) => {
      formData.append('images', image)
    })
    
    // Debug: verify FormData
    console.log('FormData has text:', formData.has('text'))
    console.log('FormData has date:', formData.has('date'))
    console.log('FormData has json:', formData.has('json'))
    console.log('FormData has images:', formData.has('images'))
    console.log('FormData text value:', formData.get('text'))
    console.log('FormData date value:', formData.get('date'))
    console.log('Number of images:', images.value.length)

    const result = await blogStore.createJournal(formData)

    if (result.success) {
      success.value = 'Journal created successfully!'
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      error.value = result.error || 'Failed to create journal'
    }
  } catch (e) {
    error.value = 'An error occurred. Please try again.'
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen retro-bg flex items-center justify-center p-4">
    <Card class="retro-card w-full max-w-2xl">
      <CardHeader>
        <CardTitle class="retro-title text-center text-2xl md:text-3xl">
          Create Journal Entry
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-if="error" class="retro-badge text-center p-3 bg-red-100 border-red-300 text-red-700">
          {{ error }}
        </div>
        <div v-if="success" class="retro-badge text-center p-3 bg-green-100 border-green-300 text-green-700">
          {{ success }}
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Date</label>
          <Input
            v-model="date"
            type="date"
            class="retro-input"
            required
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Journal Text *</label>
          <Textarea
            v-model="text"
            placeholder="Write your journal entry..."
            class="retro-input min-h-[200px]"
            required
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Images *</label>
          <Input
            type="file"
            accept="image/*"
            multiple
            @change="handleFileChange"
            class="retro-input"
            required
          />
          <p class="text-xs text-gray-600">Select one or more images</p>
        </div>

        <div class="flex gap-3">
          <Button
            @click="router.push('/')"
            class="retro-button-outline flex-1"
          >
            Cancel
          </Button>
          <Button
            @click="handleSubmit"
            :disabled="loading"
            class="retro-button-create flex-1"
          >
            {{ loading ? 'Creating...' : 'Create Journal' }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.retro-input,
.retro-input input,
.retro-input textarea {
  font-family: 'Bubblegum Sans', 'Chewy', 'Comic Neue', cursive, sans-serif;
  font-weight: 400;
}

label {
  font-family: 'Bubblegum Sans', 'Chewy', 'Comic Neue', cursive, sans-serif;
  font-weight: 600;
}
</style>
