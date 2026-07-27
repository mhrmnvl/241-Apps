import { ref, type Ref } from 'vue'
import { toast } from 'vue-sonner'
import type { PaymentForm } from './useApplicationFormState'

interface PaymentProofPayload {
  bankName: string
  senderAccountName: string
  transferDate?: string
}

export interface UseApplicationUploadsOptions {
  payment: Ref<PaymentForm>
  uploadDocumentReq: (
    typeCode: string,
    file: File,
  ) => Promise<{ success: boolean }>
  uploadPaymentProofReq: (
    payload: PaymentProofPayload,
    file: File,
  ) => Promise<{ success: boolean }>
  refresh: () => Promise<void>
}

export function useApplicationUploads(options: UseApplicationUploadsOptions) {
  const documentFiles = ref<Record<string, File | null>>({})
  const uploadingDoc = ref<string | null>(null)

  function onDocumentFileChange(typeCode: string, event: Event) {
    const input = event.target as HTMLInputElement
    documentFiles.value[typeCode] = input.files?.[0] ?? null
  }

  async function uploadDocument(typeCode: string) {
    const file = documentFiles.value[typeCode]
    if (!file) {
      toast.error('Pilih berkas terlebih dahulu.')
      return
    }
    uploadingDoc.value = typeCode
    const result = await options.uploadDocumentReq(typeCode, file)
    if (result.success) {
      await options.refresh()
      documentFiles.value[typeCode] = null
      toast.success('Berkas berhasil diunggah.')
    }
    uploadingDoc.value = null
  }

  const paymentFile = ref<File | null>(null)
  const uploadingPayment = ref(false)

  function onPaymentFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    paymentFile.value = input.files?.[0] ?? null
  }

  async function uploadPayment() {
    if (
      !options.payment.value.bankName ||
      !options.payment.value.senderAccountName
    ) {
      toast.error('Isi nama bank dan nama pengirim.')
      return
    }
    if (!paymentFile.value) {
      toast.error('Pilih berkas bukti transfer.')
      return
    }
    uploadingPayment.value = true
    const result = await options.uploadPaymentProofReq(
      {
        bankName: options.payment.value.bankName,
        senderAccountName: options.payment.value.senderAccountName,
        transferDate: options.payment.value.transferDate || undefined,
      },
      paymentFile.value,
    )
    if (result.success) {
      await options.refresh()
      paymentFile.value = null
      toast.success('Bukti pembayaran berhasil diunggah.')
    }
    uploadingPayment.value = false
  }

  return {
    documentFiles,
    uploadingDoc,
    onDocumentFileChange,
    uploadDocument,
    paymentFile,
    uploadingPayment,
    onPaymentFileChange,
    uploadPayment,
  }
}
