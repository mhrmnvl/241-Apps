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
import { AlertTriangle, Check, Copy } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { credentialService } from '../services/credentialService'
import { useCredentialStore } from '../stores/credentialStore'
import type { PresenceSubjectType } from '../types'

const open = defineModel<boolean>('open', { required: true })

const store = useCredentialStore()
const userId = ref('')
const subjectType = ref<PresenceSubjectType>('STUDENT')
const copied = ref(false)

watch(open, (isOpen) => {
  if (!isOpen) {
    userId.value = ''
    subjectType.value = 'STUDENT'
    copied.value = false
    store.clearIssued()
  }
})

async function submit() {
  if (!userId.value) {
    toast.error('Pilih orang yang akan diberi kartu.')
    return
  }
  await credentialService.issue({
    userId: userId.value,
    subjectType: subjectType.value,
  })
}

async function copyCode() {
  if (!store.lastIssued) return
  await navigator.clipboard.writeText(store.lastIssued.code)
  copied.value = true
  toast.success('Kode disalin.')
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Terbitkan Kartu</DialogTitle>
        <DialogDescription>
          Menerbitkan kartu memulai riwayat kehadiran orang ini. Hari sebelum
          kartu terbit tidak dihitung alpa.
        </DialogDescription>
      </DialogHeader>

      <!-- Shown exactly once: the server never returns the code again on a list
           or detail read, so this panel is the only chance to keep it. -->
      <div
        v-if="store.lastIssued"
        class="space-y-3"
      >
        <div
          class="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Kode ini hanya ditampilkan sekali. Salin atau langsung cetak
            kartunya — setelah dialog ditutup, kode tidak bisa dilihat lagi.
          </p>
        </div>

        <div class="space-y-1">
          <Label>Kode kartu</Label>
          <div class="flex gap-2">
            <Input
              :model-value="store.lastIssued.code"
              readonly
              class="font-mono"
            />
            <Button
              type="button"
              variant="outline"
              @click="copyCode"
            >
              <Check
                v-if="copied"
                class="h-4 w-4"
              />
              <Copy
                v-else
                class="h-4 w-4"
              />
            </Button>
          </div>
        </div>
      </div>

      <div
        v-else
        class="space-y-4"
      >
        <div class="space-y-1">
          <Label for="credential-user">ID Pengguna</Label>
          <Input
            id="credential-user"
            v-model="userId"
            placeholder="UUID pengguna"
          />
        </div>

        <div class="space-y-1">
          <Label for="credential-subject">Jenis</Label>
          <select
            id="credential-subject"
            v-model="subjectType"
            class="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="STUDENT">Siswa</option>
            <option value="EMPLOYEE">Pegawai</option>
          </select>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          @click="open = false"
        >
          {{ store.lastIssued ? 'Selesai' : 'Batal' }}
        </Button>
        <Button
          v-if="!store.lastIssued"
          :disabled="store.isSaving"
          @click="submit"
        >
          Terbitkan
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
