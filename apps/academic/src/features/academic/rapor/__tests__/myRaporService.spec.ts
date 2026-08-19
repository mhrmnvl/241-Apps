import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('../api/raporApi', () => ({
  raporApi: { getMine: vi.fn() },
}))

vi.mock('vue-sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

import { raporApi } from '../api/raporApi'
import { raporService } from '../services/raporService'
import { useRaporStore } from '../stores/raporStore'

/**
 * What the student's report-card screen must and must not do.
 *
 * The "must not" is the interesting half. A failure here has to stay a
 * failure: falling back to the school-wide list would turn one student's empty
 * screen into everyone's report cards, and it would look like a fix.
 */
describe('raporService.fetchMine', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('stores what the self-service read returns, summary included', async () => {
    vi.mocked(raporApi.getMine).mockResolvedValue({
      data: {
        data: [{ id: 'rap-1' }],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          summary: { published: 1, draft: 0, averageScore: 82.5 },
        },
      },
    } as never)

    await raporService.fetchMine()
    const store = useRaporStore()

    expect(store.rapors).toHaveLength(1)
    expect(store.totalItems).toBe(1)
    expect(store.summary).toEqual({
      published: 1,
      draft: 0,
      averageScore: 82.5,
    })
  })

  it('never calls the school-wide list', async () => {
    vi.mocked(raporApi.getMine).mockResolvedValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 10 } },
    } as never)

    await raporService.fetchMine()

    // `getRapors` is not even mocked here: if the service reached for it, the
    // module mock would make it undefined and this would throw.
    expect(raporApi.getMine).toHaveBeenCalledTimes(1)
  })

  it('leaves the screen empty when the read fails, rather than widening it', async () => {
    vi.mocked(raporApi.getMine).mockRejectedValue(new Error('403'))

    await raporService.fetchMine()
    const store = useRaporStore()

    expect(store.rapors).toEqual([])
    expect(store.totalItems).toBe(0)
    expect(store.summary).toBeNull()
  })

  it('treats a missing summary as absent rather than zero', async () => {
    vi.mocked(raporApi.getMine).mockResolvedValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 10 } },
    } as never)

    await raporService.fetchMine()

    // Null, not `{ published: 0, ... }` — the screen shows a summary card only
    // when there is a summary to show.
    expect(useRaporStore().summary).toBeNull()
  })
})
