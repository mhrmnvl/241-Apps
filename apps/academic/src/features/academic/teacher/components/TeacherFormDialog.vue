<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type {
  TeacherSavePayload,
  TeacherUpdatePayload,
  TeacherEditData,
  PositionListItem,
} from '../types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/alert-dialog'
import { Button } from '@/ui/button'
import { ScrollArea } from '@/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import TeacherProfileTabFields from './TeacherProfileTabFields.vue'
import TeacherEmploymentTabFields from './TeacherEmploymentTabFields.vue'
import { useTeacherFormDialog } from '../composables/useTeacherFormDialog'

const props = defineProps<{
  open: boolean
  formError: string | null
  isSaving: boolean
  editData?: TeacherEditData | null
  positions?: PositionListItem[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: TeacherSavePayload | TeacherUpdatePayload]
  'save-position': [
    teacherId: string,
    positionId: string,
    oldPositionLinkId: string | null,
  ]
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value) dialog.resetForm()
    emit('update:open', value)
  },
})

const { editData, positions } = toRefs(props)
const positionsRef = computed(() => positions?.value ?? [])

const dialog = useTeacherFormDialog({
  open,
  editData,
  positions: positionsRef,
  onSave: (data) => emit('save', data),
  onSavePosition: (teacherId, positionId, oldLinkId) =>
    emit('save-position', teacherId, positionId, oldLinkId),
  onClose: () => {
    open.value = false
  },
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-2xl flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>
          {{ dialog.isEditing.value ? 'Edit Data Guru' : 'Tambah Guru Baru' }}
        </DialogTitle>
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="teacher-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="dialog.handleNext"
        >
          <Tabs
            v-model="dialog.activeTab.value"
            class="w-full"
          >
            <TabsList class="grid w-full grid-cols-2 mb-4">
              <TabsTrigger
                value="profil"
                :disabled="dialog.isEditing.value"
              >
                Informasi Profil
              </TabsTrigger>
              <TabsTrigger value="kepegawaian"> Kepegawaian </TabsTrigger>
            </TabsList>

            <TabsContent
              value="profil"
              class="space-y-4 mt-0"
            >
              <TeacherProfileTabFields />
            </TabsContent>

            <TabsContent
              value="kepegawaian"
              class="space-y-4 mt-0"
            >
              <TeacherEmploymentTabFields
                v-model="dialog.kategori.value"
                :employment-types="dialog.employmentTypes.value"
                :category-options="dialog.categoryOptions.value"
                :filtered-positions="dialog.filteredPositions.value"
              />
            </TabsContent>
          </Tabs>
        </form>
      </ScrollArea>

      <DialogFooter
        class="p-6 border-t bg-muted/10 flex items-center justify-between shrink-0"
      >
        <Button
          type="button"
          variant="outline"
          :disabled="isSaving"
          @click="dialog.handleBack"
        >
          {{
            dialog.isEditing.value
              ? 'Batal'
              : dialog.activeTab.value === 'profil'
                ? 'Batal'
                : 'Kembali'
          }}
        </Button>
        <Button
          type="button"
          :disabled="isSaving"
          @click="dialog.handleNext"
        >
          {{
            isSaving
              ? 'Menyimpan...'
              : dialog.isEditing.value
                ? 'Simpan Perubahan'
                : dialog.activeTab.value === 'profil'
                  ? 'Lanjut Kepegawaian'
                  : 'Simpan Guru'
          }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <AlertDialog v-model:open="dialog.showConfirmAlert.value">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Konfirmasi Perubahan</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin menyimpan perubahan data guru ini?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Batal</AlertDialogCancel>
        <AlertDialogAction @click="dialog.confirmSave">
          Ya, Simpan
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
