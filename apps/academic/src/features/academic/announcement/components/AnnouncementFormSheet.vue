<script setup lang="ts">
import { computed, toRefs, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert'
import {
  AlertDialog,
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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import { Checkbox } from '@/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { AlertCircle, ChevronsUpDown } from 'lucide-vue-next'
import type { Announcement, AnnouncementSavePayload } from '../types'
import type { Classroom } from '@/features/academic/classroom'

const props = defineProps<{
  open: boolean
  formError: string | null
  isSaving: boolean
  editData?: Announcement | null
  classrooms: Classroom[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: AnnouncementSavePayload]
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value) resetForm()
    emit('update:open', value)
  },
})

const { editData } = toRefs(props)
const isEditing = computed(() => !!editData?.value)

const formSchema = toTypedSchema(
  z.object({
    title: z
      .string()
      .min(1, 'Judul wajib diisi.')
      .max(200, 'Judul maksimal 200 karakter.'),
    description: z.string().min(1, 'Deskripsi wajib diisi.'),
    date: z.string().min(1, 'Tanggal wajib diisi.'),
    classroomIds: z.array(z.string()).optional(),
  }),
)

const { handleSubmit, resetForm, setValues, setFieldValue, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: '',
    description: '',
    date: '',
    classroomIds: [] as string[],
  },
})

watch(
  () => [props.open, editData?.value] as const,
  ([isOpen]) => {
    if (isOpen) {
      const data = editData?.value
      if (data) {
        setValues({
          title: data.title ?? '',
          description: data.description ?? '',
          date: data.date ? data.date.slice(0, 10) : '',
          classroomIds: data.classrooms?.map((c) => c.classroomId) ?? [],
        })
      } else {
        resetForm()
      }
    }
  },
  { immediate: true },
)

const showConfirmAlert = ref(false)
const classroomSelectOpen = ref(false)
const classroomSearchQuery = ref('')

const filteredClassrooms = computed(() => {
  const query = classroomSearchQuery.value.toLowerCase().trim()
  if (!query) return props.classrooms
  return props.classrooms.filter((c) =>
    (c.name ?? '').toLowerCase().includes(query),
  )
})

const selectedClassroomsLabel = computed(() => {
  const selectedIds = values.classroomIds ?? []
  if (selectedIds.length === 0) return 'Semua Kelas (Pengumuman Umum)'
  if (selectedIds.length === props.classrooms.length) return 'Semua Kelas'

  return props.classrooms
    .filter((c) => selectedIds.includes(c.id))
    .map((c) => c.name)
    .join(', ')
})

function isSelectedClassroom(id: string) {
  return (values.classroomIds ?? []).includes(id)
}

function toggleClassroomSelection(id: string) {
  const current = [...(values.classroomIds ?? [])]
  const idx = current.indexOf(id)
  if (idx > -1) {
    current.splice(idx, 1)
  } else {
    current.push(id)
  }
  setFieldValue('classroomIds', current)
}

function buildPayload(vals: {
  title: string
  description: string
  date: string
  classroomIds?: string[]
}): AnnouncementSavePayload {
  return {
    title: vals.title,
    description: vals.description,
    date: new Date(vals.date).toISOString(),
    classroomIds: vals.classroomIds,
  }
}

const onSubmit = handleSubmit((values) => {
  if (isEditing.value) {
    showConfirmAlert.value = true
  } else {
    emit('save', buildPayload(values))
  }
})

function confirmSave() {
  showConfirmAlert.value = false
  void handleSubmit((values) => {
    emit('save', buildPayload(values))
  })()
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent class="w-full sm:max-w-md flex flex-col gap-0 border-l p-0">
      <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
        <SheetTitle>
          {{ isEditing ? 'Edit Pengumuman' : 'Tambah Pengumuman' }}
        </SheetTitle>
        <SheetDescription>
          {{
            isEditing
              ? 'Perbarui informasi pengumuman sekolah.'
              : 'Masukkan informasi pengumuman baru.'
          }}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="announcement-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="onSubmit"
        >
          <FormField
            v-slot="{ componentField }"
            name="title"
          >
            <FormItem>
              <FormLabel>
                Judul Pengumuman
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Masukkan judul pengumuman..."
                  maxlength="200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="description"
          >
            <FormItem>
              <FormLabel>
                Deskripsi / Isi Pengumuman
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  v-bind="componentField"
                  placeholder="Tuliskan isi pengumuman..."
                  class="min-h-[120px] resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="date"
          >
            <FormItem>
              <FormLabel>
                Tanggal Pengumuman
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="classroomIds">
            <FormItem class="flex flex-col">
              <FormLabel>
                Target Kelas
                <span class="text-muted-foreground font-normal"
                  >(Opsional)</span
                >
              </FormLabel>
              <Popover v-model:open="classroomSelectOpen">
                <PopoverTrigger as-child>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      :aria-expanded="classroomSelectOpen"
                      class="h-9 w-full justify-between text-left font-normal [&>svg]:shrink-0"
                    >
                      <span class="truncate">{{
                        selectedClassroomsLabel
                      }}</span>
                      <ChevronsUpDown class="ml-2 size-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  class="w-(--reka-popover-trigger-width) p-0"
                  align="start"
                >
                  <div class="p-2 border-b">
                    <Input
                      v-model="classroomSearchQuery"
                      placeholder="Cari kelas..."
                      class="h-8 w-full text-xs"
                    />
                  </div>
                  <ScrollArea class="h-[200px]">
                    <div class="p-1.5 space-y-1">
                      <div
                        v-for="classroom in filteredClassrooms"
                        :key="classroom.id"
                        class="flex items-center space-x-2 rounded-md hover:bg-muted p-2 cursor-pointer"
                        @click="toggleClassroomSelection(classroom.id)"
                      >
                        <Checkbox
                          :checked="isSelectedClassroom(classroom.id)"
                          @update:checked="
                            () => toggleClassroomSelection(classroom.id)
                          "
                          @click.stop
                        />
                        <span class="text-sm select-none">{{
                          classroom.name
                        }}</span>
                      </div>
                      <div
                        v-if="filteredClassrooms.length === 0"
                        class="text-center p-2 text-xs text-muted-foreground"
                      >
                        Kelas tidak ditemukan.
                      </div>
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          </FormField>

          <Alert
            v-if="formError"
            variant="destructive"
            class="mt-2"
          >
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Kesalahan Sistem</AlertTitle>
            <AlertDescription>{{ formError }}</AlertDescription>
          </Alert>
        </form>
      </ScrollArea>

      <SheetFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background"
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
          form="announcement-form"
          variant="default"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>

  <AlertDialog v-model:open="showConfirmAlert">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Simpan Perubahan?</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin menyimpan perubahan pada pengumuman ini?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button
          variant="outline"
          :disabled="isSaving"
          @click="showConfirmAlert = false"
        >
          Batal
        </Button>
        <Button
          variant="default"
          :disabled="isSaving"
          @click="confirmSave"
        >
          Simpan
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
