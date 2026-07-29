import { describe, it, expect, vi } from 'vitest'
import { useEmploymentTypeOptions } from './useEmploymentTypeOptions'

const mockGet = vi.hoisted(() => vi.fn())

vi.mock('@/shared/utils/api', () => ({
  default: { get: mockGet },
}))

describe('useEmploymentTypeOptions', () => {
  it('fetches employment types and stores them', async () => {
    mockGet.mockResolvedValue({
      data: {
        data: [{ id: 'et-1', code: 'PNS', name: 'PNS' }],
      },
    })

    const { employmentTypes, fetchEmploymentTypes } = useEmploymentTypeOptions()
    await fetchEmploymentTypes()

    expect(mockGet).toHaveBeenCalledWith('/employment-types', {
      params: { limit: 100 },
    })
    expect(employmentTypes.value).toEqual([
      { id: 'et-1', code: 'PNS', name: 'PNS' },
    ])
  })

  it('falls back to an empty list when the response has no data', async () => {
    mockGet.mockResolvedValue({ data: {} })

    const { employmentTypes, fetchEmploymentTypes } = useEmploymentTypeOptions()
    await fetchEmploymentTypes()

    expect(employmentTypes.value).toEqual([])
  })

  it('silently keeps the list empty when the request fails', async () => {
    mockGet.mockRejectedValue(new Error('network error'))

    const { employmentTypes, fetchEmploymentTypes } = useEmploymentTypeOptions()
    await fetchEmploymentTypes()

    expect(employmentTypes.value).toEqual([])
  })
})
