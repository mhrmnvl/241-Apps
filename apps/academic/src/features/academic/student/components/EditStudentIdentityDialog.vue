<script setup lang="ts">
import { computed, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { Input } from '@/ui/input'
import { ScrollArea } from '@/ui/scroll-area'
import type { StudentUpdatePayload, StudentIdentityData } from '../types'

import { useStudent } from '../composables/useStudent'

const props = defineProps<{
  open: boolean
  studentId: string
  initialData?: StudentIdentityData | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  reload: []
}>()

const { isSaving, saveStudent } = useStudent()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => {
    emit('update:open', value)
  },
})

const formSchema = toTypedSchema(
  z.object({
    nis: z
      .string()
      .max(50, 'Maksimal 50 karakter')
      .optional()
      .or(z.literal('')),
    nisn: z
      .string()
      .max(50, 'Maksimal 50 karakter')
      .optional()
      .or(z.literal('')),
  }),
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    nis: '',
    nisn: '',
  },
})

watch(
  () => [props.open, props.initialData] as const,
  ([isOpen]) => {
    if (isOpen && props.initialData) {
      form.resetForm({
        values: {
          nis: props.initialData.nis ?? '',
          nisn: props.initialData.nisn ?? '',
        },
      })
    }
  },
  { immediate: true },
)

const onSubmit = form.handleSubmit(async (values) => {
  const payload: StudentUpdatePayload = {
    nis: values.nis === '' ? undefined : values.nis,
    nisn: values.nisn === '' ? undefined : values.nisn,
  }

  const { success } = await saveStudent(props.studentId, payload)
  if (success) {
    emit('reload')
    open.value = false
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="w-full sm:max-w-xl md:max-w-xl lg:max-w-xl flex flex-col gap-0 border-l p-0"
    >
      <form
        class="flex flex-col h-full"
        @submit.prevent="onSubmit"
      >
        <DialogHeader class="px-6 py-6 border-b shrink-0">
          <DialogTitle class="text-xl"> Ubah Identitas Kesiswaan </DialogTitle>
          <DialogDescription class="sr-only"> </DialogDescription>
        </DialogHeader>

        <ScrollArea class="flex-1 min-h-0">
          <div class="p-6">
            <div class="grid gap-5 md:grid-cols-2">
              <FormField
                v-slot="{ componentField }"
                name="nis"
              >
                <FormItem class="content-start">
                  <FormLabel>NIS</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nomor Induk Siswa"
                      maxlength="50"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="nisn"
              >
                <FormItem class="content-start">
                  <FormLabel>NISN</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nomor Induk Siswa Nasional"
                      maxlength="50"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter
          class="px-6 py-4 border-t shrink-0 flex gap-2 sm:justify-end w-full bg-background relative mt-auto"
        >
          <Button
            type="button"
            variant="outline"
            :disabled="isSaving"
            @click="open = false"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="default"
            :disabled="isSaving"
          >
            {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
