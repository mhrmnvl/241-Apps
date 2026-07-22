<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useAssessmentItemForm } from '../composables/useAssessmentItemForm'
import type { AssessmentItem } from '../types'
import { Alert, AlertDescription } from '@/ui/alert'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { AlertCircle, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  teachingAssignmentId: string | null
  editData?: AssessmentItem | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save-success': []
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const { editData } = toRefs(props)

const assessmentTypeOptions: {
  value: AssessmentItem['type']
  label: string
}[] = [
  { value: 'DAILY', label: 'Harian' },
  { value: 'ASSIGNMENT', label: 'Tugas' },
  { value: 'PRACTICAL', label: 'Praktikum' },
  { value: 'MIDTERM', label: 'UTS' },
  { value: 'FINAL', label: 'UAS' },
]

const itemForm = useAssessmentItemForm({
  teachingAssignmentId: () => props.teachingAssignmentId,
  editData: () => editData.value ?? null,
  isOpen: () => props.open,
  onSuccess: () => {
    emit('save-success')
    open.value = false
  },
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{
          itemForm.isEditing.value ? 'Ubah Tugas' : 'Tambah Tugas'
        }}</DialogTitle>
        <DialogDescription>
          {{
            itemForm.isEditing.value
              ? 'Perbarui informasi tugas. Klik simpan untuk menerapkan.'
              : 'Tambahkan tugas/komponen penilaian baru untuk mata pelajaran ini.'
          }}
        </DialogDescription>
      </DialogHeader>

      <form
        id="assessment-item-form"
        class="space-y-4 py-2"
        @submit.prevent="itemForm.onSubmit"
      >
        <FormField
          v-slot="{ value, handleChange }"
          name="name"
        >
          <FormItem>
            <FormLabel
              >Nama Tugas <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                :model-value="value"
                placeholder="Contoh: Ulangan Harian Bab 3"
                @update:model-value="handleChange"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ value, handleChange }"
          name="type"
        >
          <FormItem>
            <FormLabel>Tipe <span class="text-destructive">*</span></FormLabel>
            <Select
              :model-value="value"
              @update:model-value="handleChange"
            >
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem
                  v-for="opt in assessmentTypeOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <FormField
            v-slot="{ value, handleChange }"
            name="weight"
          >
            <FormItem>
              <FormLabel>Bobot (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  :model-value="value"
                  @update:model-value="(v) => handleChange(Number(v))"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="maxScore"
          >
            <FormItem>
              <FormLabel>Skor Maksimal</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="1000"
                  :model-value="value"
                  @update:model-value="(v) => handleChange(Number(v))"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <Alert
          v-if="itemForm.formError.value"
          variant="destructive"
          class="mt-2"
        >
          <AlertCircle class="size-4" />
          <AlertDescription>{{ itemForm.formError.value }}</AlertDescription>
        </Alert>
      </form>

      <DialogFooter class="flex sm:justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          :disabled="itemForm.isSaving.value"
          @click="open = false"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="assessment-item-form"
          :disabled="itemForm.isSaving.value"
        >
          <Loader2
            v-if="itemForm.isSaving.value"
            class="size-4 mr-1.5 animate-spin"
          />
          {{ itemForm.isSaving.value ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
