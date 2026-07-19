import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AuthUser } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)

  function setUser(newUser: AuthUser) {
    user.value = newUser
  }

  function clearUser() {
    user.value = null
  }

  return { user, setUser, clearUser }
})
