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
import { Label } from '@/ui/label'
import { Loader2 } from 'lucide-vue-next'
import { computed, watch } from 'vue'
import { useAssessmentWeights } from '../composables/useAssessmentWeights'
import { ASSESSMENT_TYPE_LABELS, ASSESSMENT_TYPE_ORDER } from '../types'

const props = defineProps<{
  teachingAssignmentId: string
  /** Shown in the header so the teacher knows which class they are editing. */
  contextLabel?: string
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

/**
 * A worked example, recomputed as the teacher types.
 *
 * Percentages are abstract until you see one turn into a number. The sample
 * marks are fixed so the only thing moving is the effect of the weights.
 */
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
  return (sum / 100).toFixed(2)
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
    <DialogContent class="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Bobot Penilaian</DialogTitle>
        <DialogDescription>
          Menentukan seberapa besar tiap jenis penilaian menyumbang ke nilai
          akhir mata pelajaran{{ contextLabel ? ` — ${contextLabel}` : '' }}.
          Menambah ulangan harian baru tidak akan menggeser porsinya.
        </DialogDescription>
      </DialogHeader>

      <div
        v-if="loading"
        class="flex items-center justify-center py-10 text-muted-foreground"
      >
        <Loader2 class="size-5 animate-spin" />
      </div>

      <div
        v-else
        class="space-y-4"
      >
        <div class="space-y-2.5">
          <div
            v-for="type in ASSESSMENT_TYPE_ORDER"
            :key="type"
            class="grid grid-cols-[1fr_7rem] items-center gap-3"
          >
            <Label :for="`weight-${type}`">
              {{ ASSESSMENT_TYPE_LABELS[type] }}
            </Label>
            <div class="relative">
              <Input
                :id="`weight-${type}`"
                type="number"
                min="0"
                max="100"
                class="pr-7 text-right"
                :model-value="weights[type]"
                @update:model-value="(val) => setWeight(type, val)"
              />
              <span
                class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
              >
                %
              </span>
            </div>
          </div>
        </div>

        <div
          class="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
          :class="
            isBalanced
              ? 'border-border text-muted-foreground'
              : 'border-destructive/50 bg-destructive/5 text-destructive'
          "
        >
          <span>Total</span>
          <span class="font-medium">
            {{ total }}%
            <template v-if="!isBalanced">
              —
              {{
                remaining > 0 ? `kurang ${remaining}` : `lebih ${-remaining}`
              }}
            </template>
          </span>
        </div>

        <div
          v-if="sampleResult"
          class="rounded-md bg-muted/50 px-3 py-2.5 text-sm"
        >
          <p class="mb-1 font-medium">Contoh perhitungan</p>
          <p class="text-muted-foreground">
            <template
              v-for="(type, index) in usedTypes"
              :key="type"
            >
              {{ ASSESSMENT_TYPE_LABELS[type] }} {{ SAMPLE_SCORES[type] }} ×
              {{ weights[type] }}%{{
                index < usedTypes.length - 1 ? ' + ' : ''
              }}
            </template>
            =
            <span class="font-semibold text-foreground">{{
              sampleResult
            }}</span>
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          @click="applyDefault"
        >
          Isi standar 40 / 30 / 30
        </Button>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          @click="open = false"
        >
          Batal
        </Button>
        <Button
          type="button"
          :disabled="!isBalanced || isSaving || loading"
          @click="handleSave"
        >
          <Loader2
            v-if="isSaving"
            class="mr-2 size-4 animate-spin"
          />
          Simpan
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
