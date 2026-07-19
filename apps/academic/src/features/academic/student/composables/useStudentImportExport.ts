import { studentService } from '../services/studentService'
import type { Student } from '../types'
import type { Classroom } from '@/features/academic/classroom'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { ref, type Ref } from 'vue'
import { toast } from 'vue-sonner'

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

function downloadArrayBuffer(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], { type: XLSX_MIME })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export function useStudentImportExport(options: {
  students: Ref<Student[]>
  classes: Ref<Classroom[]>
  onImportSuccess: () => void
}) {
  const isImportExportOpen = ref(false)
  const isImporting = ref(false)

  async function downloadTemplate() {
    try {
      const response = await studentService.getImportTemplate()
      downloadArrayBuffer(response.data, 'template_import_siswa.xlsx')
    } catch (err) {
      toast.error(
        getIndonesianErrorMessage(err, 'Gagal mengunduh template import siswa'),
      )
    }
  }

  async function exportData() {
    try {
      const response = await studentService.exportStudents()
      const dateStr = new Date().toISOString().split('T')[0]
      downloadArrayBuffer(response.data, `Data_Siswa_${dateStr}.xlsx`)
    } catch (err) {
      toast.error(getIndonesianErrorMessage(err, 'Gagal mengekspor data siswa'))
    }
  }

  async function handleFileUpload(file: File) {
    isImporting.value = true
    try {
      const response = await studentService.bulkImport(file)

      const result = response.data.data

      if (typeof result?.total === 'undefined') {
        toast.success('File berhasil diunggah.')
        isImportExportOpen.value = false
        options.onImportSuccess()
        return
      }

      if (result.success === 0 && result.failed > 0) {
        const firstErrors = result.results
          .filter((r) => r.status === 'FAILED')
          .slice(0, 3)
          .map((r) => `Baris ${r.row}: ${r.error}`)
          .join('\n')
        toast.error(
          `Import gagal: semua ${result.failed} baris tidak valid.\n${firstErrors}`,
          {
            duration: 8000,
          },
        )
      } else if (result.failed > 0) {
        toast.warning(
          `Import selesai: ${result.success} berhasil, ${result.failed} gagal dari ${result.total} baris.`,
          { duration: 6000 },
        )
        isImportExportOpen.value = false
        options.onImportSuccess()
      } else {
        toast.success(`Import berhasil: ${result.success} siswa ditambahkan.`)
        isImportExportOpen.value = false
        options.onImportSuccess()
      }
    } catch (err) {
      const errorMessage = getIndonesianErrorMessage(
        err,
        'Terjadi kesalahan saat mengunggah file import.',
      )
      toast.error(errorMessage)
    } finally {
      isImporting.value = false
    }
  }

  return {
    isImportExportOpen,
    isImporting,
    downloadTemplate,
    exportData,
    handleFileUpload,
  }
}
