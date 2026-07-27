import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import type { PaymentForm } from './useApplicationFormState'
import { useApplicationUploads } from './useApplicationUploads'

vi.mock('vue-sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

function makeFile(name = 'doc.pdf'): File {
  return new File(['content'], name, { type: 'application/pdf' })
}

function makeChangeEvent(file: File | null): Event {
  return { target: { files: file ? [file] : [] } } as unknown as Event
}

describe('useApplicationUploads', () => {
  const payment = ref<PaymentForm>({
    bankName: '',
    senderAccountName: '',
    transferDate: '',
  })

  beforeEach(() => {
    vi.clearAllMocks()
    payment.value = { bankName: '', senderAccountName: '', transferDate: '' }
  })

  describe('document upload', () => {
    it('onDocumentFileChange stores the selected file by type code', () => {
      const { documentFiles, onDocumentFileChange } = useApplicationUploads({
        payment,
        uploadDocumentReq: vi.fn(),
        uploadPaymentProofReq: vi.fn(),
        refresh: vi.fn(),
      })

      const file = makeFile()
      onDocumentFileChange('KTP', makeChangeEvent(file))

      expect(documentFiles.value.KTP).toBe(file)
    })

    it('errors when uploading without a selected file', async () => {
      const uploadDocumentReq = vi.fn()
      const { uploadDocument } = useApplicationUploads({
        payment,
        uploadDocumentReq,
        uploadPaymentProofReq: vi.fn(),
        refresh: vi.fn(),
      })

      await uploadDocument('KTP')

      expect(uploadDocumentReq).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith('Pilih berkas terlebih dahulu.')
    })

    it('refreshes and clears the file on successful upload', async () => {
      const uploadDocumentReq = vi.fn().mockResolvedValue({ success: true })
      const refresh = vi.fn().mockResolvedValue(undefined)
      const { documentFiles, onDocumentFileChange, uploadDocument } =
        useApplicationUploads({
          payment,
          uploadDocumentReq,
          uploadPaymentProofReq: vi.fn(),
          refresh,
        })

      onDocumentFileChange('KTP', makeChangeEvent(makeFile()))
      await uploadDocument('KTP')

      expect(uploadDocumentReq).toHaveBeenCalledWith('KTP', expect.any(File))
      expect(refresh).toHaveBeenCalled()
      expect(documentFiles.value.KTP).toBeNull()
      expect(toast.success).toHaveBeenCalledWith('Berkas berhasil diunggah.')
    })

    it('keeps the file selected and skips refresh when the upload fails', async () => {
      const uploadDocumentReq = vi.fn().mockResolvedValue({ success: false })
      const refresh = vi.fn()
      const { documentFiles, onDocumentFileChange, uploadDocument } =
        useApplicationUploads({
          payment,
          uploadDocumentReq,
          uploadPaymentProofReq: vi.fn(),
          refresh,
        })

      onDocumentFileChange('KTP', makeChangeEvent(makeFile()))
      await uploadDocument('KTP')

      expect(refresh).not.toHaveBeenCalled()
      expect(documentFiles.value.KTP).not.toBeNull()
    })
  })

  describe('payment proof upload', () => {
    it('errors when bank name or sender name are missing', async () => {
      const uploadPaymentProofReq = vi.fn()
      const { uploadPayment } = useApplicationUploads({
        payment,
        uploadDocumentReq: vi.fn(),
        uploadPaymentProofReq,
        refresh: vi.fn(),
      })

      await uploadPayment()

      expect(uploadPaymentProofReq).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith(
        'Isi nama bank dan nama pengirim.',
      )
    })

    it('errors when no proof file is selected', async () => {
      payment.value = {
        bankName: 'BSI',
        senderAccountName: 'Budi',
        transferDate: '',
      }
      const uploadPaymentProofReq = vi.fn()
      const { uploadPayment } = useApplicationUploads({
        payment,
        uploadDocumentReq: vi.fn(),
        uploadPaymentProofReq,
        refresh: vi.fn(),
      })

      await uploadPayment()

      expect(uploadPaymentProofReq).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith('Pilih berkas bukti transfer.')
    })

    it('uploads the proof, refreshes, and clears the file on success', async () => {
      payment.value = {
        bankName: 'BSI',
        senderAccountName: 'Budi',
        transferDate: '2026-01-05',
      }
      const uploadPaymentProofReq = vi.fn().mockResolvedValue({ success: true })
      const refresh = vi.fn().mockResolvedValue(undefined)
      const { paymentFile, onPaymentFileChange, uploadPayment } =
        useApplicationUploads({
          payment,
          uploadDocumentReq: vi.fn(),
          uploadPaymentProofReq,
          refresh,
        })

      onPaymentFileChange(makeChangeEvent(makeFile('proof.jpg')))
      await uploadPayment()

      expect(uploadPaymentProofReq).toHaveBeenCalledWith(
        {
          bankName: 'BSI',
          senderAccountName: 'Budi',
          transferDate: '2026-01-05',
        },
        expect.any(File),
      )
      expect(refresh).toHaveBeenCalled()
      expect(paymentFile.value).toBeNull()
      expect(toast.success).toHaveBeenCalledWith(
        'Bukti pembayaran berhasil diunggah.',
      )
    })
  })
})
