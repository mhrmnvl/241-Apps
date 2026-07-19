import { isAxiosError } from 'axios'
import { schoolUnitApi } from '../api/schoolUnitApi'
import { useSchoolUnitStore } from '../stores/schoolUnitStore'
import type { SchoolUnitAddress, SchoolUnitProfile } from '../types'
import { toSchoolUnitAddress, toSchoolUnitProfile } from '../utils'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'

type SchoolUnitStore = ReturnType<typeof useSchoolUnitStore>

function applySchoolUnitData(
  store: SchoolUnitStore,
  data: Partial<SchoolUnitProfile> | null,
) {
  const nextSchoolUnit = toSchoolUnitProfile(data)
  Object.assign(store.schoolUnit, nextSchoolUnit)
  Object.assign(store.draftSchoolUnit, nextSchoolUnit)
}

function applyAddressData(
  store: SchoolUnitStore,
  data: Partial<SchoolUnitAddress> | null,
) {
  const nextAddress = toSchoolUnitAddress(data)
  Object.assign(store.address, nextAddress)
  Object.assign(store.draftAddress, nextAddress)
}

export const schoolUnitService = {
  schoolUnitApi,

  loadSchoolUnitData: async () => {
    const store = useSchoolUnitStore()
    store.isLoading = true
    store.loadError = null
    store.isNotSetUp = false

    try {
      const [schoolUnitRes, addressRes] = await Promise.all([
        schoolUnitApi.getSchoolUnit(),
        schoolUnitApi.getSchoolUnitAddress().catch((error: unknown) => {
          if (isAxiosError(error)) {
            const message = (error.response?.data as { message?: string })
              ?.message
            if (message && /address has not been set yet/i.test(message)) {
              return { data: { data: null } }
            }
          }
          throw error
        }),
      ])

      store.isSetUp = true
      store.hasAddress = Boolean(addressRes.data.data)

      applySchoolUnitData(store, schoolUnitRes.data.data)
      applyAddressData(store, addressRes.data.data ?? null)
    } catch (error: unknown) {
      let isSetupError = false
      if (isAxiosError(error)) {
        const message = (error.response?.data as { message?: string })?.message
        if (
          error.response?.status === 404 &&
          message &&
          /school unit has not been set up yet/i.test(message)
        ) {
          isSetupError = true
        }
      }

      store.loadError = getIndonesianErrorMessage(
        error,
        'Gagal memuat data unit sekolah dari backend.',
      )

      if (isSetupError) {
        store.isNotSetUp = true
        store.isSetUp = false
        store.hasAddress = false
      } else {
        store.isNotSetUp = false
      }

      applySchoolUnitData(store, null)
      applyAddressData(store, null)
    } finally {
      store.isLoading = false
    }
  },

  initializeEditForm: () => {
    const store = useSchoolUnitStore()
    store.schoolUnitFormError = null
    store.addressFormError = null
    Object.assign(store.draftSchoolUnit, store.schoolUnit)
    Object.assign(store.draftAddress, store.address)
  },

  saveSchoolUnitInfo: async () => {
    const store = useSchoolUnitStore()
    store.schoolUnitFormError = null

    store.isSavingSchoolUnit = true
    try {
      const { id: _id, type: _type, ...payload } = store.draftSchoolUnit
      const res = await (store.isSetUp
        ? schoolUnitApi.updateSchoolUnit(payload)
        : schoolUnitApi.createSchoolUnit(payload))
      store.isSetUp = true
      store.isNotSetUp = false
      store.loadError = null
      applySchoolUnitData(store, res.data.data)
      toast.success('Informasi unit sekolah berhasil disimpan.')
    } catch (error: unknown) {
      store.schoolUnitFormError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan informasi unit sekolah.',
      )
      toast.error('Gagal menyimpan informasi unit sekolah.', {
        description: store.schoolUnitFormError,
      })
    } finally {
      store.isSavingSchoolUnit = false
    }
  },

  saveAddressInfo: async () => {
    const store = useSchoolUnitStore()
    store.addressFormError = null

    store.isSavingAddress = true
    try {
      const res = await (store.hasAddress
        ? schoolUnitApi.updateSchoolUnitAddress(store.draftAddress)
        : schoolUnitApi.createSchoolUnitAddress(store.draftAddress))
      store.hasAddress = true
      applyAddressData(store, res.data.data)
      toast.success('Alamat unit sekolah berhasil disimpan.')
    } catch (error: unknown) {
      store.addressFormError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan alamat unit sekolah.',
      )
      toast.error('Gagal menyimpan alamat unit sekolah.', {
        description: store.addressFormError,
      })
    } finally {
      store.isSavingAddress = false
    }
  },
}
