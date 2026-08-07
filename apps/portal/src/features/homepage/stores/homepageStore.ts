import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HomepageSection, HomepageSectionSetting } from '../types'

export const useHomepageStore = defineStore('portal-homepage', () => {
  const sections = ref<HomepageSection[]>([])
  const settings = ref<HomepageSectionSetting[]>([])

  const loading = ref(false)
  const isSaving = ref(false)

  /**
   * True when the content service could not be reached. The page still renders
   * its static parts and shows a neutral notice where the sections would be —
   * a homepage that fails to load entirely is worse than one with a gap
   * (FR-032).
   */
  const unavailable = ref(false)

  return { sections, settings, loading, isSaving, unavailable }
})
