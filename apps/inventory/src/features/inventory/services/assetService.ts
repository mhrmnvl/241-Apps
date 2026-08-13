import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { inventoryApi } from '../api/inventoryApi'
import type {
  AssetQueryParams,
  AssetSavePayload,
  InventoryAsset,
} from '../types'

/**
 * Assets and the units under them.
 *
 * Each of these lived inline in a view, which is how the feature ended up with
 * fourteen components talking to `inventoryApi` and no layer between them.
 * They are collected here so a view states what it wants and renders the
 * answer, per the architecture in CLAUDE.md.
 *
 * The pattern is uniform on purpose: a read returns the value or a safe empty
 * one after saying what went wrong, and a write returns whether it succeeded.
 * A view branches on that boolean rather than on a caught exception.
 */
export const assetService = {
  list: async (
    params?: AssetQueryParams,
  ): Promise<{ items: InventoryAsset[]; total: number }> => {
    try {
      const response = await inventoryApi.getAssets(params)
      const items = response.data?.data ?? []
      return { items, total: response.data?.meta?.total ?? items.length }
    } catch (e) {
      toast.error(getIndonesianErrorMessage(e, 'Gagal memuat data aset.'))
      return { items: [], total: 0 }
    }
  },

  /** Throws: the two callers load it beside other data and report jointly. */
  fetchOne: async (id: string): Promise<InventoryAsset | null> => {
    const response = await inventoryApi.getAssetById(id)
    return response.data?.data ?? null
  },

  create: async (payload: AssetSavePayload): Promise<boolean> => {
    try {
      await inventoryApi.createAsset(payload)
      toast.success('Aset baru berhasil ditambahkan.')
      return true
    } catch (e) {
      toast.error(getIndonesianErrorMessage(e, 'Gagal menambahkan aset baru.'))
      return false
    }
  },

  /** Parent/catalogue fields only; per-unit fields are managed per unit. */
  update: async (id: string, payload: AssetSavePayload): Promise<boolean> => {
    try {
      await inventoryApi.updateAsset(id, {
        name: payload.name,
        categoryId: payload.categoryId,
        brand: payload.brand,
        model: payload.model,
        purchaseDate: payload.purchaseDate,
        purchasePrice: payload.purchasePrice,
        fundingSourceId: payload.fundingSourceId,
        notes: payload.notes,
      })
      toast.success('Detail data aset berhasil diperbarui.')
      return true
    } catch (e) {
      toast.error(getIndonesianErrorMessage(e, 'Gagal memperbarui data aset.'))
      return false
    }
  },

  remove: async (id: string): Promise<boolean> => {
    try {
      await inventoryApi.deleteAsset(id)
      toast.success('Data aset berhasil dihapus.')
      return true
    } catch (e) {
      toast.error(getIndonesianErrorMessage(e, 'Gagal menghapus data aset.'))
      return false
    }
  },

  addUnit: async (
    assetId: string,
    defaults: { conditionId: string; statusId: string; locationId: string },
  ): Promise<boolean> => {
    try {
      await inventoryApi.addUnits(assetId, { quantity: 1, ...defaults })
      toast.success('Unit baru berhasil ditambahkan.')
      return true
    } catch (e) {
      toast.error(getIndonesianErrorMessage(e, 'Gagal menambah unit.'))
      return false
    }
  },

  updateUnit: async (
    unitId: string,
    payload: {
      conditionId: string
      statusId: string
      locationId: string
      barcode?: string
      notes?: string
    },
  ): Promise<boolean> => {
    try {
      await inventoryApi.updateAssetUnit(unitId, payload)
      toast.success('Unit berhasil diperbarui.')
      return true
    } catch (e) {
      toast.error(getIndonesianErrorMessage(e, 'Gagal memperbarui unit.'))
      return false
    }
  },

  removeUnit: async (unitId: string): Promise<boolean> => {
    try {
      await inventoryApi.deleteAssetUnit(unitId)
      toast.success('Unit berhasil dihapus.')
      return true
    } catch (e) {
      toast.error(getIndonesianErrorMessage(e, 'Gagal menghapus unit.'))
      return false
    }
  },
}
