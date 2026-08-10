<script setup lang="ts">
import { Button } from '@/ui/button'
import { CheckCircle2, Lock, RefreshCw, Send } from 'lucide-vue-next'
import { isWorking, payrollRunService } from '../services/payrollRunService'
import type { PayrollRun } from '../types'

const props = defineProps<{ run: PayrollRun }>()
const emit = defineEmits<{ changed: [] }>()

async function recalculate() {
  await payrollRunService.recalculate(props.run.id)
  emit('changed')
}

async function submit() {
  if (await payrollRunService.submit(props.run.id)) emit('changed')
}

async function approve() {
  const confirmed = window.confirm(
    'Setujui penggajian ini? Setelah disetujui tidak bisa diubah — koreksi dilakukan lewat run penyesuaian.',
  )
  if (confirmed && (await payrollRunService.approve(props.run.id))) {
    emit('changed')
  }
}
</script>

<template>
  <!-- Approved is a stated end, not a row of greyed-out buttons: a disabled
       control with no explanation reads as a bug. -->
  <div
    v-if="run.status === 'APPROVED'"
    class="flex items-start gap-3 rounded-lg border border-dashed p-4"
  >
    <Lock class="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
    <div class="text-sm">
      <p class="font-medium">Final — disetujui</p>
      <p class="text-muted-foreground">
        Disetujui oleh {{ run.approvedBy?.displayName ?? '—' }}. Koreksi bulan
        ini dilakukan lewat run penyesuaian, bukan dengan mengubah run ini.
      </p>
    </div>
  </div>

  <div
    v-else
    class="flex flex-wrap gap-2"
  >
    <Button
      v-if="run.status === 'DRAFT'"
      variant="outline"
      :disabled="isWorking"
      @click="recalculate"
    >
      <RefreshCw class="mr-2 h-4 w-4" />
      Hitung ulang
    </Button>

    <Button
      v-if="run.status === 'DRAFT'"
      :disabled="isWorking"
      @click="submit"
    >
      <Send class="mr-2 h-4 w-4" />
      Ajukan
    </Button>

    <Button
      v-if="run.status === 'SUBMITTED'"
      :disabled="isWorking"
      @click="approve"
    >
      <CheckCircle2 class="mr-2 h-4 w-4" />
      Setujui
    </Button>

    <p
      v-if="run.status === 'SUBMITTED'"
      class="text-muted-foreground w-full text-xs"
    >
      Penyetuju harus orang lain, bukan yang membuat run ini.
    </p>
  </div>
</template>
