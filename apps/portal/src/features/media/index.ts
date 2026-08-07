// Public API of the media feature. Everything the app consumes goes through
// here — never a deep import into components/, api/, or services/.
export { default as MediaLibraryDialog } from './components/MediaLibraryDialog.vue'
export { mediaService } from './services/mediaService'
export * from './types'
