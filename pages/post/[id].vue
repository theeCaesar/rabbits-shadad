<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useBlogStore } from '~/stores/blog'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { ArrowLeft, Calendar, User, Tag, Trash2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()

onMounted(() => {
  blogStore.initializePosts()
})

const post = computed(() => {
  const id = route.params.id as string
  return blogStore.getPost(id)
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

function deletePost() {
  if (confirm('Are you sure you want to delete this post?')) {
    blogStore.deletePost(route.params.id as string)
    router.push('/')
  }
}

// Redirect if post doesn't exist
watch(post, (newPost) => {
  if (!newPost && import.meta.client) {
    router.push('/')
  }
}, { immediate: true })
</script>

<template>
  <div v-if="post" class="min-h-screen retro-bg flex flex-col">
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
            @click="deletePost"
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
            {{ post.title }}
          </h1>

          <div class="flex items-center gap-6 mb-8 text-gray-300">
            <div class="flex items-center gap-2">
              <User class="w-5 h-5 text-cyan-400" />
              <span class="font-semibold">{{ post.author }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Calendar class="w-5 h-5 text-cyan-400" />
              <span>{{ formatDate(post.date) }}</span>
            </div>
          </div>

          <div v-if="post.tags.length > 0" class="flex flex-wrap gap-2 mb-8">
            <Badge 
              v-for="tag in post.tags" 
              :key="tag"
              class="retro-badge"
            >
              <Tag class="w-3 h-3 mr-1" />
              {{ tag }}
            </Badge>
          </div>

          <div class="prose prose-invert max-w-none">
            <div class="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap retro-content">
              {{ post.content }}
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
  font-family: 'Comic Neue', cursive;
  line-height: 1.8;
  color: #333;
  font-size: 1.1rem;
}
</style>
