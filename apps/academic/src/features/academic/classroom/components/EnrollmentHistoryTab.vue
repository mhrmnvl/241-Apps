<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Badge } from '@/ui/badge'
import { Skeleton } from '@/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { History } from 'lucide-vue-next'
import { studentEnrollmentApi } from '../api/studentEnrollmentApi'
import { enrollmentOutcome } from '../logic/enrollmentOutcome'
import type { StudentEnrollment } from '../types'

/**
 * Every year this student has been here, and how each one ended.
 *
 * The rows were always being written and never read. A promotion writes the
 * reason a student was held back to the closed enrolment's `note`; so does a
 * transfer, and so does a drop. All three were invisible — the API returned
 * them, the type declared them, and no screen in any app rendered one. The
 * reason a child repeated a year existed only in the database.
 *
 * The list is the student's whole history, not the current term. That needed
 * the server to stop narrowing a `studentId` query to the active semester,
 * which it did because an unscoped list would otherwise read every year: one
 * student is a scope, and their history is a handful of rows.
 */
const props = defineProps<{
  studentId?: string
}>()

const enrollments = ref<StudentEnrollment[]>([])
const isLoading = ref(false)

async function load() {
  if (!props.studentId) {
    enrollments.value = []
    return
  }

  isLoading.value = true
  try {
    const res = await studentEnrollmentApi.getEnrollments({
      studentId: props.studentId,
      // A student who stayed the full six years has six rows; the cap is here
      // so a page size can never silently truncate a history.
      limit: 100,
    })
    enrollments.value = res.data.data ?? []
  } catch {
    // A profile tab is not the place to raise a toast for a list nobody asked
    // for by name — the empty state below says the same thing more quietly.
    enrollments.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
watch(() => props.studentId, load)

/** 'ODD' and 'EVEN' are the server's words; these are the school's. */
function semesterLabel(name?: string) {
  if (name === 'ODD') return 'Ganjil'
  if (name === 'EVEN') return 'Genap'
  return name ?? ''
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
</script>

<template>
  <div class="py-4">
    <div
      v-if="isLoading"
      class="space-y-2"
    >
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-10 w-full" />
    </div>

    <div
      v-else-if="enrollments.length === 0"
      class="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground"
    >
      <History class="size-8 opacity-40" />
      <p class="text-sm font-medium text-foreground">Belum ada riwayat kelas</p>
      <p class="max-w-sm text-xs">
        Riwayat muncul setelah siswa didaftarkan ke sebuah kelas.
      </p>
    </div>

    <div
      v-else
      class="overflow-x-auto rounded-xl border bg-background shadow-xs"
    >
      <Table class="min-w-[640px]">
        <TableHeader class="bg-muted/50">
          <TableRow>
            <TableHead class="text-xs font-semibold w-[140px]">
              Tahun Ajaran
            </TableHead>
            <TableHead class="text-xs font-semibold w-[110px]">Kelas</TableHead>
            <TableHead class="text-center text-xs font-semibold w-[140px]">
              Status
            </TableHead>
            <TableHead class="text-center text-xs font-semibold w-[120px]">
              Berakhir
            </TableHead>
            <TableHead class="text-xs font-semibold">Catatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="row in enrollments"
            :key="row.id"
            class="hover:bg-muted/30"
          >
            <TableCell class="py-2.5 text-xs font-medium">
              {{ row.semester?.academicYear?.name ?? '-' }}
              <span class="block text-[11px] text-muted-foreground">
                {{ semesterLabel(row.semester?.type?.name) }}
              </span>
            </TableCell>
            <TableCell class="py-2.5 text-xs">
              {{ row.classroom?.displayName ?? '-' }}
            </TableCell>
            <TableCell class="text-center py-2.5">
              <Badge
                :variant="enrollmentOutcome(row.status).variant"
                class="text-[11px] shadow-none"
              >
                {{ enrollmentOutcome(row.status).label }}
              </Badge>
            </TableCell>
            <TableCell
              class="text-center py-2.5 text-xs text-muted-foreground tabular-nums"
            >
              {{ formatDate(row.endedAt) }}
            </TableCell>
            <TableCell class="py-2.5 text-xs">
              <!-- On a year that ended against the student this is the reason
                   somebody typed at the time, which is the whole point of the
                   tab. Anywhere else it is an incidental remark, and colouring
                   it red would misread it. -->
              <span
                v-if="row.note"
                :class="
                  enrollmentOutcome(row.status).noteIsAReason
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                "
              >
                {{ row.note }}
              </span>
              <span
                v-else
                class="text-muted-foreground/50"
              >
                —
              </span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
