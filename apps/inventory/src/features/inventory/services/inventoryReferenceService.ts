import { inventoryApi } from '../api/inventoryApi'
import { useReferenceList } from '@/features/platform/reference-data'
import type { InventoryMetadata } from '../types'

/**
 * The classification parameters every asset screen picks from.
 *
 * `/inventory/metadata` returns categories, conditions, locations and funding
 * sources as one bundle, and four views were each fetching it inline on mount —
 * the asset list, the create form, the edit form and the label printer. Moving
 * between any two of them re-fetched the lot.
 *
 * One entry rather than four keys: the endpoint returns them together, they are
 * edited together while the register is set up, and splitting them here would
 * invent a granularity the API does not have.
 */
export const inventoryReferenceService = {
  fetchMetadata: async (): Promise<InventoryMetadata | null> => {
    return useReferenceList().read('inventoryMetadata', async () => {
      const response = await inventoryApi.getInventoryMetadata()
      return response.data?.data ?? null
    })
  },

  /** Call after editing a category, condition, location or funding source. */
  invalidate: () => {
    useReferenceList().invalidate('inventoryMetadata')
  },
}
