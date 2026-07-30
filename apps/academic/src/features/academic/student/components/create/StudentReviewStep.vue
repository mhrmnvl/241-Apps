<script setup lang="ts">
import type { AddressFormState } from '@/features/academic/shared/multi-step-form'
import type { StudentParentInput } from '../../types'

defineProps<{
  values: {
    name?: string
    nik?: string
    nis?: string
    nisn?: string
  }
  address: AddressFormState
  hasAddress: boolean
  parents: StudentParentInput[]
}>()
</script>

<template>
  <div class="space-y-4 text-sm">
    <div class="rounded-xl border p-4">
      <p class="font-semibold mb-2">Profil & Akademik</p>
      <div class="grid gap-1 md:grid-cols-2 text-muted-foreground">
        <span>Nama: {{ values.name || '-' }}</span>
        <span>NIK: {{ values.nik || '-' }}</span>
        <span>NIS: {{ values.nis || '-' }}</span>
        <span>NISN: {{ values.nisn || '-' }}</span>
      </div>
    </div>
    <div class="rounded-xl border p-4">
      <p class="font-semibold mb-1">Alamat</p>
      <p class="text-muted-foreground">
        {{ hasAddress ? address.street : 'Dilewati' }}
      </p>
    </div>
    <div class="rounded-xl border p-4">
      <p class="font-semibold mb-1">Orang Tua / Wali</p>
      <p class="text-muted-foreground">
        {{ parents.length > 0 ? `${parents.length} data` : 'Dilewati' }}
      </p>
    </div>
  </div>
</template>
