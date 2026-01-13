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

const journalId = computed(() => route.params.id as string)

// Form data
const text = ref('')
const date = ref('')
const images = ref<File[]>([])
const currentImages = ref<string[]>([])
const loading = ref(false)
const error = ref('')
const success = ref('')
const initialLoading = ref(true)

// Redirect if not admin and load journal data
onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    router.push('/dashboard')
    return
  }
  
  // Fetch journals if not already loaded
  if (blogStore.journals.length === 0) {
    await blogStore.fetchJournals()
  }
  
  // Load journal data
  const journal = blogStore.getJournal(journalId.value)
  if (journal) {
    text.value = journal.text
    date.value = journal.date.split('T')[0] // Format: YYYY-MM-DD
    currentImages.value = journal.images || []
  } else {
    error.value = 'Journal not found'
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

  if (!text.value.trim()) {
    error.value = 'Please enter journal text'
    return
  }

  if (!date.value) {
    error.value = 'Please select a date'
    return
  }

  loading.value = true

  try {
    const formData = new FormData()
    
    const trimmedText = text.value.trim()
    const dateStr = date.value
    const selectedDate = new Date(dateStr + 'T00:00:00.000Z')
    
    if (isNaN(selectedDate.getTime())) {
      error.value = 'Invalid date format'
      loading.value = false
      return
    }
    
    const jsonData = {
      text: trimmedText,
      date: selectedDate.toISOString(),
    }
    
    formData.append('text', jsonData.text)
    formData.append('date', jsonData.date)
    formData.append('json', JSON.stringify(jsonData))

    // Add new images if provided
    if (images.value.length > 0) {
      images.value.forEach((image) => {
        formData.append('images', image)
      })
    }

    const result = await blogStore.updateJournal(journalId.value, formData)

    if (result.success) {
      success.value = 'Journal updated successfully!'
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      error.value = result.error || 'Failed to update journal'
    }
  } catch (e) {
    error.value = 'An error occurred. Please try again.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const result = await blogStore.deleteJournal(journalId.value)
    
    if (result.success) {
      success.value = 'Journal deleted successfully!'
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      error.value = result.error || 'Failed to delete journal'
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
          Edit Journal Entry
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-if="initialLoading" class="text-center py-8">
          <p class="text-gray-600">Loading journal...</p>
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
