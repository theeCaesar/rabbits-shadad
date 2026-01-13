<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useBlogStore } from '~/stores/blog'
import { useAuthStore } from '~/stores/auth'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Plus, Calendar, User, Tag, FileText, Users, X, Pencil, Home, Volume2, VolumeX } from 'lucide-vue-next'

const router = useRouter()
const blogStore = useBlogStore()
const authStore = useAuthStore()

const activeTab = ref<'journals' | 'rabbits'>('journals')
const expandedPostId = ref<string | null>(null)
const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(true)

// Initialize data from API on mount
onMounted(async () => {
  authStore.initializeAuth()
  blogStore.initializeData()
  // Fetch home data for personal image
  await blogStore.fetchHome()
  
  // Try to play music automatically (may be blocked by browser autoplay policy)
  setTimeout(() => {
    if (audioRef.value) {
      audioRef.value.play().catch(() => {
        // If autoplay fails, set isPlaying to false so user can click to play
        isPlaying.value = false
      })
    }
  }, 500)
}) 

const journals = computed(() => blogStore.journals || [])
const rabbits = computed(() => blogStore.rabbits || [])

// Get personal image from home data
const homePersonalImage = computed(() => {
  const home = blogStore.getHome()
  if (home && home.personalImage) {
    return getImageUrl(home.personalImage)
  }
  return ''
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// Helper function to ensure image URLs have proper protocol
function getImageUrl(url: string): string {
  if (!url) return ''
  // If URL already has protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // Otherwise, add https:// prefix
  return `https://${url}`
}

function toggleExpandPost(id: string) {
  if (expandedPostId.value === id) {
    expandedPostId.value = null
  } else {
    expandedPostId.value = id
  }
}

// Close expanded card when switching tabs
watch(activeTab, () => {
  expandedPostId.value = null
})

function handleLogout() {
  authStore.logout()
  router.push('/')
}

function toggleMusic() {
  if (audioRef.value) {
    if (isPlaying.value) {
      audioRef.value.pause()
    } else {
      audioRef.value.play()
    }
    isPlaying.value = !isPlaying.value
  }
}

// Import rabbit images from assets
import rabbitImage from '~/assets/image.png'
import rabbitImageNew from '~/assets/css/1000056349-removebg-preview.png'
</script>

<template>
  <div class="min-h-screen retro-bg flex flex-col">
    <!-- Background Music -->
    <audio ref="audioRef" loop>
      <source src="/background-music.mp3" type="audio/mpeg">
    </audio>
    
    <!-- Music Toggle Button -->
    <Button
      @click="toggleMusic"
      class="fixed top-4 right-4 z-50 retro-button-music"
      size="lg"
    >
      <VolumeX v-if="!isPlaying" class="w-5 h-5" />
      <Volume2 v-else class="w-5 h-5" />
    </Button>
    
    <!-- Animated Floating Rabbits -->
    <img 
      :src="rabbitImageNew" 
      alt="Rabbit" 
      class="jumping-rabbit rabbit-1"
    />
    <img 
      :src="rabbitImage" 
      alt="Rabbit" 
      class="jumping-rabbit rabbit-2 desktop-only"
    />
    <img 
      :src="rabbitImageNew" 
      alt="Rabbit" 
      class="jumping-rabbit rabbit-2 mobile-only"
    />
    <img 
      :src="rabbitImageNew" 
      alt="Rabbit" 
      class="jumping-rabbit rabbit-3"
    />
    <img 
      :src="rabbitImage" 
      alt="Rabbit" 
      class="jumping-rabbit rabbit-4 desktop-only"
    />
    <img 
      :src="rabbitImageNew" 
      alt="Rabbit" 
      class="jumping-rabbit rabbit-4 mobile-only"
    />
    <img 
      :src="rabbitImageNew" 
      alt="Rabbit" 
      class="jumping-rabbit rabbit-5"
    />
    <img 
      :src="rabbitImage" 
      alt="Rabbit" 
      class="jumping-rabbit rabbit-6 desktop-only"
    />
    <img 
      :src="rabbitImageNew" 
      alt="Rabbit" 
      class="jumping-rabbit rabbit-6 mobile-only"
    />
    <div class="flex flex-1 justify-center">
      <div class="flex flex-col md:flex-row max-w-[1800px] w-full">
        <!-- Left Sidebar with Image and Name -->
        <aside class="w-full md:w-96 flex-shrink-0 p-3 md:p-8 relative z-10">
          <div class="sticky top-4 md:top-6">
            <!-- Profile Image -->
            <div class="retro-card p-3 md:p-8 mb-4 md:mb-6 text-center flex flex-col items-center w-full" style="overflow: visible !important;">
              <div class="w-32 h-32 md:w-80 md:h-80 bg-transparent rounded-lg border-4 border-pink-300 flex items-center justify-center mb-3 md:mb-6 overflow-hidden">
                <img 
                  v-if="homePersonalImage"
                  :src="homePersonalImage" 
                  alt="Profile"
                  class="w-full h-full object-contain object-center"
                  style="background: transparent;"
                />
                <span v-else class="text-4xl md:text-6xl">🐰</span>
              </div>
              <!-- Name Title -->
              <h1 class="retro-title text-lg md:text-2xl lg:text-3xl font-bold leading-tight w-full px-2 py-2" style="overflow: visible !important; position: relative;">
                <span class="retro-gradient inline-block whitespace-nowrap max-w-full relative" style="overflow: visible !important;">
                  shahad josta<span class="relative inline-block align-baseline" style="overflow: visible !important;">r<span class="absolute -top-3 md:-top-4 lg:-top-5 left-1/2 -translate-x-1/2 text-yellow-300 text-xs md:text-sm lg:text-base leading-none z-50" style="overflow: visible !important;">★</span></span>
                </span>
              </h1>
            </div>
            
            <!-- Create Buttons (Admin Only) -->
            <div v-if="authStore.isAdmin" class="flex flex-col gap-3">
              <Button 
                @click="router.push('/dashboard/create-journal')"
                class="retro-button-create w-full"
              >
                <Plus class="w-4 h-4 mr-2" />
                New Journal
              </Button>
              <Button 
                @click="router.push('/dashboard/create-rabbit')"
                class="retro-button-create w-full"
              >
                <Plus class="w-4 h-4 mr-2" />
                New Rabbit
              </Button>
              <Button 
                @click="router.push('/dashboard/edit-home')"
                class="retro-button-outline w-full"
              >
                <Home class="w-4 h-4 mr-2" />
                Update Home Images
              </Button>
              <Button 
                @click="handleLogout"
                class="retro-button-outline w-full"
              >
                Logout
              </Button>
            </div>
            <!-- Dashboard Link -->
            <!-- <div v-else class="mt-4">
              <Button 
                @click="router.push('/dashboard')"
                class="retro-button-outline w-full"
              >
                Admin Dashboard
              </Button>
            </div> -->
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 py-4 md:py-8 relative z-10 flex flex-col">
          <div class="px-4 md:px-8 lg:px-12 xl:px-20 w-full flex flex-col flex-grow">
      <!-- Tab Buttons -->
      <div class="flex gap-2 md:gap-4 mb-4 md:mb-8 mt-4 md:mt-8">
        <Button 
          @click="activeTab = 'journals'"
          :class="[
            'retro-button-tab',
            activeTab === 'journals' ? 'retro-button-tab-active' : 'retro-button-tab-inactive'
          ]"
        >
          <FileText class="w-4 h-4 mr-2" />
          Journals
        </Button>
        <Button 
          @click="activeTab = 'rabbits'"
          :class="[
            'retro-button-tab',
            activeTab === 'rabbits' ? 'retro-button-tab-active' : 'retro-button-tab-inactive'
          ]"
        >
          <Users class="w-4 h-4 mr-2" />
          Rabbits
        </Button>
      </div>

      <!-- Journals View -->
      <div v-if="activeTab === 'journals'">
        <div v-if="blogStore.loading" class="text-center py-20 flex-grow flex items-center justify-center">
          <div class="retro-card inline-block p-8">
            <h2 class="text-2xl font-bold mb-4 retro-gradient">Loading...</h2>
          </div>
        </div>
        <div v-else-if="!journals || journals.length === 0" class="text-center py-20 flex-grow flex items-center justify-center">
          <div class="retro-card inline-block p-8">
            <h2 class="text-2xl font-bold mb-4 retro-gradient">No Journals Yet!</h2>
            <p class="text-lg mb-6 text-gray-600">No journal entries available.</p>
          </div>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-grow">
          <Card 
            v-for="journal in journals" 
            :key="journal._id"
            :class="[
              'retro-card cursor-pointer transition-all duration-300',
              expandedPostId === journal._id ? 'retro-card-expanded col-span-2 md:col-span-2 lg:col-span-3' : 'hover:scale-105 max-h-48'
            ]"
            @click="toggleExpandPost(journal._id)"
          >
            <!-- Rabbits on border when expanded -->
            <template v-if="expandedPostId === journal._id">
              <span class="rabbit-border rabbit-top-left">🐰</span>
              <span class="rabbit-border rabbit-top-right">🐰</span>
              <span class="rabbit-border rabbit-bottom-left">🐰</span>
              <span class="rabbit-border rabbit-bottom-right">🐰</span>
            </template>
            <CardHeader :class="expandedPostId === journal._id ? 'p-4 md:p-6 pb-3 md:pb-4' : 'p-2 pb-1'">
              <div class="flex items-start justify-between gap-2 md:gap-4 min-w-0">
                <CardTitle :class="[
                  'retro-title mb-1 min-w-0 flex-1',
                  expandedPostId === journal._id ? 'text-lg md:text-2xl lg:text-3xl' : 'text-xs md:text-sm lg:text-base line-clamp-1'
                ]" style="word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; max-width: 100%;">
                  Journal Entry
                </CardTitle>
                <div v-if="expandedPostId === journal._id" class="flex items-center gap-1 md:gap-2 flex-shrink-0">
                  <Button 
                    v-if="authStore.isAdmin"
                    @click.stop="router.push(`/dashboard/edit-journal/${journal._id}`)"
                    class="retro-button-edit flex-shrink-0"
                    size="sm"
                  >
                    <Pencil class="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <Button 
                    @click.stop="toggleExpandPost(journal._id)"
                    class="retro-button-close flex-shrink-0"
                    size="sm"
                  >
                    <X class="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>
              <div v-if="expandedPostId === journal._id" class="flex items-center gap-2 text-xs text-gray-600 mt-2">
                <div class="flex items-center gap-0.5">
                  <Calendar class="w-3 h-3 md:w-4 md:h-4" />
                  <span class="text-xs md:text-sm">{{ formatDate(journal.date) }}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent :class="expandedPostId === journal._id ? 'p-4 md:p-6 pt-3 md:pt-4' : 'p-2'" style="overflow: hidden; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; max-width: 100%;">
              <!-- Expanded layout: image left, content right -->
              <div v-if="expandedPostId === journal._id" class="flex flex-col md:flex-row gap-4 md:gap-6 min-w-0">
                <!-- Image on left -->
                <div v-if="journal.images && journal.images.length > 0" class="flex-shrink-0 w-full md:w-1/2 min-w-0">
                  <img 
                    :src="getImageUrl(journal.images[0])" 
                    :alt="'Journal image'"
                    class="w-full h-auto max-h-64 md:max-h-none object-cover rounded-lg max-w-full"
                    @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
                  />
                </div>
                <!-- Content on right -->
                <div class="flex-1 flex flex-col min-w-0">
                  <p class="text-gray-600 mb-0 md:mb-4 leading-relaxed text-sm md:text-base whitespace-pre-wrap break-words overflow-wrap-anywhere" style="word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; max-width: 100%;">
                    {{ journal.text }}
                  </p>
                </div>
              </div>
              <!-- Collapsed layout: image and date only -->
              <div v-else class="space-y-1.5">
                <div v-if="journal.images && journal.images.length > 0" class="mb-1.5">
                  <img 
                    :src="getImageUrl(journal.images[0])" 
                    :alt="'Journal image'"
                    class="w-full h-20 md:h-32 object-cover rounded"
                    @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
                  />
                </div>
                <!-- Date below image -->
                <div class="flex items-center gap-1 text-xs text-gray-600">
                  <Calendar class="w-2.5 h-2.5 flex-shrink-0" />
                  <span class="truncate">{{ formatDate(journal.date) }}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Rabbits View -->
      <div v-else>
        <div v-if="blogStore.loading" class="text-center py-20 flex-grow flex items-center justify-center">
          <div class="retro-card inline-block p-8">
            <h2 class="text-2xl font-bold mb-4 retro-gradient">Loading...</h2>
          </div>
        </div>
        <div v-else-if="!rabbits || rabbits.length === 0" class="text-center py-20 flex-grow flex items-center justify-center">
          <div class="retro-card inline-block p-8">
            <h2 class="text-2xl font-bold mb-4 retro-gradient">No Rabbits Yet!</h2>
            <p class="text-lg mb-6 text-gray-600">No rabbits available.</p>
          </div>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-grow">
          <Card 
            v-for="rabbit in rabbits" 
            :key="rabbit._id"
            :class="[
              'retro-card cursor-pointer transition-all duration-300',
              expandedPostId === rabbit._id ? 'retro-card-expanded col-span-2 md:col-span-2 lg:col-span-3' : 'hover:scale-105 max-h-48'
            ]"
            @click="toggleExpandPost(rabbit._id)"
          >
            <!-- Rabbits on border when expanded -->
            <template v-if="expandedPostId === rabbit._id">
              <span class="rabbit-border rabbit-top-left">🐰</span>
              <span class="rabbit-border rabbit-top-right">🐰</span>
              <span class="rabbit-border rabbit-bottom-left">🐰</span>
              <span class="rabbit-border rabbit-bottom-right">🐰</span>
            </template>
            <CardHeader :class="expandedPostId === rabbit._id ? 'p-4 md:p-6 pb-3 md:pb-4' : 'p-2 pb-1'">
              <div class="flex items-start justify-between gap-2 md:gap-4 min-w-0">
                <CardTitle :class="[
                  'retro-title mb-1 min-w-0 flex-1',
                  expandedPostId === rabbit._id ? 'text-lg md:text-2xl lg:text-3xl' : 'text-xs md:text-sm lg:text-base line-clamp-1'
                ]" style="word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; max-width: 100%;">
                  {{ rabbit.name }}
                </CardTitle>
                <div v-if="expandedPostId === rabbit._id" class="flex items-center gap-1 md:gap-2 flex-shrink-0">
                  <Button 
                    v-if="authStore.isAdmin"
                    @click.stop="router.push(`/dashboard/edit-rabbit/${rabbit._id}`)"
                    class="retro-button-edit flex-shrink-0"
                    size="sm"
                  >
                    <Pencil class="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <Button 
                    @click.stop="toggleExpandPost(rabbit._id)"
                    class="retro-button-close flex-shrink-0"
                    size="sm"
                  >
                    <X class="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>
              <div class="flex items-center gap-2 md:gap-3 text-xs text-gray-600 flex-wrap" :class="expandedPostId === rabbit._id ? 'mt-2' : ''">
                <div v-if="rabbit.age" class="flex items-center gap-0.5">
                  <span :class="expandedPostId === rabbit._id ? 'text-sm md:text-base' : 'text-xs'">🐰</span>
                  <span :class="expandedPostId === rabbit._id ? 'text-xs md:text-sm' : 'text-xs'">{{ rabbit.age }} years</span>
                </div>
                <div v-if="rabbit.birthDate" class="flex items-center gap-0.5">
                  <Calendar :class="expandedPostId === rabbit._id ? 'w-3 h-3 md:w-4 md:h-4' : 'w-2.5 h-2.5'" />
                  <span :class="expandedPostId === rabbit._id ? 'text-xs md:text-sm' : 'text-xs'">{{ formatDate(rabbit.birthDate) }}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent :class="expandedPostId === rabbit._id ? 'p-4 md:p-6 pt-3 md:pt-4' : 'p-2 pt-1'" style="overflow: hidden; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; max-width: 100%;">
              <!-- Expanded layout: image left, content right -->
              <div v-if="expandedPostId === rabbit._id" class="flex flex-col md:flex-row gap-4 md:gap-6 min-w-0">
                <!-- Image on left -->
                <div v-if="rabbit.images && rabbit.images.length > 0" class="flex-shrink-0 w-full md:w-1/2 min-w-0">
                  <img 
                    :src="getImageUrl(rabbit.images[0])" 
                    :alt="rabbit.name"
                    class="w-full h-auto max-h-64 md:max-h-none object-cover rounded-lg max-w-full"
                    @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
                  />
                </div>
                <!-- Content on right -->
                <div class="flex-1 flex flex-col min-w-0">
                  <p v-if="rabbit.description" class="text-gray-600 mb-3 md:mb-4 leading-relaxed text-sm md:text-base whitespace-pre-wrap break-words overflow-wrap-anywhere" style="word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; max-width: 100%;">
                    {{ rabbit.description }}
                  </p>
                  <div v-if="rabbit.favoriteSnake" class="mt-auto min-w-0">
                    <h4 class="text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2 break-words" style="word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; max-width: 100%;">Favorite Snack</h4>
                    <ul class="list-disc list-inside text-gray-600 space-y-0.5 md:space-y-1 text-xs md:text-base break-words" style="word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; max-width: 100%;">
                      <li v-for="(snack, index) in rabbit.favoriteSnake.split(',').map(s => s.trim()).filter(s => s)" :key="index" class="break-words" style="word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; max-width: 100%;">
                        {{ snack }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <!-- Collapsed layout: stacked -->
              <div v-else class="space-y-1.5">
                <div v-if="rabbit.images && rabbit.images.length > 0" class="mb-1.5">
                  <img 
                    :src="getImageUrl(rabbit.images[0])" 
                    :alt="rabbit.name"
                    class="w-full h-20 md:h-24 object-cover rounded"
                    @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </main>
      </div>
    </div>

    <!-- Footer -->
    <footer class="retro-footer mt-auto w-full">
      <div class="px-6 py-6 text-center">
      
        <p class="text-gray-400 mt-2">🎉 Happy Birthday Shahad! 🎉</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.retro-card {
  background: linear-gradient(145deg, rgba(255, 240, 245, 0.95) 0%, rgba(255, 228, 225, 0.9) 50%, rgba(230, 240, 255, 0.9) 100%);
  border: 4px double rgba(255, 105, 180, 0.4);
  border-radius: 20px;
  box-shadow: 
    0 6px 25px rgba(255, 182, 193, 0.4),
    0 3px 10px rgba(176, 196, 222, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.8),
    inset 0 -2px 4px rgba(255, 182, 193, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  position: relative;
}

.retro-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 182, 193, 0.1) 0%, transparent 70%);
  animation: rotate 8s linear infinite;
  pointer-events: none;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.retro-card:hover {
  border-color: rgba(255, 105, 180, 0.7);
  box-shadow: 
    0 10px 40px rgba(255, 182, 193, 0.6),
    0 5px 15px rgba(176, 196, 222, 0.4),
    inset 0 3px 6px rgba(255, 255, 255, 0.9),
    inset 0 -3px 6px rgba(255, 182, 193, 0.3),
    0 0 30px rgba(255, 105, 180, 0.3);
  transform: translateY(-6px) scale(1.03);
  background: linear-gradient(145deg, rgba(255, 245, 250, 0.98) 0%, rgba(255, 235, 230, 0.95) 50%, rgba(240, 248, 255, 0.95) 100%);
}

.retro-card:hover::after {
  background: radial-gradient(circle, rgba(255, 182, 193, 0.2) 0%, transparent 70%);
}
</style>
