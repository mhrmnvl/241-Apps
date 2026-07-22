export { useScholarshipStore } from './stores/scholarshipStore'
export { scholarshipService } from './services/scholarshipService'
export { useScholarship } from './composables/useScholarship'
export { default as ScholarshipTab } from './components/ScholarshipTab.vue'
export { default as EditScholarshipDialog } from './components/EditScholarshipDialog.vue'
export { scholarshipApi } from './api/scholarshipApi'
export type {
  Scholarship,
  ScholarshipEditData,
  ScholarshipCreatePayload,
  ScholarshipUpdatePayload,
  ScholarshipTabData,
  ScholarshipStatus,
} from './types'
