import { EMPTY_ADDRESS, EMPTY_SCHOOL_UNIT } from '../constants'
import type { SchoolUnitAddress, SchoolUnitProfile } from '../types'
import {
  hasSchoolUnitAddressChanges,
  hasSchoolUnitProfileChanges,
} from '../utils'
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

export const useSchoolUnitStore = defineStore('school-unit', () => {
  const schoolUnit = reactive<SchoolUnitProfile>({ ...EMPTY_SCHOOL_UNIT })
  const address = reactive<SchoolUnitAddress>({ ...EMPTY_ADDRESS })

  const draftSchoolUnit = reactive<SchoolUnitProfile>({
    ...EMPTY_SCHOOL_UNIT,
  })
  const draftAddress = reactive<SchoolUnitAddress>({ ...EMPTY_ADDRESS })

  const isLoading = ref(true)
  const loadError = ref<string | null>(null)

  const isSetUp = ref(false)
  const hasAddress = ref(false)
  const isNotSetUp = ref(false)

  const schoolUnitFormError = ref<string | null>(null)
  const addressFormError = ref<string | null>(null)

  const isSavingSchoolUnit = ref(false)
  const isSavingAddress = ref(false)

  const hasSchoolUnitChanges = computed(() => {
    return hasSchoolUnitProfileChanges(schoolUnit, draftSchoolUnit)
  })

  const hasAddressChanges = computed(() => {
    return hasSchoolUnitAddressChanges(address, draftAddress)
  })

  return {
    schoolUnit,
    address,
    draftSchoolUnit,
    draftAddress,
    isLoading,
    loadError,
    isSetUp,
    hasAddress,
    isNotSetUp,
    schoolUnitFormError,
    addressFormError,
    isSavingSchoolUnit,
    isSavingAddress,
    hasSchoolUnitChanges,
    hasAddressChanges,
  }
})
