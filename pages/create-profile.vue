<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBlogStore } from '~/stores/blog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { ArrowLeft, X } from 'lucide-vue-next'

const router = useRouter()
const blogStore = useBlogStore()

onMounted(() => {
  blogStore.initializeProfiles()
})

const name = ref('')
const bio = ref('')
const age = ref('')
const location = ref('')
const interestInput = ref('')
const interests = ref<string[]>([])

function addInterest() {
  if (interestInput.value.trim() && !interests.value.includes(interestInput.value.trim())) {
    interests.value.push(interestInput.value.trim())
    interestInput.value = ''
  }
}

function removeInterest(interest: string) {
  interests.value = interests.value.filter(i => i !== interest)
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    addInterest()
  }
}

async function createProfile() {
  if (!name.value.trim() || !bio.value.trim()) {
    alert('Please fill in name and bio!')
    return
  }

  blogStore.addProfile({
    name: name.value.trim(),
    bio: bio.value.trim(),
    age: age.value.trim() || undefined,
    location: location.value.trim() || undefined,
    interests: interests.value,
  })

  router.push('/')
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen retro-bg flex flex-col">
    <!-- Header -->
    <header class="retro-header">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="retro-title text-4xl md:text-6xl font-bold mb-2">
              <span class="retro-gradient">CREATE PROFILE</span>
            </h1>
            <p class="retro-subtitle text-lg md:text-xl">share your profile! ✨</p>
          </div>
          <Button 
            @click="goBack"
            variant="outline"
            class="retro-button-outline"
          >
            <ArrowLeft class="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 max-w-4xl relative z-10 flex-grow">
      <Card class="retro-card">
        <CardHeader>
          <CardTitle class="retro-title text-2xl">New Profile</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-bold text-cyan-400">Name *</label>
            <Input 
              v-model="name"
              placeholder="Profile name"
              class="retro-input"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-cyan-400">Age</label>
            <Input 
              v-model="age"
              placeholder="Age (optional)"
              class="retro-input"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-cyan-400">Location</label>
            <Input 
              v-model="location"
              placeholder="Location (optional)"
              class="retro-input"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-cyan-400">Bio *</label>
            <Textarea 
              v-model="bio"
              placeholder="Write about yourself..."
              :rows="10"
              class="retro-input"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-cyan-400">Interests</label>
            <div class="flex gap-2">
              <Input 
                v-model="interestInput"
                placeholder="Add an interest and press Enter"
                class="retro-input"
                @keypress="handleKeyPress"
              />
              <Button 
                @click="addInterest"
                type="button"
                class="retro-button"
              >
                Add
              </Button>
            </div>
            <div v-if="interests.length > 0" class="flex flex-wrap gap-2 mt-2">
              <Badge 
                v-for="interest in interests" 
                :key="interest"
                class="retro-badge"
              >
                {{ interest }}
                <button 
                  @click="removeInterest(interest)"
                  class="ml-2 hover:text-red-400"
                >
                  <X class="w-3 h-3" />
                </button>
              </Badge>
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <Button 
              @click="createProfile"
              class="retro-button flex-1"
            >
              Create Profile
            </Button>
            <Button 
              @click="goBack"
              variant="outline"
              class="retro-button-outline"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>

    <!-- Footer -->
    <footer class="retro-footer mt-auto">
      <div class="container mx-auto px-4 py-6 text-center">
        <p class="text-gray-400">© 2024 my cute blog | made with ♡ in 2000s style ✨</p>
      </div>
    </footer>
  </div>
</template>
