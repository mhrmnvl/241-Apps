<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useCurriculaForm } from '../composables/useCurriculaForm'
import type { AcademicYearRef, Curricula } from '../types'
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

const props = defineProps<{
  open: boolean
  academicYears: AcademicYearRef[]
  editData?: Curricula | null
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

const curriculaForm = useCurriculaForm({
  academicYears: () => academicYears.value,
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
            curriculaForm.isEditing.value
              ? 'Edit Kurikulum'
              : 'Tambah Kurikulum Baru'
          }}
        </DialogTitle>
        <DialogDescription>
          {{
            curriculaForm.isEditing.value
              ? 'Perbarui nama atau status kurikulum ini.'
              : 'Masukkan nama kurikulum (misal: Kurikulum Merdeka).'
          }}
        </DialogDescription>
      </DialogHeader>

      <form
        id="curricula-form"
        class="space-y-4 py-2"
        @submit.prevent="curriculaForm.onSubmit"
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
                  v-for="opt in curriculaForm.academicYearOptions.value"
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

        <FormField
          v-slot="{ componentField }"
          name="name"
        >
          <FormItem>
            <FormLabel
              >Nama Kurikulum <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                placeholder="Contoh: Kurikulum Merdeka"
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
            <FormLabel
              >Status <span class="text-destructive">*</span></FormLabel
            >
            <Select
              :model-value="String(value)"
              @update:model-value="handleChange($event === 'true')"
            >
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="true"> Aktif </SelectItem>
                <SelectItem value="false"> Tidak Aktif </SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        </FormField>

        <Alert
          v-if="curriculaForm.formError.value"
          variant="destructive"
          class="mt-2"
        >
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>{{
            curriculaForm.formError.value
          }}</AlertDescription>
        </Alert>
      </form>

      <DialogFooter class="flex sm:justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          :disabled="curriculaForm.isSaving.value"
          @click="open = false"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="curricula-form"
          variant="default"
          :disabled="curriculaForm.isSaving.value"
        >
          <Loader2
            v-if="curriculaForm.isSaving.value"
            class="size-4 mr-1.5 animate-spin"
          />
          {{ curriculaForm.isSaving.value ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <AlertDialog v-model:open="curriculaForm.showConfirmAlert.value">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Simpan Perubahan?</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin menyimpan perubahan pada data kurikulum ini?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          :disabled="curriculaForm.isSaving.value"
          @click="curriculaForm.showConfirmAlert.value = false"
        >
          Batal
        </AlertDialogCancel>
        <AlertDialogAction
          :disabled="curriculaForm.isSaving.value"
          @click="curriculaForm.confirmSave"
        >
          Simpan
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
