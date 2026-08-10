<script setup lang="ts">
import { Button } from '@/ui/button'
import QRCode from 'qrcode'
import { onMounted, ref, watch } from 'vue'
import { credentialService } from '../services/credentialService'
import { useCredentialStore } from '../stores/credentialStore'

const props = defineProps<{ userIds: string[] }>()

const store = useCredentialStore()
const qrByCredential = ref<Record<string, string>>({})

/**
 * Rendered client-side rather than fetched as an image: printing has to work on
 * a gate PC with no internet, and a server-side renderer would put a rendering
 * concern inside a use case.
 *
 * Error correction level M and a wide quiet zone are what survive a laser
 * printer and a scratched card — the QR is scanned daily for years, not once.
 */
async function renderCodes() {
  const rendered: Record<string, string> = {}

  for (const credential of store.printBatch) {
    rendered[credential.id] = await QRCode.toDataURL(credential.code, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
    })
  }

  qrByCredential.value = rendered
}

watch(() => store.printBatch, renderCodes, { deep: true })

function printSheet() {
  window.print()
}

onMounted(async () => {
  await credentialService.loadPrintBatch(props.userIds)
})
</script>

<template>
  <div class="space-y-6 p-6">
    <div class="flex items-center justify-between print:hidden">
      <div>
        <h1 class="text-lg font-semibold">Cetak Kartu</h1>
        <p class="text-muted-foreground text-sm">
          {{ store.printBatch.length }} kartu siap dicetak.
        </p>
      </div>
      <Button
        :disabled="store.printBatch.length === 0"
        @click="printSheet"
      >
        Cetak
      </Button>
    </div>

    <div
      class="grid grid-cols-2 gap-4 print:grid-cols-2"
      data-testid="card-sheet"
    >
      <div
        v-for="credential in store.printBatch"
        :key="credential.id"
        class="flex items-center gap-4 rounded-lg border p-4 break-inside-avoid"
      >
        <img
          v-if="qrByCredential[credential.id]"
          :src="qrByCredential[credential.id]"
          :alt="`QR ${credential.holder.displayName ?? ''}`"
          class="h-28 w-28"
        />
        <div class="min-w-0 space-y-1">
          <p class="truncate font-semibold">
            {{ credential.holder.displayName ?? 'Tanpa nama' }}
          </p>
          <p class="text-muted-foreground font-mono text-sm">
            {{ credential.holder.identifier }}
          </p>
          <p class="text-muted-foreground text-xs">
            {{ credential.subjectType === 'STUDENT' ? 'Siswa' : 'Pegawai' }}
          </p>
        </div>
      </div>
    </div>

    <p
      v-if="!store.loading && store.printBatch.length === 0"
      class="text-muted-foreground py-12 text-center text-sm"
    >
      Tidak ada kartu aktif untuk orang yang dipilih.
    </p>
  </div>
</template>
