import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { inventoryApi } from '../api/inventoryApi'
import type { ApprovalWorkflow, ApprovalInstance } from '../types'

/** The approval queue and the workflow definitions behind it. */
export const approvalService = {
  listPending: async (): Promise<ApprovalInstance[]> => {
    try {
      const res = await inventoryApi.getPendingApprovals()
      return res.data?.data ?? []
    } catch (e) {
      toast.error(
        getIndonesianErrorMessage(
          e,
          'Gagal memuat daftar persetujuan peminjaman.',
        ),
      )
      return []
    }
  },

  listWorkflows: async (): Promise<ApprovalWorkflow[]> => {
    try {
      const res = await inventoryApi.getWorkflows()
      return res.data?.data ?? []
    } catch (error) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat alur persetujuan.'),
      )
      return []
    }
  },

  process: async (
    id: string,
    action: 'APPROVE' | 'REJECT',
    note?: string,
  ): Promise<boolean> => {
    try {
      await inventoryApi.processApproval(id, { action, note })
      toast.success(
        action === 'APPROVE'
          ? 'Pengajuan berhasil disetujui.'
          : 'Pengajuan berhasil ditolak.',
      )
      return true
    } catch (e) {
      toast.error(getIndonesianErrorMessage(e, 'Gagal memproses persetujuan.'))
      return false
    }
  },
}
