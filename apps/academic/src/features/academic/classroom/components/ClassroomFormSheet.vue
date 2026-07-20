<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useClassroomForm } from '../composables/useClassroomForm'
import type { AcademicYear, Classroom, Grade } from '../types'
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import { ScrollArea } from '@/ui/scroll-area'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { AlertCircle } from 'lucide-vue-next'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'

const props = defineProps<{
  open: boolean
  academicYears: AcademicYear[]
  grades?: Grade[]
  editData?: Classroom | null
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

const classroomForm = useClassroomForm({
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
    <SheetContent class="w-full sm:max-w-2xl flex flex-col gap-0 border-l p-0">
      <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
        <SheetTitle>
          {{
            classroomForm.isEditing.value ? 'Edit Kelas' : 'Tambah Kelas Baru'
          }}
        </SheetTitle>
        <SheetDescription>
          {{
            classroomForm.isEditing.value
              ? 'Perbarui informasi kelas.'
              : 'Masukkan informasi kelas baru.'
          }}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="classroom-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="classroomForm.onSubmit"
        >
          <div
            class="grid grid-cols-1 items-start gap-x-4 gap-y-3 sm:grid-cols-2"
          >
            <FormField
              v-slot="{ value, handleChange }"
              name="academicYearId"
            >
              <FormItem>
                <FormLabel
                  >Tahun Ajaran
                  <span class="text-destructive">*</span></FormLabel
                >
                <Select
                  :model-value="value"
                  @update:model-value="handleChange"
                >
                  <FormControl>
                    <SelectTrigger class="h-9 w-full">
                      <SelectValue placeholder="Pilih tahun ajaran" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem
                      v-for="ay in classroomForm.activeAcademicYears.value"
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
              name="gradeId"
            >
              <FormItem>
                <FormLabel
                  >Tingkat <span class="text-destructive">*</span></FormLabel
                >
                <Select
                  :model-value="value"
                  @update:model-value="handleChange"
                >
                  <FormControl>
                    <SelectTrigger class="h-9 w-full">
                      <SelectValue placeholder="Pilih tingkat" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem
                      v-for="lvl in grades"
                      :key="lvl.id"
                      :value="lvl.id"
                    >
                      {{ lvl.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ componentField }"
              name="code"
            >
              <FormItem>
                <FormLabel
                  >Kode Kelas <span class="text-destructive">*</span></FormLabel
                >
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Contoh: VIII-A"
                    class="h-9"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ componentField }"
              name="name"
            >
              <FormItem>
                <FormLabel>Nama Kelas</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Contoh: Unggulan (Opsional)"
                    class="h-9"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ value, handleChange }"
              name="capacity"
            >
              <FormItem>
                <FormLabel
                  >Kapasitas <span class="text-destructive">*</span></FormLabel
                >
                <FormControl>
                  <Input
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    placeholder="Contoh: 30"
                    class="h-9"
                    :model-value="String(value ?? '')"
                    @keydown="
                      (e: KeyboardEvent) => {
                        if (e.ctrlKey || e.metaKey || e.altKey) return
                        if (
                          [
                            'Backspace',
                            'Delete',
                            'Tab',
                            'ArrowLeft',
                            'ArrowRight',
                            'Home',
                            'End',
                          ].includes(e.key)
                        )
                          return
                        if (!/^\d$/.test(e.key)) e.preventDefault()
                      }
                    "
                    @update:model-value="
                      (val) => {
                        handleChange(
                          Number(String(val).replace(/\D/g, '')) || 0,
                        )
                      }
                    "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ value, handleChange }"
              name="isActive"
            >
              <FormItem class="sm:col-span-2">
                <FormLabel
                  >Status <span class="text-destructive">*</span></FormLabel
                >
                <Select
                  :model-value="String(value)"
                  @update:model-value="handleChange($event === 'true')"
                >
                  <FormControl>
                    <SelectTrigger class="h-9 w-full">
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
          </div>

          <Alert
            v-if="classroomForm.formError.value"
            variant="destructive"
            class="mt-2"
          >
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Kesalahan Sistem</AlertTitle>
            <AlertDescription>{{
              classroomForm.formError.value
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
          :disabled="classroomForm.isSaving.value"
          @click="open = false"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="classroom-form"
          variant="default"
          :disabled="classroomForm.isSaving.value"
        >
          {{ classroomForm.isSaving.value ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>

  <AlertDialog v-model:open="classroomForm.showConfirmAlert.value">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Simpan Perubahan?</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin menyimpan perubahan pada data kelas ini?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          :disabled="classroomForm.isSaving.value"
          @click="classroomForm.showConfirmAlert.value = false"
        >
          Batal
        </AlertDialogCancel>
        <AlertDialogAction
          :disabled="classroomForm.isSaving.value"
          @click="classroomForm.confirmSave"
        >
          Simpan
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
