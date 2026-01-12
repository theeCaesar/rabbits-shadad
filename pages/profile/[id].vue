<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useBlogStore } from '~/stores/blog'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { ArrowLeft, Calendar, User, Tag, Trash2, MapPin } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()

onMounted(() => {
  blogStore.initializeProfiles()
})

const profile = computed(() => {
  const id = route.params.id as string
  return blogStore.getProfile(id)
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function goBack() {
  router.push('/')
}

function deleteProfile() {
  if (confirm('Are you sure you want to delete this profile?')) {
    blogStore.deleteProfile(route.params.id as string)
    router.push('/')
  }
}

// Redirect if profile doesn't exist
watch(profile, (newProfile) => {
  if (!newProfile && import.meta.client) {
    router.push('/')
  }
}, { immediate: true })
</script>

<template>
  <div v-if="profile" class="min-h-screen retro-bg flex flex-col">
    <!-- Header -->
    <header class="retro-header">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <Button 
            @click="goBack"
            variant="outline"
            class="retro-button-outline"
          >
            <ArrowLeft class="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
          <Button 
            @click="deleteProfile"
            variant="destructive"
            class="retro-button-delete"
          >
            <Trash2 class="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 max-w-4xl relative z-10 flex-grow">
      <Card class="retro-card">
        <CardContent class="p-8">
          <h1 class="retro-title text-4xl md:text-5xl font-bold mb-6 retro-gradient">
            {{ profile.name }}
          </h1>

          <div class="flex items-center gap-6 mb-8 text-gray-300">
            <div v-if="profile.age" class="flex items-center gap-2">
              <User class="w-5 h-5 text-cyan-400" />
              <span class="font-semibold">{{ profile.age }} years old</span>
            </div>
            <div v-if="profile.location" class="flex items-center gap-2">
              <MapPin class="w-5 h-5 text-cyan-400" />
              <span>{{ profile.location }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Calendar class="w-5 h-5 text-cyan-400" />
              <span>{{ formatDate(profile.date) }}</span>
            </div>
          </div>

          <div v-if="profile.interests.length > 0" class="flex flex-wrap gap-2 mb-8">
            <Badge 
              v-for="interest in profile.interests" 
              :key="interest"
              class="retro-badge"
            >
              <Tag class="w-3 h-3 mr-1" />
              {{ interest }}
            </Badge>
          </div>

          <div class="prose prose-invert max-w-none">
            <div class="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap retro-content">
              {{ profile.bio }}
            </div>
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

<style scoped>
.retro-content {
  font-family: 'Bubblegum Sans', 'Chewy', 'Comic Neue', cursive, sans-serif !important;
  line-height: 1.8;
  color: #333;
  font-size: 1.1rem;
}
</style>
