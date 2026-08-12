<script setup lang="ts">
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { watchDebounced } from '@vueuse/core'
import { Plus, Search } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { createCredentialColumns } from '../components/credentialColumns'
import IssueCredentialDialog from '../components/IssueCredentialDialog.vue'
import { credentialService } from '../services/credentialService'
import { useCredentialStore } from '../stores/credentialStore'
import type { Credential } from '../types'

const store = useCredentialStore()
const issueOpen = ref(false)

async function handleRevoke(credential: Credential) {
  const reason = window.prompt(
    `Alasan pencabutan kartu "${credential.holder.displayName ?? credential.holder.identifier}" (mis. kartu hilang):`,
  )
  if (!reason) return
  await credentialService.revoke(credential.id, { reason })
}

const tableColumns = computed(() =>
  createCredentialColumns((item) => void handleRevoke(item)),
)

watchDebounced(
  () => store.search,
  () => {
    store.page = 1
    void credentialService.fetchCredentials()
  },
  { debounce: 300 },
)

watch(
  () => [store.page, store.limit],
  () => void credentialService.fetchCredentials(),
)

onMounted(() => void credentialService.fetchCredentials())
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Kartu Presensi
        </CardTitle>
        <Button @click="issueOpen = true">
          <Plus class="mr-2 h-4 w-4" />
          Terbitkan
        </Button>
      </CardHeader>

      <div class="p-6 space-y-6">
        <DataTable
          v-model:page="store.page"
          v-model:page-size="store.limit"
          :columns="tableColumns"
          :data="store.items"
          :total-items="store.totalItems"
          :is-loading="store.loading"
          item-label="kartu presensi"
        >
          <template #header-right>
            <div class="relative w-full sm:w-64">
              <Search
                class="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                v-model="store.search"
                placeholder="Cari nama pemegang kartu…"
                class="h-8 pl-8 text-xs w-full"
              />
            </div>
          </template>
        </DataTable>

        <IssueCredentialDialog v-model:open="issueOpen" />
      </div>
    </Card>
  </div>
</template>
