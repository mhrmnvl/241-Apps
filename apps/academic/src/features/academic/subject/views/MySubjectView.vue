<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { DataTable } from '@/ui'
import { Skeleton } from '@/ui/skeleton'
import { BookOpen } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { classroomApi } from '@/features/academic/classroom'
import type { TeachingAssignment } from '@/features/academic/teaching-assignment'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { formatEntityName } from '@/shared/utils/utils'

/**
 * The student's own subject list.
 *
 * One row per subject taught to their class, with the teacher beside it. No
 * picker, because a student belongs to one classroom — the server resolves it
 * from their enrolment.
 *
 * It comes from `GET /students/me/classroom`, which carries the subjects along
 * with the class. Asking `/teaching-assignments` for them instead needed
 * `teaching-assignments.read` — the register of every assignment the school
 * has made — which a student does not hold and should not: the screen answered
 * 403, under a route that had already bounced them to the dashboard.
 */
const items = ref<TeachingAssignment[]>([])
const loading = ref(true)
const classroomCode = ref<string | null>(null)

const sortedItems = computed(() =>
  [...items.value].sort((a, b) =>
    (a.subject?.name ?? '').localeCompare(b.subject?.name ?? '', 'id'),
  ),
)

const columns: ColumnDef<TeachingAssignment>[] = [
  {
    id: 'subject',
    header: 'Mata Pelajaran',
    meta: { align: 'left' },
    cell: ({ row }) => row.original.subject?.name ?? '-',
  },
  {
    id: 'code',
    header: 'Kode',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.subject?.code ?? '-',
  },
  {
    id: 'teacher',
    header: 'Guru Pengampu',
    meta: { align: 'left' },
    cell: ({ row }) => {
      const name = row.original.teacher?.user?.profile?.name
      return name ? formatEntityName(name) : '-'
    },
  },
]

onMounted(async () => {
  try {
    const classroomRes = await classroomApi.getMyClassroom()
    const classroomData = classroomRes.data?.data
    if (!classroomData) {
      loading.value = false
      return
    }

    classroomCode.value = classroomData.classroom.code ?? null
    items.value = classroomData.subjects ?? []
  } catch (error: unknown) {
    toast.error(
      getIndonesianErrorMessage(error, 'Gagal memuat daftar mata pelajaran.'),
    )
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-4 md:p-5 lg:p-6">
    <!-- Loading state -->
    <div
      v-if="loading"
      class="space-y-4"
    >
      <Skeleton class="h-[72px] w-full rounded-2xl" />
      <div class="space-y-2 p-6">
        <Skeleton
          v-for="i in 8"
          :key="i"
          class="h-10 w-full rounded-lg"
        />
      </div>
    </div>

    <Card
      v-else
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Mata Pelajaran Saya
        </CardTitle>
      </CardHeader>

      <div class="p-6">
        <!-- Not enrolled -->
        <Card
          v-if="!classroomCode"
          class="shadow-none"
        >
          <CardContent class="py-10 text-center text-sm text-muted-foreground">
            Anda belum terdaftar di kelas pada semester ini. Mata pelajaran akan
            muncul setelah Anda terdaftar di sebuah kelas.
          </CardContent>
        </Card>

        <!-- No assignments yet -->
        <Card
          v-else-if="sortedItems.length === 0"
          class="shadow-none"
        >
          <CardContent
            class="flex flex-col items-center justify-center py-14 text-center"
          >
            <BookOpen class="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p class="text-sm font-medium">
              Belum ada mata pelajaran untuk kelas
              {{ classroomCode }}.
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              Penugasan mengajar belum diatur oleh sekolah untuk semester ini.
            </p>
          </CardContent>
        </Card>

        <!-- Table -->
        <DataTable
          v-else
          :columns="columns"
          :data="sortedItems"
          :total-items="sortedItems.length"
          filter-column="subject"
          filter-placeholder="Cari mata pelajaran..."
          item-label="mata pelajaran"
          hide-per-page
          hide-pagination
        />
      </div>
    </Card>
  </div>
</template>
