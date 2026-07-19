import { organizationService } from '../services/organizationService'
import { useOrganizationStore } from '../stores/organizationStore'
import { storeToRefs } from 'pinia'

export function useOrganization() {
  const store = useOrganizationStore()

  const {
    organization,
    draftOrganization,
    isLoading,
    loadError,
    organizationFormError,
    isSaving,
    hasChanges,
  } = storeToRefs(store)

  return {
    organization,
    draftOrganization,
    isLoading,
    loadError,
    organizationFormError,
    isSaving,
    hasChanges,
    loadOrganizationData: organizationService.loadOrganizationData,
    initializeEditForm: organizationService.initializeEditForm,
    saveOrganizationInfo: organizationService.saveOrganizationInfo,
  }
}
