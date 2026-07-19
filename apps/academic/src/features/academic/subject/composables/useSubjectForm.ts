import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSubjectStore } from '../stores/subjectStore'
import { subjectService } from '../services/subjectService'
import type { Teacher } from '@/features/academic/teacher'

export function useSubjectForm() {
  const store = useSubjectStore()
  const { isSaving, formError } = storeToRefs(store)
  const teachers = ref<Teacher[]>([])

  const fetchTeachers = async () => {
    try {
      teachers.value = await subjectService.fetchTeachers()
    } catch {
      teachers.value = []
    }
  }

  return {
    isSaving,
    formError,
    teachers,
    fetchTeachers,
    saveSubject: subjectService.saveSubject,
  }
}
