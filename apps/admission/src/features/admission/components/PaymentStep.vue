<script setup lang="ts">
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { PAYMENT_STATUS_LABELS } from '../types'
import type { AdmissionPayment } from '../types'
import type { PaymentForm } from '../composables/useApplicationFormState'
import { formatIDR } from '../utils'

defineProps<{
  applicationPayment: AdmissionPayment | null
  editable: boolean
  paymentFile: File | null
  uploadingPayment: boolean
  onFileChange: (event: Event) => void
  onUpload: () => void
}>()

const payment = defineModel<PaymentForm>({ required: true })
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-md border p-4 text-sm">
      <p>
        Biaya pendaftaran:
        <span class="font-semibold">
          {{ applicationPayment ? formatIDR(applicationPayment.amount) : '-' }}
        </span>
      </p>
      <p class="mt-1 text-muted-foreground">
        Status:
        {{
          applicationPayment
            ? PAYMENT_STATUS_LABELS[applicationPayment.status]
            : '-'
        }}
        <span
          v-if="applicationPayment?.note"
          class="text-destructive"
        >
          — {{ applicationPayment.note }}
        </span>
      </p>
    </div>

    <div
      v-if="editable && applicationPayment?.status !== 'VERIFIED'"
      class="grid gap-4 sm:grid-cols-2"
    >
      <div class="space-y-2">
        <Label>Nama Bank</Label>
        <Input
          v-model="payment.bankName"
          placeholder="cth. BSI"
        />
      </div>
      <div class="space-y-2">
        <Label>Nama Pengirim</Label>
        <Input v-model="payment.senderAccountName" />
      </div>
      <div class="space-y-2">
        <Label>Tanggal Transfer</Label>
        <Input
          v-model="payment.transferDate"
          type="date"
        />
      </div>
      <div class="space-y-2">
        <Label>Bukti Transfer (JPG/PNG/PDF)</Label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          class="text-sm"
          @change="onFileChange"
        />
      </div>
      <div class="sm:col-span-2">
        <Button
          :disabled="uploadingPayment"
          @click="onUpload"
        >
          {{ uploadingPayment ? 'Mengunggah…' : 'Unggah Bukti Pembayaran' }}
        </Button>
      </div>
    </div>
  </div>
</template>
