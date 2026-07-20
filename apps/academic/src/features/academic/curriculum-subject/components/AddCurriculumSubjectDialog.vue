<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Subject } from '@/features/academic/subject'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  subjects: Subject[]
  existingSubjectIds: string[]
  saving: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [subjectIds: string[]]
}>()

const dialogOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const selectedIds = ref<Record<string, boolean>>({})
const searchQuery = ref('')

watch(
  () => props.open,
  (val) => {
    if (val) {
      selectedIds.value = {}
      searchQuery.value = ''
    }
  },
)

// Filter out subjects that are already in the curriculum
const availableSubjects = computed(() => {
  return props.subjects.filter((s) => !props.existingSubjectIds.includes(s.id))
})

const filteredSubjects = computed(() => {
  if (!searchQuery.value) return availableSubjects.value
  const q = searchQuery.value.toLowerCase()
  return availableSubjects.value.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      (s.code && s.code.toLowerCase().includes(q)),
  )
})

const selectedCount = computed(
  () => Object.values(selectedIds.value).filter(Boolean).length,
)

const allChecked = computed(
  () =>
    filteredSubjects.value.length > 0 &&
    filteredSubjects.value.every((s) => selectedIds.value[s.id]),
)

const someChecked = computed(
  () =>
    filteredSubjects.value.some((s) => selectedIds.value[s.id]) &&
    !allChecked.value,
)

function toggleSubject(id: string, checked: boolean) {
  selectedIds.value = { ...selectedIds.value, [id]: checked }
}

function toggleAll(checked: boolean) {
  const next = { ...selectedIds.value }
  for (const s of filteredSubjects.value) {
    next[s.id] = checked
  }
  selectedIds.value = next
}

function handleSave() {
  const ids = Object.entries(selectedIds.value)
    .filter(([, v]) => v)
    .map(([k]) => k)
  if (ids.length === 0) return
  emit('save', ids)
}
</script>

<template>
  <Dialog v-model:open="dialogOpen">
    <DialogContent class="sm:max-w-3xl max-h-[85vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>Tambah Mata Pelajaran ke Kurikulum</DialogTitle>
        <DialogDescription>
          Pilih mata pelajaran yang akan didaftarkan ke kurikulum ini.
        </DialogDescription>
      </DialogHeader>

      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2"
      >
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p class="text-sm text-muted-foreground shrink-0">
            {{ filteredSubjects.length }} mata pelajaran tersedia
          </p>
        </div>
        <Input
          v-model="searchQuery"
          placeholder="Cari nama / kode mata pelajaran..."
          class="h-8 w-full sm:max-w-xs text-sm"
        />
      </div>

      <div class="flex-1 overflow-y-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow class="bg-muted/50 hover:bg-muted/50">
              <TableHead class="w-[50px] text-center px-4">
                <input
                  type="checkbox"
                  class="size-4 rounded accent-primary cursor-pointer"
                  :checked="allChecked"
                  :indeterminate="someChecked"
                  aria-label="Pilih semua"
                  @change="
                    toggleAll(($event.target as HTMLInputElement).checked)
                  "
                />
              </TableHead>
              <TableHead class="w-[50px] text-center px-4"> No </TableHead>
              <TableHead class="px-4">Kode</TableHead>
              <TableHead class="px-4">Nama Mata Pelajaran</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="filteredSubjects.length > 0">
              <TableRow
                v-for="(subject, idx) in filteredSubjects"
                :key="subject.id"
                class="cursor-pointer"
                :class="{ 'bg-primary/5': selectedIds[subject.id] }"
                @click="toggleSubject(subject.id, !selectedIds[subject.id])"
              >
                <TableCell
                  class="w-[50px] text-center px-4"
                  @click.stop
                >
                  <input
                    type="checkbox"
                    class="size-4 rounded accent-primary cursor-pointer"
                    :checked="!!selectedIds[subject.id]"
                    aria-label="Pilih baris"
                    @change="
                      toggleSubject(
                        subject.id,
                        ($event.target as HTMLInputElement).checked,
                      )
                    "
                  />
                </TableCell>
                <TableCell class="w-[50px] text-center px-4">
                  {{ idx + 1 }}
                </TableCell>
                <TableCell class="px-4">{{ subject.code || '-' }}</TableCell>
                <TableCell class="px-4 font-medium">{{
                  subject.name
                }}</TableCell>
              </TableRow>
            </template>
            <template v-else>
              <TableRow>
                <TableCell
                  :colspan="4"
                  class="h-24 text-center text-muted-foreground"
                >
                  Tidak ada mata pelajaran tersedia untuk ditambahkan.
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>

      <DialogFooter class="pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          :disabled="saving"
          @click="dialogOpen = false"
        >
          Batal
        </Button>
        <Button
          type="button"
          :disabled="selectedCount === 0 || saving"
          @click="handleSave"
        >
          <Loader2
            v-if="saving"
            class="mr-2 h-4 w-4 animate-spin"
          />
          {{
            saving
              ? 'Menyimpan...'
              : selectedCount > 0
                ? `Tambahkan ${selectedCount} Mata Pelajaran`
                : 'Pilih mata pelajaran dulu'
          }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
