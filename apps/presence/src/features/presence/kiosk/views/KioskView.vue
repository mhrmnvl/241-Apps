<script setup lang="ts">
import { CloudOff, Loader2, ScanLine } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useScanQueue } from '../composables/useScanQueue'
import { useServerClock } from '../composables/useServerClock'
import { kioskService } from '../services/kioskService'
import type { ScanResult } from '../types'
import KioskPairingView from './KioskPairingView.vue'

const CLOCK_SYNC_MS = 5 * 60_000
const FLUSH_RETRY_MS = 30_000
const FEEDBACK_MS = 4_000

const token = ref(kioskService.readToken())
const queue = useScanQueue()
const clock = useServerClock()

const buffer = ref('')
const busy = ref(false)
const lastResult = ref<ScanResult | null>(null)
const lastQueued = ref(false)
const scannerInput = ref<HTMLInputElement | null>(null)

let feedbackTimer: number | undefined
let clockTimer: number | undefined
let flushTimer: number | undefined

/**
 * An HID barcode scanner presents itself to the OS as a keyboard: it "types"
 * the code and presses Enter. So the whole reader is a focused input and a
 * keyup handler — no camera, no permission prompt, no decoding library
 * (research R2). The input stays hidden and re-focused so a stray tap never
 * leaves the gate deaf.
 */
function refocus() {
  scannerInput.value?.focus()
}

async function onScan() {
  const code = buffer.value.trim()
  buffer.value = ''
  if (!code || busy.value || !token.value) return

  busy.value = true
  try {
    const { result, queued } = await kioskService.submit(
      token.value,
      code,
      clock,
      queue,
    )
    lastResult.value = result
    lastQueued.value = queued

    window.clearTimeout(feedbackTimer)
    feedbackTimer = window.setTimeout(() => {
      lastResult.value = null
    }, FEEDBACK_MS)

    if (!queued) void flush()
  } finally {
    busy.value = false
    refocus()
  }
}

async function flush() {
  if (!token.value) return
  await kioskService.flush(token.value, queue)
}

/** The listener must return void, not a promise. */
function onBackOnline() {
  void flush()
}

async function syncClock() {
  if (!token.value) return
  await kioskService.syncClock(token.value, clock)
}

function onPaired() {
  token.value = kioskService.readToken()
  void syncClock()
  refocus()
}

const accepted = computed(
  () => lastResult.value?.outcome === 'ACCEPTED' && !lastQueued.value,
)
const duplicate = computed(() => lastResult.value?.outcome === 'DUPLICATE')
const rejected = computed(
  () => lastResult.value?.outcome.startsWith('REJECTED') ?? false,
)

const headline = computed(() => {
  if (!lastResult.value) return ''
  if (lastQueued.value) return 'Tersimpan — menunggu koneksi'
  if (duplicate.value) return 'Sudah tercatat'
  if (rejected.value) return lastResult.value.rejectionReason ?? 'Kartu ditolak'
  return lastResult.value.direction === 'CHECK_OUT' ? 'Pulang' : 'Masuk'
})

const subline = computed(() => {
  const result = lastResult.value
  if (!result || rejected.value || lastQueued.value) return ''
  if (result.dayStatus === 'LATE')
    return `Terlambat ${result.lateMinutes} menit`
  if (result.dayStatus === 'NOT_EXPECTED') return 'Hari ini bukan hari kerja'
  return 'Tepat waktu'
})

onMounted(() => {
  void syncClock()
  void queue.refreshCount()
  void flush()
  clockTimer = window.setInterval(() => void syncClock(), CLOCK_SYNC_MS)
  flushTimer = window.setInterval(() => void flush(), FLUSH_RETRY_MS)
  window.addEventListener('online', onBackOnline)
  refocus()
})

onUnmounted(() => {
  window.clearInterval(clockTimer)
  window.clearInterval(flushTimer)
  window.clearTimeout(feedbackTimer)
  window.removeEventListener('online', onBackOnline)
})
</script>

<template>
  <KioskPairingView
    v-if="!token"
    @paired="onPaired"
  />

  <div
    v-else
    class="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 p-8"
    @click="refocus"
  >
    <!-- Off-screen rather than hidden: a display:none input cannot hold focus,
         and losing focus makes the scanner silently stop working. -->
    <input
      ref="scannerInput"
      v-model="buffer"
      class="absolute -left-[9999px]"
      autocomplete="off"
      @keyup.enter="onScan"
      @blur="refocus"
    />

    <!-- Not decoration: the realistic failure is nobody noticing the gate has
         been offline since Tuesday, and a queue depth is what a petugas acts on. -->
    <div
      v-if="queue.pendingCount.value > 0"
      class="absolute top-6 right-6 flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950"
    >
      <CloudOff class="h-4 w-4" />
      {{ queue.pendingCount.value }} scan menunggu koneksi
    </div>

    <div
      v-if="busy"
      class="flex flex-col items-center gap-4 text-slate-400"
    >
      <Loader2 class="h-16 w-16 animate-spin" />
    </div>

    <div
      v-else-if="lastResult"
      class="flex w-full max-w-2xl flex-col items-center gap-6 rounded-2xl p-12 text-center"
      :class="{
        'bg-emerald-500/10 ring-4 ring-emerald-500': accepted,
        'bg-slate-800 ring-4 ring-slate-600': duplicate || lastQueued,
        'bg-red-500/10 ring-4 ring-red-500': rejected,
      }"
    >
      <img
        v-if="lastResult.person?.photoUrl"
        :src="lastResult.person.photoUrl"
        alt=""
        class="h-32 w-32 rounded-full object-cover"
      />

      <div class="space-y-2">
        <!-- No name on a rejection: an unknown or revoked card must not tell the
             person holding it whose card it is (FR-004). -->
        <p
          v-if="lastResult.person"
          class="text-5xl font-bold text-white"
        >
          {{ lastResult.person.displayName ?? 'Tanpa nama' }}
        </p>
        <p
          class="text-3xl font-semibold"
          :class="{
            'text-emerald-400': accepted,
            'text-slate-300': duplicate || lastQueued,
            'text-red-400': rejected,
          }"
        >
          {{ headline }}
        </p>
        <p
          v-if="subline"
          class="text-xl text-slate-400"
        >
          {{ subline }}
        </p>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center gap-6 text-slate-500"
    >
      <ScanLine class="h-24 w-24" />
      <p class="text-3xl font-medium">Tempelkan kartu Anda</p>
    </div>
  </div>
</template>
