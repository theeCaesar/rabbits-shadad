<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

const router = useRouter()
const authStore = useAuthStore()

const phone = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

// Initialize auth and redirect if already logged in
onMounted(() => {
  authStore.initializeAuth()
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})

async function handleLogin() {
  error.value = ''
  loading.value = true

  if (!phone.value || !password.value) {
    error.value = 'Please enter both phone and password'
    loading.value = false
    return
  }

  const result = await authStore.login(phone.value, password.value)

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'Login failed'
  }

  loading.value = false
}
</script>

<template>
  <div class="min-h-screen retro-bg flex items-center justify-center p-4">
    <Card class="retro-card w-full max-w-md">
      <CardHeader>
        <CardTitle class="retro-title text-center text-2xl md:text-3xl">
          Admin Login
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-if="error" class="retro-badge text-center p-3 bg-red-100 border-red-300 text-red-700">
          {{ error }}
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Phone Number</label>
          <Input
            v-model="phone"
            type="text"
            placeholder="Enter your phone number"
            class="retro-input"
            @keyup.enter="handleLogin"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Password</label>
          <Input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="retro-input"
            @keyup.enter="handleLogin"
          />
        </div>

        <Button
          @click="handleLogin"
          :disabled="loading"
          class="retro-button-create w-full"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </Button>

        <div class="text-center text-sm text-gray-600">
          <p>Login to access admin features</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
