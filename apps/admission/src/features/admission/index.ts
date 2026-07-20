// Public surface of the admission feature (mirrors the per-feature barrel
// convention used across the academic app).

export { admissionRoutes } from './routes'
export { admissionApi } from './api/admissionApi'

// Composables
export { useWaveList } from './composables/useWaveList'
export { useAnnouncementList } from './composables/useAnnouncementList'
export { useApplicationList } from './composables/useApplicationList'
export { useApplicationDetail } from './composables/useApplicationDetail'
export { useAdmissionStats } from './composables/useAdmissionStats'
export { usePublicAdmission } from './composables/usePublicAdmission'
export { useMyApplication } from './composables/useMyApplication'

// Services
export { waveService } from './services/waveService'
export { announcementService } from './services/announcementService'
export { applicationService } from './services/applicationService'
export { applicationDetailService } from './services/applicationDetailService'
export { statsService } from './services/statsService'
export { publicAdmissionService } from './services/publicAdmissionService'
export { myApplicationService } from './services/myApplicationService'

// Types
export * from './types'
