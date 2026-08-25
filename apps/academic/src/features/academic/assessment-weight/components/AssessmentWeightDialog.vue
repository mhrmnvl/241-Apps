<script setup lang="ts">
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
import { Badge } from '@/ui/badge'
import { CheckCircle2, Loader2, RotateCcw } from 'lucide-vue-next'
import { computed, watch } from 'vue'
import { useAssessmentWeights } from '../composables/useAssessmentWeights'
import { ASSESSMENT_TYPE_LABELS, ASSESSMENT_TYPE_ORDER } from '../types'

const props = defineProps<{
  teachingAssignmentId: string
  subjectName?: string
  classroomName?: string
}>()

const open = defineModel<boolean>('open', { required: true })

const {
  weights,
  loading,
  isSaving,
  total,
  isBalanced,
  remaining,
  fetch,
  save,
  applyDefault,
} = useAssessmentWeights()

watch(open, (isOpen) => {
  if (isOpen && props.teachingAssignmentId) {
    void fetch(props.teachingAssignmentId)
  }
})

const TYPE_COLORS: Record<string, string> = {
  DAILY: 'bg-blue-500',
  ASSIGNMENT: 'bg-emerald-500',
  PRACTICAL: 'bg-amber-500',
  MIDTERM: 'bg-violet-500',
  FINAL: 'bg-rose-500',
}

const TYPE_BADGE_CLASSES: Record<string, string> = {
  DAILY: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  ASSIGNMENT:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  PRACTICAL:
    'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  MIDTERM:
    'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
  FINAL: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
}

const SAMPLE_SCORES: Record<string, number> = {
  DAILY: 80,
  ASSIGNMENT: 75,
  PRACTICAL: 85,
  MIDTERM: 60,
  FINAL: 90,
}

const usedTypes = computed(() =>
  ASSESSMENT_TYPE_ORDER.filter((type) => weights.value[type] > 0),
)

const sampleResult = computed(() => {
  if (!isBalanced.value || usedTypes.value.length === 0) return null
  const sum = usedTypes.value.reduce(
    (acc, type) => acc + (SAMPLE_SCORES[type] ?? 0) * weights.value[type],
    0,
  )
  return (sum / 100).toFixed(1)
})

function setWeight(type: string, value: string | number) {
  const parsed = Number(value)
  weights.value = {
    ...weights.value,
    [type]: Number.isNaN(parsed) ? 0 : Math.min(Math.max(parsed, 0), 100),
  }
}

