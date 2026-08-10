<script setup lang="ts">
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { Plus } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import IssueCredentialDialog from '../components/IssueCredentialDialog.vue'
import { credentialService } from '../services/credentialService'
import { useCredentialStore } from '../stores/credentialStore'
import type { CredentialStatus } from '../types'

const store = useCredentialStore()
const issueOpen = ref(false)

const STATUS_LABEL: Record<CredentialStatus, string> = {
  ACTIVE: 'Aktif',
  REVOKED: 'Dicabut',
  REPLACED: 'Diganti',
}

function statusVariant(status: CredentialStatus) {
  return status === 'ACTIVE' ? 'default' : 'secondary'
}

async function search() {
  store.page = 1
  await credentialService.fetchCredentials()
}

async function revoke(id: string) {
  const reason = window.prompt('Alasan pencabutan (mis. kartu hilang)')
  if (!reason) return
  await credentialService.revoke(id, { reason })
}

onMounted(() => void credentialService.fetchCredentials())
</script>

<template>
  <div class="space-y-4 p-4 md:p-6 lg:p-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold">Kartu Presensi</h1>
        <p class="text-muted-foreground text-sm">
          Menerbitkan kartu memulai riwayat kehadiran; mencabutnya mengakhiri.
        </p>
      </div>
      <Button @click="issueOpen = true">
        <Plus class="mr-2 h-4 w-4" />
        Terbitkan
      </Button>
    </div>

    <Input
      v-model="store.search"
      placeholder="Cari nama pemegang kartu…"
      class="max-w-sm"
      @keyup.enter="search"
    />

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Identitas</TableHead>
          <TableHead>Jenis</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="item in store.items"
          :key="item.id"
        >
          <TableCell>{{ item.holder.displayName ?? '—' }}</TableCell>
          <TableCell class="font-mono text-sm">
            {{ item.holder.identifier }}
          </TableCell>
          <TableCell>
            {{ item.subjectType === 'STUDENT' ? 'Siswa' : 'Pegawai' }}
          </TableCell>
          <TableCell>
            <Badge :variant="statusVariant(item.status)">
              {{ STATUS_LABEL[item.status] }}
            </Badge>
          </TableCell>
          <TableCell class="text-right">
            <Button
              v-if="item.status === 'ACTIVE'"
              variant="ghost"
              size="sm"
              @click="revoke(item.id)"
            >
              Cabut
            </Button>
          </TableCell>
        </TableRow>
        <TableRow v-if="!store.loading && store.items.length === 0">
          <TableCell
            colspan="5"
            class="text-muted-foreground py-10 text-center"
          >
            Belum ada kartu diterbitkan.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <IssueCredentialDialog v-model:open="issueOpen" />
  </div>
</template>
