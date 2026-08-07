// Public API of the page feature. Everything the app consumes goes through
// here — never a deep import into views/, api/, or stores/.
export { portalPageRoutes, portalPublicPageRoutes } from './routes'
export { pageService, navigationService } from './services/pageService'
export { usePageStore } from './stores/pageStore'
export * from './types'
