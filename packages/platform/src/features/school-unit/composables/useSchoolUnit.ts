import { schoolUnitService } from '../services/schoolUnitService'
import { useSchoolUnitStore } from '../stores/schoolUnitStore'
import { storeToRefs } from 'pinia'

export function useSchoolUnit() {
  const store = useSchoolUnitStore()

  const {
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
  } = storeToRefs(store)

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
    loadSchoolUnitData: schoolUnitService.loadSchoolUnitData,
    initializeEditForm: schoolUnitService.initializeEditForm,
    saveSchoolUnitInfo: schoolUnitService.saveSchoolUnitInfo,
    saveAddressInfo: schoolUnitService.saveAddressInfo,
  }
}
