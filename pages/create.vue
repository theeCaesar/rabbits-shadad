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
  blogStore.initializePosts()
})

const title = ref('')
const content = ref('')
const author = ref('')
const tagInput = ref('')
const tags = ref<string[]>([])

function addTag() {
  if (tagInput.value.trim() && !tags.value.includes(tagInput.value.trim())) {
    tags.value.push(tagInput.value.trim())
    tagInput.value = ''
  }
}

function removeTag(tag: string) {
  tags.value = tags.value.filter(t => t !== tag)
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    addTag()
  }
}

async function createPost() {
  if (!title.value.trim() || !content.value.trim() || !author.value.trim()) {
    alert('Please fill in all required fields!')
    return
  }

  blogStore.addPost({
    title: title.value.trim(),
    content: content.value.trim(),
    author: author.value.trim(),
    tags: tags.value,
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
              <span class="retro-gradient">CREATE POST</span>
            </h1>
            <p class="retro-subtitle text-lg md:text-xl">share your thoughts! ✨</p>
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
          <CardTitle class="retro-title text-2xl">New Blog Post</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-bold text-red-400">Author *</label>
            <Input 
              v-model="author"
              placeholder="Your name"
              class="retro-input"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-red-400">Title *</label>
            <Input 
              v-model="title"
              placeholder="Post title"
              class="retro-input"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-red-400">Content *</label>
            <Textarea 
              v-model="content"
              placeholder="Write your blog post here..."
              :rows="15"
              class="retro-input"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-cyan-400">Tags</label>
            <div class="flex gap-2">
              <Input 
                v-model="tagInput"
                placeholder="Add a tag and press Enter"
                class="retro-input"
                @keypress="handleKeyPress"
              />
              <Button 
                @click="addTag"
                type="button"
                class="retro-button"
              >
                Add
              </Button>
            </div>
            <div v-if="tags.length > 0" class="flex flex-wrap gap-2 mt-2">
              <Badge 
                v-for="tag in tags" 
                :key="tag"
                class="retro-badge"
              >
                {{ tag }}
                <button 
                  @click="removeTag(tag)"
                  class="ml-2 hover:text-red-400"
                >
                  <X class="w-3 h-3" />
                </button>
              </Badge>
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <Button 
              @click="createPost"
              class="retro-button flex-1"
            >
              Publish Post
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
