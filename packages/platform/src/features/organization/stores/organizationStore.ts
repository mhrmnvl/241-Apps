import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { EMPTY_ORGANIZATION } from '../constants'
import type { Organization } from '../types'
import { hasOrganizationProfileChanges } from '../utils'

export const useOrganizationStore = defineStore('organization', () => {
  const organization = reactive<Organization>({ ...EMPTY_ORGANIZATION })
  const draftOrganization = reactive<Organization>({ ...EMPTY_ORGANIZATION })

  const isLoading = ref(true)
  const loadError = ref<string | null>(null)

  const organizationFormError = ref<string | null>(null)
  const isSaving = ref(false)

  const hasChanges = computed(() => {
    return hasOrganizationProfileChanges(organization, draftOrganization)
  })

  return {
    organization,
    draftOrganization,
    isLoading,
    loadError,
    organizationFormError,
    isSaving,
    hasChanges,
  }
})
