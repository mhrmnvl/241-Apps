<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Skeleton } from '@/ui/skeleton'
import {
  Building2,
  CalendarDays,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-vue-next'

const props = defineProps<{
  loading: boolean
  institution?: { name: string; status: string }
  academicInfo?: {
    activeAcademicYear?: { name: string }
    activeSemester?: { type: string }
  }
}>()

const semesterLabel = computed(() => {
  const type = props.academicInfo?.activeSemester?.type
  if (type === 'ODD') return 'Ganjil'
  if (type === 'EVEN') return 'Genap'
  return type ?? '-'
})

const institutionStatusLabel = computed(() => {
  const status = props.institution?.status
  if (!status) return 'Belum Dikonfigurasi'
  const map: Record<string, string> = {
    NEGERI: 'Negeri',
    SWASTA: 'Swasta',
    ACTIVE: 'Negeri',
  }
  return map[status] ?? status
})
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <Card class="shadow-none">
      <CardContent class="p-4">
        <div
          v-if="loading"
          class="space-y-2"
        >
          <Skeleton class="h-4 w-16" />
          <Skeleton class="h-6 w-32" />
        </div>
        <div
          v-else
          class="flex items-start gap-3"
        >
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"
          >
            <Building2 class="size-4 text-primary" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-medium text-muted-foreground">Institusi</p>
            <p class="truncate text-sm font-semibold">
              {{ institution?.name ?? 'Belum Dikonfigurasi' }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="shadow-none">
      <CardContent class="p-4">
        <div
          v-if="loading"
          class="space-y-2"
        >
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-6 w-28" />
        </div>
        <div
          v-else
          class="flex items-start gap-3"
        >
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"
          >
            <CalendarDays class="size-4 text-primary" />
          </div>
          <div>
            <p class="text-xs font-medium text-muted-foreground">
              Tahun Ajaran Aktif
            </p>
            <p class="text-sm font-semibold">
              {{ academicInfo?.activeAcademicYear?.name ?? '-' }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="shadow-none">
      <CardContent class="p-4">
        <div
          v-if="loading"
          class="space-y-2"
        >
          <Skeleton class="h-4 w-16" />
          <Skeleton class="h-6 w-20" />
        </div>
        <div
          v-else
          class="flex items-start gap-3"
        >
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"
          >
            <CalendarCheck class="size-4 text-primary" />
          </div>
          <div>
            <p class="text-xs font-medium text-muted-foreground">Semester</p>
            <p class="text-sm font-semibold">{{ semesterLabel }}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="shadow-none">
      <CardContent class="p-4">
        <div
          v-if="loading"
          class="space-y-2"
        >
          <Skeleton class="h-4 w-12" />
          <Skeleton class="h-6 w-16" />
        </div>
        <div
          v-else
          class="flex items-start gap-3"
        >
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"
          >
            <ShieldCheck class="size-4 text-primary" />
          </div>
          <div>
            <p class="text-xs font-medium text-muted-foreground">Status</p>
            <Badge variant="secondary">{{ institutionStatusLabel }}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
