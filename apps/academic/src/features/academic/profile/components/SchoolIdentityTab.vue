<script setup lang="ts">
import { computed } from 'vue'
import {
  Briefcase,
  Building,
  CheckCircle2,
  GraduationCap,
  Library,
  Hash,
  UserCheck,
  CalendarDays,
  Fingerprint,
} from 'lucide-vue-next'
import type { SchoolProfileData } from '@/features/platform/profile'

const props = defineProps<{ data: SchoolProfileData }>()

const isStudent = computed(() => props.data.roles?.includes('STUDENT'))
</script>

<template>
  <div class="py-4">
    <div v-if="data.schoolIdentity">
      <div
        v-if="isStudent"
        class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <div class="rounded-lg border bg-background p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-medium text-muted-foreground">NIS</p>
            <Fingerprint class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </div>
          <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
            {{ data.nis || '-' }}
          </p>
        </div>
        <div class="rounded-lg border bg-background p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-medium text-muted-foreground">NISN</p>
            <Fingerprint class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </div>
          <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
            {{ data.nisn || '-' }}
          </p>
        </div>
        <div class="rounded-lg border bg-background p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-medium text-muted-foreground">
              Kelas Saat Ini
            </p>
            <Building class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </div>
          <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
            {{ data.schoolIdentity.className || '-' }}
          </p>
        </div>
        <div class="rounded-lg border bg-background p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-medium text-muted-foreground">
              Tingkat Absen
            </p>
            <Hash class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </div>
          <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
            Level {{ data.schoolIdentity.gradeLevel || '-' }}
          </p>
        </div>
        <div class="rounded-lg border bg-background p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-medium text-muted-foreground">
              Dosen / Wali Kelas
            </p>
            <UserCheck class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </div>
          <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
            {{ data.schoolIdentity.supervisorName || '-' }}
          </p>
        </div>
      </div>
      <div
        v-else
        class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <div class="rounded-lg border bg-background p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-medium text-muted-foreground">NIP</p>
            <Fingerprint class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </div>
          <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
            {{ data.nip || '-' }}
          </p>
        </div>
        <div class="rounded-lg border bg-background p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-medium text-muted-foreground">NUPTK</p>
            <Fingerprint class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </div>
          <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
            {{ data.nuptk || '-' }}
          </p>
        </div>
        <div class="rounded-lg border bg-background p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-medium text-muted-foreground">
              Status Kepegawaian
            </p>
            <CheckCircle2
              class="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
          </div>
          <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
            {{ data.schoolIdentity.employmentStatus || '-' }}
          </p>
        </div>
        <div class="rounded-lg border bg-background p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-medium text-muted-foreground">
              Golongan / Kategori
            </p>
            <Library class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </div>
          <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
            {{ data.schoolIdentity.positionCategory || '-' }}
          </p>
        </div>
        <div class="rounded-lg border bg-background p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-medium text-muted-foreground">
              Tugas / Jabatan Utama
            </p>
            <Briefcase class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </div>
          <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
            {{ data.schoolIdentity.primaryPosition || '-' }}
          </p>
        </div>
        <div class="rounded-lg border bg-background p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-medium text-muted-foreground">
              Tugas / Jabatan Tambahan
            </p>
            <Library class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </div>
          <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
            {{ data.schoolIdentity.additionalDuties || '-' }}
          </p>
        </div>
        <div class="rounded-lg border bg-background p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-medium text-muted-foreground">
              Tanggal Bergabung
            </p>
            <CalendarDays
              class="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
          </div>
          <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
            {{ data.schoolIdentity.hireDate || '-' }}
          </p>
        </div>
        <div class="rounded-lg border bg-background p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-medium text-muted-foreground">
              Mata Pelajaran Diampu
            </p>
            <GraduationCap
              class="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
          </div>
          <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
            {{
              data.schoolIdentity.taughtSubjects ||
              'Tidak mengajar kelas spesifik'
            }}
          </p>
        </div>
      </div>
    </div>
    <div
      v-else
      class="text-center p-8 bg-muted/20 border-2 border-dashed rounded-lg"
    >
      <p class="text-muted-foreground">Data identitas belum tersedia.</p>
    </div>
  </div>
</template>
