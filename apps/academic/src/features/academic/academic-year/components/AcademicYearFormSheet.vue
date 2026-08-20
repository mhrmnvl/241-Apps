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
import { ScrollArea } from '@/ui/scroll-area'
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
import { WEEKDAYS, formatWeeklyHolidays } from '../constants/weekdays'

/** Returns the rule with this weekday added or removed, never mutated in place. */
function toggleWeekday(current: number[], weekday: number): number[] {
  return current.includes(weekday)
    ? current.filter((day) => day !== weekday)
    : [...current, weekday]
}

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
        <DialogTitle>
          {{
            academicYearForm.isEditing.value
              ? 'Edit Tahun Ajaran'
              : 'Tambah Tahun Ajaran'
          }}
        </DialogTitle>
        <DialogDescription class="sr-only"> </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="academic-year-form"
          class="space-y-4 px-6 py-4"
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
            name="weeklyHolidays"
          >
            <FormItem>
              <FormLabel>Hari Libur Mingguan</FormLabel>
              <FormControl>
                <div class="flex flex-wrap gap-1.5">
                  <Button
                    v-for="day in WEEKDAYS"
                    :key="day.value"
                    type="button"
                    size="sm"
                    :variant="
                      (value as number[]).includes(day.value)
                        ? 'default'
                        : 'outline'
                    "
                    :disabled="academicYearForm.isSaving.value"
                    :aria-pressed="(value as number[]).includes(day.value)"
                    :aria-label="`${day.label} libur`"
                    class="w-12"
                    @click="
                      handleChange(toggleWeekday(value as number[], day.value))
                    "
                  >
                    {{ day.short }}
                  </Button>
                </div>
              </FormControl>
              <p class="text-xs text-muted-foreground">
                Libur:
                {{ formatWeeklyHolidays(value as number[]) }}. Hari yang dipilih
                ditandai libur di kalender pendidikan, tanpa perlu dicatat satu
                per satu.
              </p>
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
      </ScrollArea>

      <DialogFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background mt-auto"
      >
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
