<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useCurriculaForm } from '../composables/useCurriculaForm'
import type { AcademicYearRef, Curricula } from '../types'
import { Button } from '@/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import { ScrollArea } from '@/ui/scroll-area'
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
  <Sheet v-model:open="open">
    <SheetContent class="w-full sm:max-w-md flex flex-col gap-0 border-l p-0">
      <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
        <SheetTitle>
          {{
            curriculaForm.isEditing.value
              ? 'Edit Kurikulum'
              : 'Tambah Kurikulum Baru'
          }}
        </SheetTitle>
        <SheetDescription>
          {{
            curriculaForm.isEditing.value
              ? 'Perbarui nama atau status kurikulum ini.'
              : 'Masukkan nama kurikulum (misal: Kurikulum Merdeka).'
          }}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="curricula-form"
          class="space-y-4 px-6 py-4"
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
                >Nama Kurikulum
                <span class="text-destructive">*</span></FormLabel
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
      </ScrollArea>

      <SheetFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background"
      >
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
      </SheetFooter>
    </SheetContent>
  </Sheet>

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
