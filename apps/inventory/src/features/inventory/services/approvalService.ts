import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { inventoryApi } from '../api/inventoryApi'
import type {
  ApprovalWorkflow,
  ApprovalInstance,
  CreateWorkflowPayload,
} from '../types'

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

  /**
   * Creating a workflow retires the one it replaces, so a loan can never be
   * caught between two active definitions. Approvals already in flight keep the
   * steps they started with — the backend holds that line, not this call.
   */
  createWorkflow: async (payload: CreateWorkflowPayload): Promise<boolean> => {
    try {
      await inventoryApi.createWorkflow(payload)
      toast.success('Alur persetujuan berhasil disimpan.')
      return true
    } catch (e) {
      toast.error(
        getIndonesianErrorMessage(e, 'Gagal menyimpan alur persetujuan.'),
      )
      return false
    }
  },

  /**
   * `forwardToNextApprover` only reaches an optional next step: a mandatory one
   * is taken regardless, and the backend decides that — the screen never
   * assumes an approval is final.
   */
  process: async (
    id: string,
    action: 'APPROVE' | 'REJECT',
    note?: string,
    forwardToNextApprover?: boolean,
  ): Promise<boolean> => {
    try {
      const res = await inventoryApi.processApproval(id, {
        action,
        note,
        forwardToNextApprover,
      })
      // The backend says whether the loan is done or now sits with the next
      // approver, so the message tells the truth rather than guessing it.
      const outcome = res.data?.data?.action
      toast.success(
        outcome === 'REJECT'
          ? 'Pengajuan berhasil ditolak.'
          : outcome === 'APPROVE_STEP'
            ? 'Disetujui dan diteruskan ke penyetuju berikutnya.'
            : 'Pengajuan berhasil disetujui.',
      )
      return true
    } catch (e) {
      toast.error(getIndonesianErrorMessage(e, 'Gagal memproses persetujuan.'))
      return false
    }
  },
}
