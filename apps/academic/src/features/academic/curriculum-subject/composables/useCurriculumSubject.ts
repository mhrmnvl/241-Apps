import { storeToRefs } from 'pinia'
import { useCurriculumSubjectStore } from '../stores/curriculumSubjectStore'
import { curriculumSubjectService } from '../services/curriculumSubjectService'

export function useCurriculumSubject() {
  const store = useCurriculumSubjectStore()
  const {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    subjects,
    classroomLevels,
    selectedClassroomLevelId,
    curriculumName,
    curriculumAcademicYear,
  } = storeToRefs(store)

  return {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    subjects,
    classroomLevels,
    selectedClassroomLevelId,
    curriculumName,
    curriculumAcademicYear,
    fetchReferenceData: curriculumSubjectService.fetchReferenceData,
    fetchCurriculumSubjects: curriculumSubjectService.fetchCurriculumSubjects,
    fetchCurriculumInfo: curriculumSubjectService.fetchCurriculumInfo,
    saveCurriculumSubject: curriculumSubjectService.saveCurriculumSubject,
    deleteCurriculumSubject: curriculumSubjectService.deleteCurriculumSubject,
  }
}
