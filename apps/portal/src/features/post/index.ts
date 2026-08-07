// Public API of the post feature. Everything the app consumes goes through
// here — never a deep import into views/, api/, or stores/.
export { portalPostRoutes, portalPublicPostRoutes } from './routes'
export { postService } from './services/postService'
export { usePostStore } from './stores/postStore'
export { usePublicPostStore } from './stores/publicPostStore'
export { default as PostCard } from './components/PostCard.vue'
// Shared with the page feature: informational pages use the same authoring
// surface, and forking it would give the portal two editors to keep in step.
export { default as RichTextEditor } from './components/RichTextEditor.vue'
export * from './types'
