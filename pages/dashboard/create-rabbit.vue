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

const name = ref('')
const description = ref('')
const birthDate = ref('')
const age = ref<number | null>(null)
const favoriteSnake = ref('')
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

  if (!name.value.trim()) {
    error.value = 'Please enter rabbit name'
    return
  }

  if (images.value.length === 0) {
    error.value = 'Please select at least one image'
    return
  }

  loading.value = true

  try {
    const formData = new FormData()
    
    // Ensure name is not empty
    const trimmedName = name.value.trim()
    if (!trimmedName) {
      error.value = 'Please enter rabbit name'
      loading.value = false
      return
    }
    
    // Create JSON object with all fields
    const jsonData: any = {
      name: trimmedName,
    }
    if (description.value.trim()) jsonData.description = description.value.trim()
    if (birthDate.value) {
      // Format birthDate as ISO string if provided
      const dateObj = new Date(birthDate.value + 'T00:00:00.000Z')
      if (!isNaN(dateObj.getTime())) {
        jsonData.birthDate = dateObj.toISOString()
      } else {
        jsonData.birthDate = birthDate.value
      }
    }
    if (age.value !== null && age.value !== undefined) jsonData.age = age.value
    if (favoriteSnake.value.trim()) jsonData.favoriteSnake = favoriteSnake.value.trim()
    
    // Debug: log the data being sent
    console.log('=== Rabbit Creation Debug ===')
    console.log('Name:', trimmedName)
    console.log('Description:', description.value.trim())
    console.log('Birth Date:', birthDate.value)
    console.log('Age:', age.value)
    console.log('Favorite Snack:', favoriteSnake.value.trim())
    console.log('JSON data:', jsonData)
    
    // Append JSON fields directly to FormData as separate fields
    // Send name as direct FormData field (required)
    formData.append('name', trimmedName)
    
    // Send optional fields if they have values
    if (description.value.trim()) {
      formData.append('description', description.value.trim())
    }
    if (birthDate.value) {
      const dateObj = new Date(birthDate.value + 'T00:00:00.000Z')
      if (!isNaN(dateObj.getTime())) {
        formData.append('birthDate', dateObj.toISOString())
      } else {
        formData.append('birthDate', birthDate.value)
      }
    }
    if (age.value !== null && age.value !== undefined) {
      formData.append('age', age.value.toString())
    }
    if (favoriteSnake.value.trim()) {
      formData.append('favoriteSnake', favoriteSnake.value.trim())
    }
    
    // Also append as json field (in case server expects both)
    formData.append('json', JSON.stringify(jsonData))

    // Add images - API expects 'images' as array field
    images.value.forEach((image) => {
      formData.append('images', image)
    })
    
    // Debug: verify FormData
    console.log('FormData has name:', formData.has('name'))
    console.log('FormData has description:', formData.has('description'))
    console.log('FormData has birthDate:', formData.has('birthDate'))
    console.log('FormData has age:', formData.has('age'))
    console.log('FormData has favoriteSnake:', formData.has('favoriteSnake'))
    console.log('FormData has json:', formData.has('json'))
    console.log('FormData has images:', formData.has('images'))
    console.log('FormData name value:', formData.get('name'))
    console.log('Number of images:', images.value.length)

    const result = await blogStore.createRabbit(formData)

    if (result.success) {
      success.value = 'Rabbit created successfully!'
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      error.value = result.error || 'Failed to create rabbit'
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
          Create Rabbit
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
          <label class="text-sm font-medium text-gray-700">Name *</label>
          <Input
            v-model="name"
            type="text"
            placeholder="Enter rabbit name"
            class="retro-input"
            required
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Description</label>
          <Textarea
            v-model="description"
            placeholder="Describe the rabbit..."
            class="retro-input min-h-[100px]"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Birth Date</label>
            <Input
              v-model="birthDate"
              type="date"
              class="retro-input"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Age (years)</label>
            <Input
              v-model.number="age"
              type="number"
              placeholder="Age in years"
              class="retro-input"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Favorite Snack</label>
          <Input
            v-model="favoriteSnake"
            type="text"
            placeholder="Favorite snack"
            class="retro-input"
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
            {{ loading ? 'Creating...' : 'Create Rabbit' }}
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
  font-family: 'Comic Neue', cursive, sans-serif;
  font-weight: 400;
}

label {
  font-family: 'Comic Neue', cursive, sans-serif;
  font-weight: 600;
}
</style>
