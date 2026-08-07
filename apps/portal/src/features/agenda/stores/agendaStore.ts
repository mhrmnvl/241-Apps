import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AgendaEntry, PublicAgendaEntry } from '../types'

export const useAgendaStore = defineStore('portal-agenda', () => {
  const entries = ref<AgendaEntry[]>([])
  const current = ref<AgendaEntry | null>(null)
  const total = ref(0)

  const publicEntries = ref<PublicAgendaEntry[]>([])
  const publicCurrent = ref<PublicAgendaEntry | null>(null)
  const publicTotal = ref(0)
  const publicLimit = ref(10)

  const loading = ref(false)
  const isSaving = ref(false)
  const conflict = ref<string | null>(null)
  const notFound = ref(false)
  const unavailable = ref(false)

  function reset() {
    current.value = null
    conflict.value = null
  }

  function resetPublic() {
    publicCurrent.value = null
    notFound.value = false
    unavailable.value = false
  }

  return {
    entries,
    current,
    total,
    publicEntries,
    publicCurrent,
    publicTotal,
    publicLimit,
    loading,
    isSaving,
    conflict,
    notFound,
    unavailable,
    reset,
    resetPublic,
  }
})
