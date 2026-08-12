<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Loader2 } from 'lucide-vue-next'
import { useRapor } from '../composables/useRapor'
import type { RaporData, RaporDetailData, RaporScoreRow } from '../types'

const props = defineProps<{
  open: boolean
  rapor: RaporData | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const detailData = ref<RaporDetailData | null>(null)
const scores = ref<RaporScoreRow[]>([])
const loadingDetail = ref(false)

const { fetchRaporDetail, fetchScoresForRapor } = useRapor()

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && props.rapor) {
      loadingDetail.value = true
      try {
        const [detail, scoreRows] = await Promise.all([
          fetchRaporDetail(props.rapor.id),
          fetchScoresForRapor(props.rapor.enrollmentId),
        ])

        detailData.value = detail
        scores.value = scoreRows
      } finally {
        loadingDetail.value = false
      }
    } else {
      detailData.value = null
      scores.value = []
    }
  },
)

function formatScore(val: number | null): string {
  if (val === null || val === undefined) return '-'
  return Number(val).toFixed(1)
}

function formatType(type: string): string {
  const map: Record<string, string> = {
    DAILY: 'Harian',
    MIDTERM: 'UTS',
    FINAL: 'UAS',
    ASSIGNMENT: 'Tugas',
    PRACTICAL: 'Praktik',
  }
  return map[type] ?? type
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="(val) => emit('update:open', val)"
  >
    <DialogContent class="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Detail Rapor</DialogTitle>
        <DialogDescription>
          {{ rapor?.enrollment?.student?.user?.profile?.name || 'Siswa' }}
          — {{ rapor?.enrollment?.classroom?.displayName || '' }}
        </DialogDescription>
      </DialogHeader>

      <div
        v-if="loadingDetail"
        class="flex items-center justify-center py-12"
      >
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
      </div>

      <template v-else-if="detailData">
        <div
          class="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-4 text-sm"
        >
          <div>
            <span class="text-muted-foreground">Rata-rata</span>
            <p class="text-lg font-bold">
              {{
                detailData.totalAverage !== null
                  ? Number(detailData.totalAverage).toFixed(2)
                  : '-'
              }}
            </p>
          </div>
          <div>
            <span class="text-muted-foreground">Peringkat</span>
            <p class="text-lg font-bold">{{ detailData.rank ?? '-' }}</p>
          </div>
          <div>
            <span class="text-muted-foreground">Status</span>
            <p>
              <span
                :class="
                  detailData.isPublished
                    ? 'inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20'
                    : 'inline-flex items-center rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20'
                "
              >
                {{ detailData.isPublished ? 'Published' : 'Draft' }}
              </span>
            </p>
          </div>
          <div>
            <span class="text-muted-foreground">Catatan</span>
            <p class="text-sm">{{ detailData.teacherNote || '-' }}</p>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="text-sm font-semibold">Kehadiran</h4>
          <div class="grid grid-cols-3 gap-3">
            <div class="rounded-lg border p-3 text-center">
              <p class="text-2xl font-bold text-red-600">
                {{ detailData.attendance?.ABSENT || 0 }}
              </p>
              <p class="text-xs text-muted-foreground">Alpha</p>
            </div>
            <div class="rounded-lg border p-3 text-center">
              <p class="text-2xl font-bold text-orange-600">
                {{ detailData.attendance?.SICK || 0 }}
              </p>
              <p class="text-xs text-muted-foreground">Sakit</p>
            </div>
            <div class="rounded-lg border p-3 text-center">
              <p class="text-2xl font-bold text-blue-600">
                {{ detailData.attendance?.EXCUSED || 0 }}
              </p>
              <p class="text-xs text-muted-foreground">Izin</p>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="text-sm font-semibold">Nilai Akhir per Mata Pelajaran</h4>
          <p class="text-xs text-muted-foreground">
            Angka yang tercetak di rapor. Dibekukan saat rapor dibuat, jadi
            tidak berubah walau KKM atau bobot diubah kemudian.
          </p>

          <div
            v-if="!detailData.subjects?.length"
            class="text-sm text-muted-foreground text-center py-4"
          >
            Belum ada mata pelajaran yang dinilai.
          </div>

          <div
            v-else
            class="rounded-lg border overflow-hidden"
          >
            <table class="w-full text-sm">
              <thead class="bg-muted/50 text-left">
                <tr>
                  <th class="px-3 py-2 font-medium">Mata Pelajaran</th>
                  <th class="px-3 py-2 font-medium text-right">KKM</th>
                  <th class="px-3 py-2 font-medium text-right">Nilai</th>
                  <th class="px-3 py-2 font-medium text-center">Predikat</th>
                  <th class="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr
                  v-for="subject in detailData.subjects"
                  :key="subject.subjectId"
                  class="hover:bg-muted/20"
                >
                  <td class="px-3 py-2">{{ subject.subjectName }}</td>
                  <td
                    class="px-3 py-2 text-right font-mono text-muted-foreground"
                  >
                    {{ subject.passingScore }}
                  </td>
                  <td class="px-3 py-2 text-right font-mono font-semibold">
                    {{ Number(subject.score).toFixed(2) }}
                  </td>
                  <td class="px-3 py-2 text-center">
                    <span class="font-semibold">{{ subject.predicate }}</span>
                    <span class="ml-1 text-xs text-muted-foreground">
                      {{ subject.description }}
                    </span>
                  </td>
                  <td class="px-3 py-2">
                    <span
                      class="rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="
                        subject.isComplete
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      "
                    >
                      {{ subject.isComplete ? 'Tuntas' : 'Belum Tuntas' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="text-sm font-semibold">Rincian Nilai</h4>

          <div
            v-if="scores.length === 0"
            class="text-sm text-muted-foreground text-center py-4"
          >
            Belum ada data nilai.
          </div>

          <div
            v-else
            class="rounded-lg border overflow-hidden"
          >
            <table class="w-full text-sm">
              <thead class="bg-muted/50 text-left">
                <tr>
                  <th class="px-3 py-2 font-medium">Komponen</th>
                  <th class="px-3 py-2 font-medium">Jenis</th>
                  <th class="px-3 py-2 font-medium text-right">Bobot</th>
                  <th class="px-3 py-2 font-medium text-right">Nilai</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr
                  v-for="(score, idx) in scores"
                  :key="idx"
                  class="hover:bg-muted/20"
                >
                  <td class="px-3 py-2">{{ score.subject }}</td>
                  <td class="px-3 py-2">{{ formatType(score.type) }}</td>
                  <td class="px-3 py-2 text-right">{{ score.weight }}</td>
                  <td class="px-3 py-2 text-right font-mono">
                    {{ formatScore(score.score) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </DialogContent>
  </Dialog>
</template>
