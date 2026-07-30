<script setup lang="ts">
import type { AddressFormState } from '@/features/academic/shared/multi-step-form'
import type { TeacherPositionInput } from '../../types'

defineProps<{
  values: {
    name?: string
    nik?: string
    nip?: string
    nuptk?: string
  }
  address: AddressFormState
  hasAddress: boolean
  extraPositions: TeacherPositionInput[]
}>()
</script>

<template>
  <div class="space-y-4 text-sm">
    <div class="rounded-xl border p-4">
      <p class="font-semibold mb-2">Profil & Kepegawaian</p>
      <div class="grid gap-1 md:grid-cols-2 text-muted-foreground">
        <span>Nama: {{ values.name || '-' }}</span>
        <span>NIK: {{ values.nik || '-' }}</span>
        <span>NIP: {{ values.nip || '-' }}</span>
        <span>NUPTK: {{ values.nuptk || '-' }}</span>
      </div>
    </div>
    <div class="rounded-xl border p-4">
      <p class="font-semibold mb-1">Alamat</p>
      <p class="text-muted-foreground">
        {{ hasAddress ? address.street : 'Dilewati' }}
      </p>
    </div>
    <div class="rounded-xl border p-4">
      <p class="font-semibold mb-1">Jabatan Tambahan</p>
      <p class="text-muted-foreground">
        {{
          extraPositions.length > 0
            ? `${extraPositions.length} jabatan`
            : 'Dilewati'
        }}
      </p>
    </div>
  </div>
</template>
