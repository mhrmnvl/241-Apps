<script setup lang="ts" generic="T extends MasterDataEntity">
import { onMounted, ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { useMasterDataCrud } from '../composables/useMasterDataCrud'
import { buildColumns } from './buildColumns'
import MasterDataFormDialog from './MasterDataFormDialog.vue'
import type { MasterDataConfig, MasterDataEntity } from '../types/config'

const props = defineProps<{
  config: MasterDataConfig<T>
}>()

const { data, isLoading, isSubmitting, fetchAll, create, update, remove } =
  useMasterDataCrud(props.config)

const isAddOpen = ref(false)
const isEditOpen = ref(false)
const selectedItem = ref<T | null>(null)

function openEdit(item: T) {
  selectedItem.value = { ...item }
  isEditOpen.value = true
}

async function handleAddSave(payload: Record<string, unknown>) {
  const success = await create(payload)
  if (success) isAddOpen.value = false
}

async function handleEditSave(payload: Record<string, unknown>) {
  if (!selectedItem.value) return
  const success = await update(selectedItem.value.id, payload)
  if (success) isEditOpen.value = false
}

const columns = buildColumns(props.config, openEdit, (item, callbacks) => {
  void remove(item, callbacks)
})

const firstTextFieldKey = props.config.fields.find(
  (f) => f.kind === 'text',
)?.key

onMounted(() => {
  void fetchAll()
})
</script>

<template>
  <Card
    class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
  >
    <CardHeader
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
    >
      <CardTitle class="text-2xl font-bold tracking-tight">
        {{ config.entityLabel.plural }}
      </CardTitle>
      <Button
        v-if="config.permissions.canCreate"
        class="w-full sm:w-auto"
        @click="isAddOpen = true"
      >
        <Plus class="mr-2 h-4 w-4" /> Tambah {{ config.entityLabel.singular }}
      </Button>
    </CardHeader>

    <div class="p-6">
      <DataTable
        :columns="columns"
        :data="data"
        :is-loading="isLoading"
        :item-label="config.entityLabel.plural.toLowerCase()"
        :filter-column="firstTextFieldKey"
        :filter-placeholder="`Cari ${config.entityLabel.plural.toLowerCase()}...`"
      />
    </div>
  </Card>

  <MasterDataFormDialog
    v-if="config.permissions.canCreate"
    v-model:open="isAddOpen"
    :fields="config.fields"
    :entity-label="config.entityLabel"
    :is-submitting="isSubmitting"
    @save="handleAddSave"
  />

  <MasterDataFormDialog
    v-if="config.permissions.canUpdate"
    v-model:open="isEditOpen"
    :fields="config.fields"
    :entity-label="config.entityLabel"
    :is-submitting="isSubmitting"
    :initial-data="selectedItem"
    @save="handleEditSave"
  />
</template>
