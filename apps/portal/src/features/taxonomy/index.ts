// Public API of the taxonomy feature. Everything the app consumes goes through
// here — never a deep import into views/, api/, or config/.
export { portalTaxonomyRoutes } from './routes'
export { categoryService, tagService } from './services/taxonomyService'
export { useCategoryConfig } from './config/categoryConfig'
export { useTagConfig } from './config/tagConfig'
export * from './types'
