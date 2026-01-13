<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useBlogStore } from '~/stores/blog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

const router = useRouter()
const authStore = useAuthStore()
const blogStore = useBlogStore()

// Form data
const homeId = ref('')
const personalImage = ref<File | null>(null)
const currentPersonalImage = ref<string>('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const initialLoading = ref(true)

// Redirect if not admin and load home data
onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    router.push('/dashboard')
    return
  }
  
  // Fetch home data from API (stores in blogStore.homes)
  await blogStore.fetchHome()
  
  // Get the first home item
  const home = blogStore.getHome()
  if (home) {
    homeId.value = home._id
    currentPersonalImage.value = home.personalImage || ''
  } else {
    error.value = 'No home configuration found. Please create one first.'
  }
  
  initialLoading.value = false
})

function handlePersonalImageChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    personalImage.value = target.files[0]
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

  if (!homeId.value) {
    error.value = 'Home configuration not found'
    return
  }

  if (!personalImage.value) {
    error.value = 'Please select an image to update'
    return
  }

  loading.value = true

  try {
    const formData = new FormData()

    // Add personal image
    formData.append('personalImage', personalImage.value)

    const result = await blogStore.updateHome(homeId.value, formData)

    if (result.success) {
      success.value = 'Home images updated successfully!'
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      error.value = result.error || 'Failed to update home images'
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
          Update Home Images
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-if="initialLoading" class="text-center py-8">
          <p class="text-gray-600">Loading home configuration...</p>
        </div>
        
        <template v-else>
          <div v-if="error" class="retro-badge text-center p-3 bg-red-100 border-red-300 text-red-700">
            {{ error }}
          </div>
          <div v-if="success" class="retro-badge text-center p-3 bg-green-100 border-green-300 text-green-700">
            {{ success }}
          </div>

          <!-- Current Personal Image Preview -->
          <div v-if="currentPersonalImage" class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Current Personal Image</label>
            <div>
              <img 
                :src="getImageUrl(currentPersonalImage)"
                alt="Personal image"
                class="w-32 h-32 object-cover rounded-lg border-2 border-pink-300"
              />
            </div>
          </div>

          <div class="border-t border-pink-200 my-4 pt-4">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">Update Image</h3>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">New Personal Image</label>
            <Input
              type="file"
              accept="image/*"
              @change="handlePersonalImageChange"
              class="retro-input"
            />
            <p class="text-xs text-gray-600">Select an image to replace the current personal image</p>
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
              :disabled="loading || !homeId"
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
