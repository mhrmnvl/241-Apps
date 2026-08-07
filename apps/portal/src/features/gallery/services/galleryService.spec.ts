import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { galleryService } from './galleryService'
import { useGalleryStore } from '../stores/galleryStore'

/**
 * `vi.hoisted` for the same reason `postService.spec.ts` needs it: `vi.mock` is
 * lifted above ordinary `const` declarations, so the factory would close over an
 * uninitialised binding.
 */
type ApiCall = (...args: never[]) => Promise<unknown>

const { list } = vi.hoisted(() => ({ list: vi.fn<ApiCall>() }))

vi.mock('../api/galleryApi', () => ({
  galleryApi: {},
  publicGalleryApi: { list },
}))

vi.mock('vue-sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const album = {
  id: 'album-1',
  title: 'Pentas Seni 2026',
  slug: 'pentas-seni-2026',
  coverImageUrl: null,
  eventDate: '2026-05-01',
  photoCount: 12,
}

describe('galleryService.fetchPublicList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  /**
   * The regression this exists for (FR-021). The service used to read `data.data`
   * and drop `data.meta` on the floor, so the store never learned a second page
   * existed and the pager could not render — an album listing silently truncated
   * at the first page with no way for a visitor to reach the rest.
   */
  it('captures the pagination meta the pager needs', async () => {
    list.mockResolvedValue({
      data: { data: [album], meta: { total: 40, page: 1, limit: 12 } },
    })

    await galleryService.fetchPublicList(1)

    const store = useGalleryStore()
    expect(store.publicTotal).toBe(40)
    expect(store.publicLimit).toBe(12)
  })

  // A response without meta must not zero the limit: dividing by zero pages
  // would hide the control rather than show one page.
  it('falls back to the item count when meta is absent', async () => {
    list.mockResolvedValue({ data: { data: [album] } })

    await galleryService.fetchPublicList(1)

    const store = useGalleryStore()
    expect(store.publicTotal).toBe(1)
    expect(store.publicLimit).toBeGreaterThan(0)
  })

  it('resets the total on failure so a stale pager does not survive an error', async () => {
    const store = useGalleryStore()
    store.publicTotal = 40
    list.mockRejectedValue(new Error('network'))

    await galleryService.fetchPublicList(2)

    expect(store.publicTotal).toBe(0)
    expect(store.unavailable).toBe(true)
  })
})
