<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useSemesterForm } from '../composables/useSemesterForm'
import type { AcademicYearRef, Semester } from '../types'
import { DatePicker } from '@/ui'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { AlertCircle, Loader2 } from 'lucide-vue-next'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'

const props = defineProps<{
  open: boolean
  academicYears: AcademicYearRef[]
  editData?: Semester | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save-success': []
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const { editData, academicYears } = toRefs(props)

const semesterForm = useSemesterForm({
  academicYears: () => academicYears.value,
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
          semesterForm.isEditing.value ? 'Edit Semester' : 'Tambah Semester'
        }}</DialogTitle>
        <DialogDescription>
          {{
            semesterForm.isEditing.value
              ? 'Perbarui informasi data semester. Klik simpan untuk menerapkan.'
              : 'Tambahkan data semester baru ke dalam sistem.'
          }}
        </DialogDescription>
      </DialogHeader>

      <form
        id="semester-form"
        class="space-y-4 py-2"
        @submit.prevent="semesterForm.onSubmit"
      >
        <FormField
          v-slot="{ value, handleChange }"
          name="academicYearId"
        >
          <FormItem>
            <FormLabel
              >Tahun Ajaran <span class="text-destructive">*</span></FormLabel
            >
            <Select
              :model-value="value"
              disabled
              @update:model-value="handleChange"
            >
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Memuat..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem
                  v-for="ay in academicYears"
                  :key="ay.id"
                  :value="ay.id"
                >
                  {{ ay.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ value, handleChange }"
          name="typeId"
        >
          <FormItem>
            <FormLabel
              >Semester <span class="text-destructive">*</span></FormLabel
            >
            <Select
              :model-value="value"
              @update:model-value="handleChange"
            >
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih Semester" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem
                  v-for="st in semesterForm.semesterTypes.value"
                  :key="st.id"
                  :value="st.id"
                >
                  {{ st.name === 'ODD' ? 'Ganjil' : 'Genap' }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <FormField
            v-slot="{ value, handleChange }"
            name="startDate"
          >
            <FormItem>
              <FormLabel> Tanggal Mulai </FormLabel>
              <FormControl>
                <DatePicker
                  :model-value="value ?? ''"
                  placeholder="Pilih tanggal mulai"
                  :allow-future-dates="true"
                  @update:model-value="handleChange"
                />
              </FormControl>
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="endDate"
          >
            <FormItem>
              <FormLabel>Tanggal Selesai</FormLabel>
              <FormControl>
                <DatePicker
                  :model-value="value ?? ''"
                  placeholder="Pilih tanggal selesai"
                  :allow-future-dates="true"
                  :min-date="semesterForm.form.values.startDate"
                  @update:model-value="handleChange"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <Alert
          v-if="semesterForm.formError.value"
          variant="destructive"
          class="mt-2"
        >
          <AlertCircle class="size-4" />
          <AlertDescription>{{
            semesterForm.formError.value
          }}</AlertDescription>
        </Alert>
      </form>

      <DialogFooter class="flex sm:justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          :disabled="semesterForm.isSaving.value"
          @click="open = false"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="semester-form"
          :disabled="semesterForm.isSaving.value"
        >
          <Loader2
            v-if="semesterForm.isSaving.value"
            class="size-4 mr-1.5 animate-spin"
          />
          {{ semesterForm.isSaving.value ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
