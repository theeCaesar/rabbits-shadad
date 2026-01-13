<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useBlogStore } from '~/stores/blog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const blogStore = useBlogStore()

const rabbitId = computed(() => route.params.id as string)

// Form data
const name = ref('')
const description = ref('')
const birthDate = ref('')
const age = ref<number | null>(null)
const favoriteSnake = ref('')
const images = ref<File[]>([])
const currentImages = ref<string[]>([])
const loading = ref(false)
const error = ref('')
const success = ref('')
const initialLoading = ref(true)

// Redirect if not admin and load rabbit data
onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    router.push('/dashboard')
    return
  }
  
  // Fetch rabbits if not already loaded
  if (blogStore.rabbits.length === 0) {
    await blogStore.fetchRabbits()
  }
  
  // Load rabbit data
  const rabbit = blogStore.getRabbit(rabbitId.value)
  if (rabbit) {
    name.value = rabbit.name
    description.value = rabbit.description || ''
    birthDate.value = rabbit.birthDate ? rabbit.birthDate.split('T')[0] : ''
    age.value = rabbit.age ?? null
    favoriteSnake.value = rabbit.favoriteSnake || ''
    currentImages.value = rabbit.images || []
  } else {
    error.value = 'Rabbit not found'
  }
  
  initialLoading.value = false
})

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    images.value = Array.from(target.files)
  }
}

// Helper function to ensure image URLs have proper protocol
function getImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
}

async function handleSubmit() {
  error.value = ''
  success.value = ''

  if (!name.value.trim()) {
    error.value = 'Please enter rabbit name'
    return
  }

  loading.value = true

  try {
    const formData = new FormData()
    
    const trimmedName = name.value.trim()
    
    const jsonData: any = {
      name: trimmedName,
    }
    if (description.value.trim()) jsonData.description = description.value.trim()
    if (birthDate.value) {
      const dateObj = new Date(birthDate.value + 'T00:00:00.000Z')
      if (!isNaN(dateObj.getTime())) {
        jsonData.birthDate = dateObj.toISOString()
      } else {
        jsonData.birthDate = birthDate.value
      }
    }
    if (age.value !== null && age.value !== undefined) jsonData.age = age.value
    if (favoriteSnake.value.trim()) jsonData.favoriteSnake = favoriteSnake.value.trim()
    
    // Append form fields
    formData.append('name', trimmedName)
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
    
    formData.append('json', JSON.stringify(jsonData))

    // Add new images if provided
    if (images.value.length > 0) {
      images.value.forEach((image) => {
        formData.append('images', image)
      })
    }

    const result = await blogStore.updateRabbit(rabbitId.value, formData)

    if (result.success) {
      success.value = 'Rabbit updated successfully!'
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      error.value = result.error || 'Failed to update rabbit'
    }
  } catch (e) {
    error.value = 'An error occurred. Please try again.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!confirm('Are you sure you want to delete this rabbit? This action cannot be undone.')) {
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const result = await blogStore.deleteRabbit(rabbitId.value)
    
    if (result.success) {
      success.value = 'Rabbit deleted successfully!'
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      error.value = result.error || 'Failed to delete rabbit'
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
          Edit Rabbit
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-if="initialLoading" class="text-center py-8">
          <p class="text-gray-600">Loading rabbit...</p>
        </div>
        
        <template v-else>
          <div v-if="error" class="retro-badge text-center p-3 bg-red-100 border-red-300 text-red-700">
            {{ error }}
          </div>
          <div v-if="success" class="retro-badge text-center p-3 bg-green-100 border-green-300 text-green-700">
            {{ success }}
          </div>

          <!-- Current Images Preview -->
          <div v-if="currentImages.length > 0" class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Current Images</label>
            <div class="flex flex-wrap gap-2">
              <img 
                v-for="(img, index) in currentImages" 
                :key="index"
                :src="getImageUrl(img)"
                :alt="'Current image ' + (index + 1)"
                class="w-24 h-24 object-cover rounded-lg border-2 border-pink-300"
              />
            </div>
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
            <label class="text-sm font-medium text-gray-700">Replace Images (optional)</label>
            <Input
              type="file"
              accept="image/*"
              multiple
              @change="handleFileChange"
              class="retro-input"
            />
            <p class="text-xs text-gray-600">Select new images to replace existing ones (leave empty to keep current images)</p>
          </div>

          <div class="flex gap-3">
            <Button
              @click="router.push('/')"
              class="retro-button-outline flex-1"
            >
              Cancel
            </Button>
            <Button
              @click="handleDelete"
              :disabled="loading"
              class="retro-button-delete flex-1"
            >
              {{ loading ? 'Deleting...' : 'Delete' }}
            </Button>
            <Button
              @click="handleSubmit"
              :disabled="loading"
              class="retro-button-create flex-1"
            >
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </Button>
          </div>
        </template>
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
