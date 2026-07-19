<script setup lang="ts">
import type { Semester } from '../types'
import { Badge } from '@/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert'
import { AlertCircle, ChevronRight, GraduationCap } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  semesters: Semester[]
  sourceSemesterId: string
  targetSemesterId: string
}>()

const emit = defineEmits<{
  'update:sourceSemesterId': [value: string]
  'update:targetSemesterId': [value: string]
}>()

const sourceSemesterIdVal = computed({
  get: () => props.sourceSemesterId,
  set: (val) => emit('update:sourceSemesterId', val),
})

const targetSemesterIdVal = computed({
  get: () => props.targetSemesterId,
  set: (val) => emit('update:targetSemesterId', val),
})

const availableTargetSemesters = computed(() =>
  props.semesters.filter((s) => s.id !== props.sourceSemesterId),
)

const sourceSemester = computed<Semester | undefined>(() =>
  props.semesters.find((s) => s.id === props.sourceSemesterId),
)

const targetSemester = computed<Semester | undefined>(() =>
  props.semesters.find((s) => s.id === props.targetSemesterId),
)

function formatSemesterLabel(s: Semester) {
  const ay = s.academicYear?.name ?? ''
  const type = s.type?.name === 'ODD' ? 'Ganjil' : 'Genap'
  return `${ay} — ${type}`
}
</script>

<template>
  <div
    class="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
  >
    <div class="text-center space-y-2 mb-8">
      <h2 class="text-2xl font-bold tracking-tight">Pilih Siklus Akademik</h2>
      <p class="text-muted-foreground">
        Tentukan dari semester mana data siswa akan dipindahkan, dan ke semester
        mana mereka akan naik kelas.
      </p>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 relative">
      <div
        class="space-y-3 p-5 rounded-xl border bg-card/50 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
      >
        <div class="flex items-center gap-2 text-primary">
          <GraduationCap class="h-5 w-5" />
          <h3 class="font-semibold">Semester Asal</h3>
        </div>
        <p class="text-sm text-muted-foreground">
          Semester siswa saat ini berada
        </p>
        <Select v-model="sourceSemesterIdVal">
          <SelectTrigger class="h-12 bg-background">
            <SelectValue placeholder="Pilih semester asal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="s in semesters"
              :key="s.id"
              :value="s.id"
            >
              {{ formatSemesterLabel(s) }}
              <Badge
                v-if="s.isActive"
                variant="default"
                class="ml-2 text-[10px]"
              >
                Aktif
              </Badge>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        class="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 bg-background border rounded-full items-center justify-center z-10 shadow-sm text-muted-foreground"
      >
        <ChevronRight class="h-5 w-5" />
      </div>

      <div
        class="space-y-3 p-5 rounded-xl border bg-card/50 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
      >
        <div class="flex items-center gap-2 text-primary">
          <GraduationCap class="h-5 w-5" />
          <h3 class="font-semibold">Semester Tujuan</h3>
        </div>
        <p class="text-sm text-muted-foreground">
          Semester tujuan kenaikan kelas
        </p>
        <Select v-model="targetSemesterIdVal">
          <SelectTrigger class="h-12 bg-background">
            <SelectValue placeholder="Pilih semester tujuan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="s in availableTargetSemesters"
              :key="s.id"
              :value="s.id"
            >
              {{ formatSemesterLabel(s) }}
              <Badge
                v-if="s.isActive"
                variant="default"
                class="ml-2 text-[10px]"
              >
                Aktif
              </Badge>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <Alert
      v-if="sourceSemesterId && targetSemesterId"
      class="bg-primary/5 border-primary/20 text-primary-foreground"
    >
      <AlertCircle class="h-5 w-5 text-primary" />
      <AlertTitle class="text-primary font-semibold"
        >Konfirmasi Pemilihan</AlertTitle
      >
      <AlertDescription class="text-foreground mt-1 text-sm leading-relaxed">
        Sistem akan menganalisis siswa yang terdaftar di
        <strong>{{
          sourceSemester ? formatSemesterLabel(sourceSemester) : ''
        }}</strong>
        dan memberikan rekomendasi kenaikan kelas ke
        <strong>{{
          targetSemester ? formatSemesterLabel(targetSemester) : ''
        }}</strong
        >. Anda dapat menyetujui atau menolak per siswa di langkah berikutnya.
      </AlertDescription>
    </Alert>
  </div>
</template>
