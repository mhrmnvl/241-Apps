<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { School, UserRound, Users } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { classroomApi } from '../api/classroomApi'
import type { MyClassroom } from '../types'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'

/**
 * The student's own classroom.
 *
 * Not a narrowed Daftar Kelas — a different screen answering a different
 * question. There is no picker and no id in the URL, because a student has one
 * classroom and the server resolves it from their enrolment.
 *
 * Read-only throughout. Everything here is the school's to set; a student is
 * here to find out who runs the class, who teaches it, and who else is in it.
 */
const data = ref<MyClassroom | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await classroomApi.getMyClassroom()
    data.value = res.data?.data ?? null
  } catch (error: unknown) {
    toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data kelas.'))
  } finally {
    loading.value = false
  }
})

/** The four seats, in the order a class lists them. */
function committee(structure: MyClassroom['structure']) {
  if (!structure) return []
  return [
    { role: 'Ketua Kelas', student: structure.president },
    { role: 'Wakil Ketua', student: structure.vicePresident },
    { role: 'Sekretaris', student: structure.secretary },
    { role: 'Bendahara', student: structure.treasurer },
  ].filter((seat) => seat.student)
}
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8 space-y-5">
    <div
      v-if="loading"
      class="space-y-5"
    >
      <Skeleton class="h-28 w-full rounded-2xl" />
      <Skeleton class="h-64 w-full rounded-2xl" />
    </div>

    <Card
      v-else-if="!data"
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardContent class="py-16 text-center">
        <School class="mx-auto size-10 text-muted-foreground opacity-40" />
        <p class="mt-3 text-sm font-medium">Anda belum terdaftar di kelas</p>
        <p class="mt-1 text-sm text-muted-foreground">
          Ini terjadi bila pendaftaran Anda pada semester berjalan belum
          diproses. Hubungi wali kelas atau tata usaha.
        </p>
      </CardContent>
    </Card>

    <template v-else>
      <!-- Which class, whose class -->
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader class="border-b px-6 py-5">
          <CardTitle class="text-2xl font-bold tracking-tight">
            Kelas {{ data.classroom.code }}
          </CardTitle>
        </CardHeader>

        <CardContent class="grid gap-4 px-6 py-5 sm:grid-cols-3">
          <div>
            <p class="text-xs text-muted-foreground">Tingkat</p>
            <p class="mt-0.5 text-sm font-medium">
              {{ data.classroom.grade?.name ?? '-' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Tahun Ajaran</p>
            <p class="mt-0.5 text-sm font-medium">
              {{ data.classroom.academicYear?.name ?? '-' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Wali Kelas</p>
            <p class="mt-0.5 text-sm font-medium">
              {{
                data.supervisor?.teacher?.user?.profile?.name ??
                'Belum ditentukan'
              }}
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Who runs it -->
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-row items-center gap-2 border-b px-6 py-4 bg-muted/30"
        >
          <UserRound class="size-4 text-primary shrink-0" />
          <span class="font-semibold text-sm">Struktur Kelas</span>
        </CardHeader>

        <CardContent class="p-6">
          <p
            v-if="committee(data.structure).length === 0"
            class="text-sm text-muted-foreground"
          >
            Struktur kelas belum disusun untuk semester ini.
          </p>

          <div
            v-else
            class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div
              v-for="seat in committee(data.structure)"
              :key="seat.role"
              class="rounded-lg border px-4 py-3"
            >
              <p class="text-xs text-muted-foreground">{{ seat.role }}</p>
              <p class="mt-0.5 text-sm font-medium">
                {{ seat.student?.user?.profile?.name ?? '-' }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Who else is in it -->
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-row items-center gap-2 border-b px-6 py-4 bg-muted/30"
        >
          <Users class="size-4 text-primary shrink-0" />
          <span class="font-semibold text-sm">
            Teman Sekelas ({{ data.classmates.length }})
          </span>
        </CardHeader>

        <div class="border-t bg-background overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow class="bg-muted/50 hover:bg-muted/50">
                <TableHead class="w-[50px] px-4 text-center">No</TableHead>
                <TableHead class="w-28 px-4 text-center">NIS</TableHead>
                <TableHead class="px-4">Nama</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="(row, index) in data.classmates"
                :key="row.id"
              >
                <TableCell class="px-4 py-2.5 text-center">
                  {{ index + 1 }}
                </TableCell>
                <TableCell class="px-4 py-2.5 text-center tabular-nums">
                  {{ row.student?.nis ?? '-' }}
                </TableCell>
                <TableCell class="px-4 py-2.5">
                  {{ row.student?.user?.profile?.name ?? '-' }}
                </TableCell>
              </TableRow>

              <TableRow v-if="data.classmates.length === 0">
                <TableCell
                  :colspan="3"
                  class="h-24 px-4 text-center text-muted-foreground"
                >
                  Belum ada siswa terdaftar di kelas ini.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </template>
  </div>
</template>
