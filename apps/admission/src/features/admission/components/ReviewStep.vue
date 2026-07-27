<script setup lang="ts">
import { Button } from '@/ui/button'
import { RELATION_LABELS, PAYMENT_STATUS_LABELS } from '../types'
import type { AdmissionApplication } from '../types'
import type {
  PersonalForm,
  ParentForm,
  AddressForm,
} from '../composables/useApplicationFormState'

defineProps<{
  personal: PersonalForm
  parents: ParentForm[]
  address: AddressForm
  application: AdmissionApplication
  editable: boolean
  isSubmitting: boolean
  onSubmit: () => void
}>()
</script>

<template>
  <div class="space-y-4 text-sm">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-md border p-4">
        <p class="mb-2 font-medium">Data Diri</p>
        <p>Nama: {{ personal.fullName || '-' }}</p>
        <p>
          Jenis Kelamin:
          {{
            personal.gender === 'MALE'
              ? 'Laki-laki'
              : personal.gender === 'FEMALE'
                ? 'Perempuan'
                : '-'
          }}
        </p>
        <p>
          TTL: {{ personal.birthPlace || '-' }},
          {{ personal.birthDate || '-' }}
        </p>
        <p>NIK: {{ personal.nik || '-' }}</p>
      </div>
      <div class="rounded-md border p-4">
        <p class="mb-2 font-medium">Orang Tua/Wali</p>
        <p
          v-for="(parent, index) in parents.filter((p) => p.name)"
          :key="index"
        >
          {{ RELATION_LABELS[parent.relation] }}: {{ parent.name }}
        </p>
        <p v-if="!parents.some((p) => p.name)">-</p>
      </div>
      <div class="rounded-md border p-4">
        <p class="mb-2 font-medium">Alamat</p>
        <p>
          {{
            [
              address.street,
              address.village,
              address.district,
              address.city,
              address.province,
            ]
              .filter(Boolean)
              .join(', ') || '-'
          }}
        </p>
      </div>
      <div class="rounded-md border p-4">
        <p class="mb-2 font-medium">Berkas & Pembayaran</p>
        <p>
          Berkas terunggah: {{ application.documents.length }} /
          {{ (application.documentTypes ?? []).length }}
        </p>
        <p>
          Pembayaran:
          {{
            application.payment
              ? PAYMENT_STATUS_LABELS[application.payment.status]
              : '-'
          }}
        </p>
      </div>
    </div>

    <div
      v-if="editable"
      class="rounded-md border border-primary/50 bg-primary/5 p-4"
    >
      <p class="font-medium">
        Pastikan seluruh data sudah benar sebelum mengirim.
      </p>
      <p class="text-muted-foreground">
        Setelah dikirim, formulir tidak dapat diubah kecuali admin meminta
        revisi.
      </p>
      <Button
        class="mt-3"
        :disabled="isSubmitting"
        @click="onSubmit"
      >
        {{ isSubmitting ? 'Mengirim…' : 'Kirim Formulir' }}
      </Button>
    </div>
  </div>
</template>