async function handleSave() {
  const saved = await save(props.teachingAssignmentId)
  if (saved) open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>Bobot Penilaian</DialogTitle>
        <DialogDescription class="sr-only">
          Atur bobot tiap jenis penilaian agar total 100%.
        </DialogDescription>
      </DialogHeader>

      <div class="px-6 py-4 space-y-3 overflow-y-auto">
        <div
          v-if="loading"
          class="flex items-center justify-center py-8 text-muted-foreground"
        >
          <Loader2 class="size-5 animate-spin" />
        </div>

        <template v-else>
          <!-- Context Info -->
          <div
            v-if="subjectName || classroomName"
            class="rounded-md border bg-muted/30 px-3 py-2.5 text-sm space-y-1"
          >
            <div
              v-if="subjectName"
              class="flex gap-2"
            >
              <span class="text-muted-foreground w-28 shrink-0"
                >Mata Pelajaran</span
              >
              <span class="text-muted-foreground">:</span>
              <span class="font-medium">{{ subjectName }}</span>
            </div>
            <div
              v-if="classroomName"
              class="flex gap-2"
            >
              <span class="text-muted-foreground w-28 shrink-0">Kelas</span>
              <span class="text-muted-foreground">:</span>
              <span class="font-medium">{{ classroomName }}</span>
            </div>
          </div>

          <!-- Weight Inputs -->
          <div class="space-y-2">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium text-muted-foreground"
                >Distribusi Bobot</span
              >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="text-xs gap-1.5 h-7 text-muted-foreground"
                @click="applyDefault"
              >
                <RotateCcw class="size-3" />
                Isi Standar
              </Button>
            </div>
            <div
              v-for="type in ASSESSMENT_TYPE_ORDER"
              :key="type"
              class="flex items-center gap-2"
            >
              <Badge
                variant="outline"
                class="w-[4.5rem] justify-center shrink-0 text-[11px] font-medium py-0.5"
                :class="TYPE_BADGE_CLASSES[type]"
              >
                {{ ASSESSMENT_TYPE_LABELS[type] }}
              </Badge>
              <div
                class="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden"
              >
                <div
                  class="h-full rounded-full transition-all duration-300 ease-out"
                  :class="TYPE_COLORS[type]"
                  :style="{ width: `${weights[type]}%` }"
                />
              </div>
              <div class="relative w-[4.5rem] shrink-0">
                <Input
                  :id="`weight-${type}`"
                  type="number"
                  min="0"
                  max="100"
                  class="h-7 pr-6 text-right text-xs"
                  :model-value="weights[type]"
                  @update:model-value="(val) => setWeight(type, val)"
                />
                <span
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none"
                >
                  %
                </span>
              </div>
            </div>
          </div>

          <!-- Total Status -->
          <div
            class="flex items-center justify-between rounded-md px-3 py-2 text-xs transition-colors"
            :class="
              isBalanced
                ? 'bg-emerald-500/5 border border-emerald-500/20'
                : total > 100
                  ? 'bg-destructive/5 border border-destructive/20'
                  : 'bg-muted/50 border border-border'
            "
          >
            <div class="flex items-center gap-1.5">
              <CheckCircle2
                v-if="isBalanced"
                class="size-3.5 text-emerald-600 dark:text-emerald-400"
              />
              <span
                class="font-medium"
                :class="
                  isBalanced ? 'text-emerald-700 dark:text-emerald-400' : ''
                "
              >
                Total
              </span>
            </div>
            <span
              class="font-semibold tabular-nums"
              :class="
                isBalanced
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : total > 100
                    ? 'text-destructive'
                    : ''
              "
            >
              {{ total }}%
              <span
                v-if="!isBalanced"
                class="font-normal ml-1"
                :class="
                  total > 100 ? 'text-destructive/70' : 'text-muted-foreground'
                "
              >
                ({{
                  remaining > 0 ? `kurang ${remaining}` : `lebih ${-remaining}`
                }})
              </span>
            </span>
          </div>

          <!-- Sample Calculation -->
          <div
            v-if="sampleResult"
            class="rounded-md border bg-muted/30 px-3 py-2.5 text-xs space-y-1.5"
          >
            <span class="font-medium text-xs">Simulasi Nilai</span>
            <div class="space-y-0.5">
              <div
                v-for="type in usedTypes"
                :key="type"
                class="flex items-center justify-between text-muted-foreground"
              >
                <span>{{ ASSESSMENT_TYPE_LABELS[type] }}</span>
                <span class="tabular-nums">
                  {{ SAMPLE_SCORES[type] }} × {{ weights[type] }}% =
                  <span class="text-foreground font-medium">
                    {{
                      (
                        ((SAMPLE_SCORES[type] ?? 0) * weights[type]) /
                        100
                      ).toFixed(1)
                    }}
                  </span>
                </span>
              </div>
            </div>
            <div
              class="border-t pt-1.5 flex items-center justify-between text-sm"
            >
              <span class="font-medium">Nilai Akhir</span>
              <span class="font-bold tabular-nums">{{ sampleResult }}</span>
            </div>
          </div>
        </template>
      </div>

      <DialogFooter
        class="px-6 py-3 border-t shrink-0 flex sm:justify-between w-full bg-background"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          @click="open = false"
        >
          Batal
        </Button>
        <Button
          type="button"
          size="sm"
          :disabled="!isBalanced || isSaving || loading"
          @click="handleSave"
        >
          <Loader2
            v-if="isSaving"
            class="mr-1.5 size-3.5 animate-spin"
          />
          Simpan
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
