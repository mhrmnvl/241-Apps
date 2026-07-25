import { teacherService } from '../services/teacherService'
import type { Teacher, BulkImportRowResult } from '../types'
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

export function useTeacherImportExport(options: {
  teachers: Ref<Teacher[]>
  onImportSuccess: () => void
}) {
  const isImportExportOpen = ref(false)
  const isImporting = ref(false)
  const isConflictDialogOpen = ref(false)
  const isResolvingConflicts = ref(false)
  const conflictRows = ref<BulkImportRowResult[]>([])

  async function downloadTemplate() {
    try {
      const response = await teacherService.getImportTemplate()
      downloadArrayBuffer(response.data, 'template_import_pegawai.xlsx')
    } catch (err) {
      toast.error(
        getIndonesianErrorMessage(err, 'Gagal mengunduh template import guru'),
      )
    }
  }

  async function exportData() {
    try {
      const response = await teacherService.exportTeachers()
      const dateStr = new Date().toISOString().split('T')[0]
      downloadArrayBuffer(response.data, `Data_Pegawai_${dateStr}.xlsx`)
    } catch (err) {
      toast.error(getIndonesianErrorMessage(err, 'Gagal mengekspor data guru'))
    }
  }

  async function handleFileUpload(file: File) {
    isImporting.value = true
    try {
      const response = await teacherService.bulkImport(file)
      const result = response.data.data

      if (typeof result?.total === 'undefined') {
        toast.success('File berhasil diunggah.')
        isImportExportOpen.value = false
        options.onImportSuccess()
        return
      }

      conflictRows.value = result.results
      isImportExportOpen.value = false
      isConflictDialogOpen.value = true

      const hasSuccess = result.results.some((r) => r.status === 'SUCCESS')
      if (result.success > 0 || hasSuccess) {
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

  async function handleResolveConflicts(
    decisions: {
      existingId?: string
      action: 'update' | 'skip'
      data: NonNullable<BulkImportRowResult['data']>
    }[],
  ) {
    isResolvingConflicts.value = true
    try {
      const response =
        await teacherService.resolveBulkImportConflicts(decisions)
      const result = response.data.data

      const parts: string[] = []
      if (result.updated > 0) parts.push(`${result.updated} diperbarui`)
      if (result.skipped > 0) parts.push(`${result.skipped} dilewati`)
      toast.success(`Selesai: ${parts.join(', ') || 'tidak ada perubahan'}.`)

      isConflictDialogOpen.value = false
      isImportExportOpen.value = false
      options.onImportSuccess()
    } catch (err) {
      toast.error(
        getIndonesianErrorMessage(
          err,
          'Terjadi kesalahan saat memperbarui data.',
        ),
      )
    } finally {
      isResolvingConflicts.value = false
    }
  }

  return {
    isImportExportOpen,
    isImporting,
    isConflictDialogOpen,
    isResolvingConflicts,
    conflictRows,
    downloadTemplate,
    exportData,
    handleFileUpload,
    handleResolveConflicts,
  }
}
