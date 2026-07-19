<script setup lang="ts">
import {
  Fingerprint,
  Calendar,
  Phone,
  Mail,
  User,
  Heart,
  BookOpen,
  Users,
  CreditCard,
  FileText,
} from 'lucide-vue-next'
import type { ProfileDisplayData, UserGender, MaritalStatus } from '../types'

defineProps<{ data: ProfileDisplayData }>()

function formatGender(val?: UserGender | null) {
  if (val === 'MALE') return 'Laki-Laki'
  if (val === 'FEMALE') return 'Perempuan'
  return '-'
}

function formatBloodType(val?: string | null) {
  return val ?? '-'
}

function formatMaritalStatus(val?: MaritalStatus | null) {
  const map: Record<string, string> = {
    SINGLE: 'Belum Menikah',
    MARRIED: 'Menikah',
    DIVORCED: 'Cerai Hidup',
    WIDOWED: 'Cerai Mati',
  }
  return (val && map[val]) ?? '-'
}

function formatMaritalStatusIndonesian(val?: MaritalStatus | null) {
  return formatMaritalStatus(val)
}

function formatReligion(val?: string | null) {
  return val ?? '-'
}
</script>

<template>
  <div class="py-4">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">Nama Lengkap</p>
          <User class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ data.fullName || '-' }}
        </p>
      </div>
      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">NIK</p>
          <Fingerprint class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ data.nik || '-' }}
        </p>
      </div>
      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">
            Tempat, Tanggal Lahir
          </p>
          <Calendar class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ data.birthPlace || '-' }}, {{ data.birthDate || '-' }}
        </p>
      </div>
      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">Jenis Kelamin</p>
          <User class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ formatGender(data.gender) }}
        </p>
      </div>
      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">Agama</p>
          <BookOpen class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ formatReligion(data.religion) }}
        </p>
      </div>
      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">
            Golongan Darah
          </p>
          <Heart class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ formatBloodType(data.bloodType) }}
        </p>
      </div>
      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">
            Status Pernikahan
          </p>
          <Users class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ formatMaritalStatusIndonesian(data.maritalStatus) }}
        </p>
      </div>
      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">Email Pribadi</p>
          <Mail class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ data.email || '-' }}
        </p>
      </div>
      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">
            Nomor Telepon/HP
          </p>
          <Phone class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ data.phone || '-' }}
        </p>
      </div>
      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">
            No. Kartu Keluarga
          </p>
          <CreditCard class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ data.kk || '-' }}
        </p>
      </div>
      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">NPWP</p>
          <FileText class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ data.npwp || '-' }}
        </p>
      </div>
    </div>
  </div>
</template>
