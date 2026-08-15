<script setup lang="ts">
import { DataTable } from '@/ui'
import { Card, CardContent } from '@/ui/card'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { attendanceApi } from '../api/attendanceApi'
import { myAttendanceColumns } from '../components/myAttendanceColumns'
import type { Attendance } from '../types'

/**
 * A student's own attendance, and their own totals over the same rows.
 *
 * The totals are counted here from `rows`, and that is correct only because
 * `rows` is the whole set: the read is not paginated on this screen. If it ever
 * is, these must come from the server — counting a page and labelling it a
 * total is the defect this project fixed on the rapor summary cards, and it
 * looks entirely plausible on screen.
 *
 * There is no class recap here and there will not be. A recap describes a
 * cohort; a student's own percentage is arithmetic over their own rows.
 */
const rows = ref<Attendance[]>([])
const loading = ref(false)

const totals = computed(() => {
  const count = (status: string) =>
    rows.value.filter((r) => r.status === status).length
  return {
    present: count('PRESENT'),
    late: count('LATE'),
    sick: count('SICK'),
    excused: count('EXCUSED'),
    absent: count('ABSENT'),
    total: rows.value.length,
  }
})

async function load() {
  loading.value = true
  try {
    const res = await attendanceApi.getMyAttendances({ limit: 500 })
    rows.value = res.data?.data ?? []
  } catch (error: unknown) {
    rows.value = []
    toast.error(
      getIndonesianErrorMessage(error, 'Gagal memuat kehadiran Anda.'),
    )
  } finally {
    loading.value = false
  }
}

onMounted(() => void load())
</script>

<template>
  <div class="space-y-6 p-4 md:p-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Kehadiran Saya</h1>
      <p class="text-sm text-muted-foreground">
        Catatan kehadiran Anda pada semester berjalan.
      </p>
    </div>

    <div
      v-if="totals.total > 0"
      class="grid grid-cols-2 gap-4 md:grid-cols-5"
    >
      <Card
        v-for="item in [
          { label: 'Hadir', value: totals.present },
          { label: 'Terlambat', value: totals.late },
          { label: 'Sakit', value: totals.sick },
          { label: 'Izin', value: totals.excused },
          { label: 'Alpa', value: totals.absent },
        ]"
        :key="item.label"
      >
        <CardContent class="p-4">
          <p class="text-xs text-muted-foreground">{{ item.label }}</p>
          <p class="text-2xl font-bold">{{ item.value }}</p>
        </CardContent>
      </Card>
    </div>

    <Card v-if="!loading && rows.length === 0">
      <CardContent class="py-10 text-center text-sm text-muted-foreground">
        Belum ada catatan kehadiran untuk Anda. Kehadiran muncul di sini setelah
        guru mengisinya, atau setelah Anda terdaftar di sebuah kelas pada
        semester berjalan.
      </CardContent>
    </Card>

    <DataTable
      v-else
      :columns="myAttendanceColumns"
      :data="rows"
      :is-loading="loading"
    />
  </div>
</template>
