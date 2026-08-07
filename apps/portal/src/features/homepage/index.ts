// Public API of the homepage feature. Everything the app consumes goes through
// here — never a deep import into views/, api/, or stores/.
export { portalHomeRoutes } from './routes'
export { homepageService } from './services/homepageService'
export { useHomepageStore } from './stores/homepageStore'
export * from './types'
