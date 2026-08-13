import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { inventoryApi } from '../api/inventoryApi'
import { inventoryReferenceService } from './inventoryReferenceService'
import type { InventoryReferenceItem } from '../types'

/**
 * The five classification lists, which differ only in their name.
 *
 * Categories, conditions, locations, statuses and funding sources each had a
 * list view carrying its own copy of the same fetch, save and delete — fifteen
 * near-identical handlers whose only differences were an endpoint segment and
 * the Indonesian noun in the toast. They are one thing here, and the noun is
 * data.
 *
 * Consolidating them closed a defect none of the five had on its own: these are
 * exactly what `/inventory/metadata` returns, so editing a category left every
 * asset screen's held copy stale. Every write now invalidates it.
 */
export type InventoryReferenceType =
  | 'categories'
  | 'conditions'
  | 'locations'
  | 'statuses'
  | 'funding-sources'

interface ReferenceLabels {
  /** "kategori aset", "sumber dana" — reads inside every message below. */
  noun: string
  /** Capitalised, for the sentence that starts with it. */
  Noun: string
}

const LABELS: Record<InventoryReferenceType, ReferenceLabels> = {
  categories: { noun: 'kategori aset', Noun: 'Kategori aset' },
  conditions: { noun: 'kondisi aset', Noun: 'Kondisi aset' },
  locations: { noun: 'lokasi', Noun: 'Lokasi' },
  statuses: { noun: 'status aset', Noun: 'Status aset' },
  'funding-sources': { noun: 'sumber dana', Noun: 'Sumber dana' },
}

export function inventoryReferenceCrud(type: InventoryReferenceType) {
  const { noun, Noun } = LABELS[type]

  return {
    list: async (search?: string): Promise<InventoryReferenceItem[]> => {
      try {
        // An empty search is omitted rather than sent as '': the endpoint
        // filters on presence, so a blank term would match nothing. Compared
        // explicitly because `??` keeps '' and would do exactly that.
        const trimmed = search?.trim()
        const response = await inventoryApi.getReferences(
          type,
          trimmed === '' ? undefined : trimmed,
        )
        return response.data.data ?? []
      } catch (e) {
        toast.error(getIndonesianErrorMessage(e, `Gagal memuat data ${noun}.`))
        return []
      }
    },

    save: async (
      id: string | null,
      payload: Omit<InventoryReferenceItem, 'id'>,
    ): Promise<boolean> => {
      try {
        if (id) {
          await inventoryApi.updateReference(type, id, payload)
          toast.success(`Data ${noun} berhasil diperbarui.`)
        } else {
          await inventoryApi.createReference(type, payload)
          toast.success(`${Noun} baru berhasil ditambahkan.`)
        }
        inventoryReferenceService.invalidate()
        return true
      } catch (e) {
        toast.error(
          getIndonesianErrorMessage(e, `Gagal menyimpan data ${noun}.`),
        )
        return false
      }
    },

    remove: async (id: string): Promise<boolean> => {
      try {
        await inventoryApi.deleteReference(type, id)
        toast.success(`Data ${noun} berhasil dihapus.`)
        inventoryReferenceService.invalidate()
        return true
      } catch (e) {
        toast.error(
          getIndonesianErrorMessage(e, `Gagal menghapus data ${noun}.`),
        )
        return false
      }
    },
  }
}
