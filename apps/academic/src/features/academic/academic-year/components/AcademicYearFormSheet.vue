<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useAcademicYearForm } from '../composables/useAcademicYearForm'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Loader2, AlertCircle } from 'lucide-vue-next'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
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
import { Alert, AlertDescription } from '@/ui/alert'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import type { AcademicYear } from '../types'

const props = defineProps<{
  open: boolean
  editData?: AcademicYear | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save-success': []
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => {
    emit('update:open', value)
  },
})

const { editData } = toRefs(props)

const academicYearForm = useAcademicYearForm({
  editData: () => editData.value ?? null,
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
        <DialogTitle>
          {{
            academicYearForm.isEditing.value
              ? 'Edit Tahun Ajaran'
              : 'Tambah Tahun Ajaran'
          }}
        </DialogTitle>
        <DialogDescription>
          {{
            academicYearForm.isEditing.value
              ? 'Perbarui informasi tahun ajaran ini.'
              : 'Masukkan informasi tahun ajaran dan pilih kurikulum yang berlaku.'
          }}
        </DialogDescription>
      </DialogHeader>

      <form
        id="academic-year-form"
        class="space-y-4 py-2"
        @submit.prevent="academicYearForm.onSubmit"
      >
        <FormField
          v-slot="{ componentField }"
          name="name"
        >
          <FormItem>
            <FormLabel
              >Nama Tahun Ajaran
              <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                placeholder="Contoh: 2024/2025"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ value, handleChange }"
          name="isActive"
        >
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select
              :model-value="String(value)"
              :disabled="academicYearForm.isSaving.value"
              @update:model-value="handleChange($event === 'true')"
            >
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        </FormField>

        <Alert
          v-if="academicYearForm.formError.value"
          variant="destructive"
          class="mt-2"
        >
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>{{
            academicYearForm.formError.value
          }}</AlertDescription>
        </Alert>
      </form>

      <DialogFooter class="flex sm:justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          :disabled="academicYearForm.isSaving.value"
          @click="open = false"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="academic-year-form"
          variant="default"
          :disabled="academicYearForm.isSaving.value"
        >
          <Loader2
            v-if="academicYearForm.isSaving.value"
            class="size-4 mr-1.5 animate-spin"
          />
          {{ academicYearForm.isSaving.value ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <AlertDialog v-model:open="academicYearForm.showConfirmAlert.value">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Simpan Perubahan?</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin menyimpan perubahan pada data ini?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          :disabled="academicYearForm.isSaving.value"
          @click="academicYearForm.showConfirmAlert.value = false"
        >
          Batal
        </AlertDialogCancel>
        <AlertDialogAction
          :disabled="academicYearForm.isSaving.value"
          @click="academicYearForm.confirmSave"
        >
          Simpan
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
