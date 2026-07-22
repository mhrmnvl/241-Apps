<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import * as z from 'zod'
import type {
  ParentOption,
  StudentOption,
  StudentParent,
  StudentParentFormPayload,
} from '../types'
import { PARENT_RELATIONS } from '../types'

import { Alert, AlertDescription } from '@/ui/alert'
import { Button } from '@/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { ScrollArea } from '@/ui/scroll-area'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { cn } from '@/shared/utils/utils'
import { AlertCircle, Check, ChevronsUpDown, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  editData: StudentParent | null
  formError: string | null
  isSaving: boolean
  students: StudentOption[]
  parents: ParentOption[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [payload: StudentParentFormPayload]
}>()

const isEditing = computed(() => !!props.editData)

const formSchema = z.object({
  studentId: z.string().min(1, 'Siswa wajib dipilih'),
  parentId: z.string().min(1, 'Orang Tua wajib dipilih'),
  relation: z.string().min(1, 'Hubungan wajib dipilih'),
  isPrimary: z.boolean().default(false),
})

const { handleSubmit, resetForm, setValues, setFieldValue } = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    studentId: '',
    parentId: '',
    relation: '',
    isPrimary: false,
  },
})

const openStudent = ref(false)
const openParent = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.editData) {
        setValues({
          studentId: props.editData.studentId,
          parentId: props.editData.parentId,
          relation: props.editData.relation,
          isPrimary: props.editData.isPrimary,
        })
      } else {
        resetForm()
      }
    }
  },
)

const onSubmit = handleSubmit((values) => {
  emit('save', values)
})

function onOpenChange(val: boolean) {
  emit('update:open', val)
  if (!val) resetForm()
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="onOpenChange"
  >
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>{{
          isEditing ? 'Edit Relasi Orang Tua' : 'Tambah Relasi Orang Tua'
        }}</DialogTitle>
        <DialogDescription>
          {{
            isEditing
              ? 'Ubah hubungan atau status wali utama.'
              : 'Hubungkan data siswa dengan data orang tua/wali.'
          }}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <div class="px-6 py-4 space-y-4">
          <Alert
            v-if="formError"
            variant="destructive"
          >
            <AlertCircle class="w-4 h-4" />
            <AlertDescription>{{ formError }}</AlertDescription>
          </Alert>

          <form
            id="student-parent-form"
            class="space-y-4"
            @submit.prevent="onSubmit"
          >
            <FormField
              v-slot="{ value }"
              name="studentId"
            >
              <FormItem class="flex flex-col">
                <FormLabel>
                  Siswa
                  <span
                    v-if="!isEditing"
                    class="text-destructive"
                    >*</span
                  >
                </FormLabel>
                <Popover v-model:open="openStudent">
                  <PopoverTrigger as-child>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        :aria-expanded="openStudent"
                        :disabled="isEditing || isSaving"
                        :class="
                          cn(
                            'w-full justify-between',
                            !value && 'text-muted-foreground',
                          )
                        "
                      >
                        {{
                          value
                            ? students.find((s) => s.id === value)?.name
                            : 'Pilih Siswa...'
                        }}
                        <ChevronsUpDown
                          class="ml-2 h-4 w-4 shrink-0 opacity-50"
                        />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    class="w-var(--reka-popover-trigger-width) p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput
                        placeholder="Cari nama siswa..."
                        class="text-sm h-11"
                      />
                      <CommandEmpty>Siswa tidak ditemukan.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          <CommandItem
                            v-for="student in students"
                            :key="student.id"
                            :value="student.name"
                            @select="
                              () => {
                                setFieldValue('studentId', student.id)
                                openStudent = false
                              }
                            "
                          >
                            <Check
                              :class="
                                cn(
                                  'mr-2 h-4 w-4',
                                  value === student.id
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )
                              "
                            />
                            {{ student.name }} ({{ student.nisn }})
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ value }"
              name="parentId"
            >
              <FormItem class="flex flex-col">
                <FormLabel>
                  Orang Tua / Wali
                  <span
                    v-if="!isEditing"
                    class="text-destructive"
                    >*</span
                  >
                </FormLabel>
                <Popover v-model:open="openParent">
                  <PopoverTrigger as-child>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        :aria-expanded="openParent"
                        :disabled="isEditing || isSaving"
                        :class="
                          cn(
                            'w-full justify-between',
                            !value && 'text-muted-foreground',
                          )
                        "
                      >
                        {{
                          value
                            ? parents.find((p) => p.id === value)?.name
                            : 'Pilih Orang Tua/Wali...'
                        }}
                        <ChevronsUpDown
                          class="ml-2 h-4 w-4 shrink-0 opacity-50"
                        />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    class="w-var(--reka-popover-trigger-width) p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput
                        placeholder="Cari nama orang tua..."
                        class="text-sm h-11"
                      />
                      <CommandEmpty
                        >Orang tua/wali tidak ditemukan.</CommandEmpty
                      >
                      <CommandList>
                        <CommandGroup>
                          <CommandItem
                            v-for="parent in parents"
                            :key="parent.id"
                            :value="parent.name"
                            @select="
                              () => {
                                setFieldValue('parentId', parent.id)
                                openParent = false
                              }
                            "
                          >
                            <Check
                              :class="
                                cn(
                                  'mr-2 h-4 w-4',
                                  value === parent.id
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )
                              "
                            />
                            {{ parent.name }} (NIK: {{ parent.nik }})
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ componentField }"
              name="relation"
            >
              <FormItem>
                <FormLabel
                  >Hubungan <span class="text-destructive">*</span></FormLabel
                >
                <Select
                  v-bind="componentField"
                  :disabled="isSaving"
                >
                  <FormControl>
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Pilih Hubungan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem
                      v-for="(label, value) in PARENT_RELATIONS"
                      :key="value"
                      :value="value"
                    >
                      {{ label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ value }"
              name="isPrimary"
            >
              <FormItem>
                <FormLabel>Wali Utama</FormLabel>
                <Select
                  :model-value="value ? 'true' : 'false'"
                  :disabled="isSaving"
                  @update:model-value="
                    (val) => setFieldValue('isPrimary', val === 'true')
                  "
                >
                  <FormControl>
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Pilih Status Wali Utama" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Ya</SelectItem>
                    <SelectItem value="false">Tidak</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>
          </form>
        </div>
      </ScrollArea>

      <DialogFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background"
      >
        <Button
          type="button"
          variant="outline"
          :disabled="isSaving"
          @click="onOpenChange(false)"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="student-parent-form"
          :disabled="isSaving"
        >
          <Loader2
            v-if="isSaving"
            class="w-4 h-4 mr-2 animate-spin"
          />
          Simpan
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
