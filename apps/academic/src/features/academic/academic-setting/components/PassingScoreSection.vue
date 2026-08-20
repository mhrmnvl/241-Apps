<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@/ui/input'
import { Alert, AlertDescription } from '@/ui/alert'
import {
  PASSING_SCORE_MAX,
  PASSING_SCORE_MIN,
} from '../constants/passing-score'

const props = defineProps<{
  score: number
  isSaving: boolean
  canEdit?: boolean
}>()

const emit = defineEmits<{ update: [score: number] }>()

/**
 * Mirrors the API's own bounds so the reason lands under the field rather than
 * arriving as a rejected request.
 */
const error = computed(() => {
  if (!Number.isInteger(props.score))
    return 'Nilai harus berupa bilangan bulat.'
  if (props.score < PASSING_SCORE_MIN)
    return `Nilai minimal ${PASSING_SCORE_MIN}.`
  if (props.score > PASSING_SCORE_MAX)
    return `Nilai maksimal ${PASSING_SCORE_MAX}.`
  return null
})

function onInput(value: string | number) {
  const parsed = Number(String(value).replace(/\D/g, ''))
  emit('update', Number.isNaN(parsed) ? 0 : parsed)
}
</script>

<template>
  <div class="space-y-6 max-w-3xl">
    <div class="space-y-1">
      <h3 class="text-base font-semibold text-foreground">Nilai</h3>
    </div>

    <div class="space-y-2.5">
      <label
        for="default-passing-score"
        class="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
      >
        KKM Default Sekolah
      </label>
      <Input
        id="default-passing-score"
        type="text"
        inputmode="numeric"
        class="h-10 w-28"
        :model-value="String(score)"
        :disabled="isSaving || !canEdit"
        :aria-invalid="Boolean(error)"
        @update:model-value="onInput"
      />
      <p class="text-sm text-muted-foreground max-w-prose">
        Dipakai hanya ketika sebuah mata pelajaran dinilai tetapi tidak
        tercantum di kurikulum tingkat dan tahun tersebut — jadi tidak ada KKM
        yang bisa dibaca. Nilai pada penugasan mengajar dan kurikulum selalu
        didahulukan.
      </p>
    </div>

    <Alert
      v-if="error"
      variant="destructive"
    >
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>
  </div>
</template>
