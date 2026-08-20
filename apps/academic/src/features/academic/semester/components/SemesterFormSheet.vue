<script setup lang="ts">
import { computed, toRefs, watch } from 'vue'
import { useSemesterForm } from '../composables/useSemesterForm'
import { useSemesterList } from '../composables/useSemesterList'
import type { Semester } from '../types'
import { DatePicker } from '@/ui'
import { Input } from '@/ui/input'
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
import { ScrollArea } from '@/ui/scroll-area'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'

const props = defineProps<{
  open: boolean
  editData?: Semester | null
}>()

/**
 * Academic years are loaded here rather than by the semester list page.
 *
 * The list shows semesters, not years — it fetched them on mount only to fill
 * this sheet's dropdown. Loaded once per visit; a school adds one a year.
 */
const { academicYears, fetchAcademicYears } = useSemesterList()

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && academicYears.value.length === 0) void fetchAcademicYears()
  },
  // The list page renders this behind `v-if="isAddModalOpen"`, so it mounts
  // with `open` already true and that prop never changes afterwards. Without
  // `immediate` the callback never runs and the Tahun Ajaran select stays empty.
  { immediate: true },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save-success': []
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const { editData } = toRefs(props)

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
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>{{
          semesterForm.isEditing.value ? 'Edit Semester' : 'Tambah Semester'
        }}</DialogTitle>
        <DialogDescription class="sr-only"> </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="semester-form"
          class="space-y-4 px-6 py-4"
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
                >Tipe Semester
                <span class="text-destructive">*</span></FormLabel
              >
              <Select
                :model-value="value"
                :disabled="semesterForm.isSaving.value"
                @update:model-value="handleChange"
              >
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih tipe semester" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem
                    v-for="type in semesterForm.semesterTypes.value"
                    :key="type.id"
                    :value="type.id"
                  >
                    {{
                      type.name === 'ODD'
                        ? 'Ganjil'
                        : type.name === 'EVEN'
                          ? 'Genap'
                          : type.name
                    }}
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
                >Nama Semester
                <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  placeholder="Contoh: Semester Ganjil 2024/2025"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="grid grid-cols-2 gap-4">
            <FormField
              v-slot="{ value, handleChange }"
              name="startDate"
            >
              <FormItem class="content-start">
                <FormLabel
                  >Tanggal Mulai
                  <span class="text-destructive">*</span></FormLabel
                >
                <FormControl>
                  <DatePicker
                    :model-value="value ?? ''"
                    placeholder="Pilih tanggal mulai"
                    :allow-future-dates="true"
                    @update:model-value="handleChange"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ value, handleChange }"
              name="endDate"
            >
              <FormItem class="content-start">
                <FormLabel
                  >Tanggal Selesai
                  <span class="text-destructive">*</span></FormLabel
                >
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
      </ScrollArea>

      <DialogFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background mt-auto"
      >
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
