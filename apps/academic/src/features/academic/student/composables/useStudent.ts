import { storeToRefs } from 'pinia'
import { useStudentStore } from '../stores/studentStore'
import { studentService } from '../services/studentService'

export function useStudent() {
  const store = useStudentStore()
  const refs = storeToRefs(store)

  const setPage = async (page: number) => {
    store.currentPage = page
    await studentService.fetchStudents()
  }

  const setPageSize = async (size: number) => {
    store.pageSize = size
    store.currentPage = 1
    await studentService.fetchStudents()
  }

  return {
    ...refs,

    fetchStudents: studentService.fetchStudents,
    fetchClassrooms: studentService.fetchClassrooms,
    fetchGrades: studentService.fetchGrades,
    saveStudent: studentService.saveStudent,
    deleteStudent: studentService.deleteStudent,
    toggleActive: studentService.toggleActive,
    exportStudents: studentService.exportStudents,
    getImportTemplate: studentService.getImportTemplate,
    bulkImport: studentService.bulkImport,
    updateStudentAccount: studentService.updateStudentAccount,
    updateStudentCredentials: studentService.updateStudentCredentials,
    setPage,
    setPageSize,
  }
}
