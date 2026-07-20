<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useGradeForm } from '../composables/useGradeForm'
import type { Grade } from '../types'
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
import { Alert, AlertDescription } from '@/ui/alert'
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
  editData: Grade | null
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

const levelForm = useGradeForm({
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
            levelForm.isEditing.value
              ? 'Edit Tingkat Kelas'
              : 'Tambah Tingkat Kelas'
          }}
        </SheetTitle>
        <SheetDescription>
          {{
            levelForm.isEditing.value
              ? 'Perbarui data tingkat kelas yang sudah ada.'
              : 'Isi data untuk menambahkan tingkat kelas baru.'
          }}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="grade-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="levelForm.onSubmit"
        >
          <FormField
            v-slot="{ value, handleChange }"
            name="level"
          >
            <FormItem>
              <FormLabel
                >Tingkat <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  id="cl-level"
                  type="number"
                  min="1"
                  max="15"
                  placeholder="Contoh: 7"
                  :model-value="value"
                  @update:model-value="(val) => handleChange(Number(val))"
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
              <FormLabel
                >Nama Tingkat <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  id="cl-name"
                  placeholder="Contoh: VII"
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
                :model-value="value ? 'true' : 'false'"
                @update:model-value="(val) => handleChange(val === 'true')"
              >
                <FormControl>
                  <SelectTrigger
                    id="cl-status"
                    class="w-full"
                  >
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true"> Aktif </SelectItem>
                  <SelectItem value="false"> Nonaktif </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <Alert
            v-if="levelForm.formError.value"
            variant="destructive"
            class="mt-2"
          >
            <AlertCircle class="size-4" />
            <AlertDescription>{{ levelForm.formError.value }}</AlertDescription>
          </Alert>
        </form>
      </ScrollArea>

      <SheetFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background"
      >
        <Button
          type="button"
          variant="outline"
          :disabled="levelForm.isSaving.value"
          @click="open = false"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="grade-form"
          :disabled="levelForm.isSaving.value"
        >
          <Loader2
            v-if="levelForm.isSaving.value"
            class="size-4 mr-2 animate-spin"
          />
          {{ levelForm.isSaving.value ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
