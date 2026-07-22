export { educationalHistoryApi } from './api/educationalHistoryApi'
export { useEducationalHistoryStore } from './stores/educationalHistoryStore'
export { educationalHistoryService } from './services/educationalHistoryService'
export { useEducationalHistory } from './composables/useEducationalHistory'
export { useEducationalHistoryForm } from './composables/useEducationalHistoryForm'
export { default as EducationalHistoryTab } from './components/EducationalHistoryTab.vue'
export { default as EditEducationalHistoryDialog } from './components/EditEducationalHistoryDialog.vue'
export type {
  EducationalHistory,
  EducationalHistoryEditData,
  EducationalHistoryCreatePayload,
  EducationalHistoryUpdatePayload,
  EducationalHistoryTabData,
  EducationStatus,
} from './types'
