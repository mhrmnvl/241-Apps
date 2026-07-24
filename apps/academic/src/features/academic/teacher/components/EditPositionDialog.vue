<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/ui/dialog'
import { Button } from '@/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { DatePicker } from '@/ui'
import { useTeacher } from '../composables/useTeacher'
import type {
  TeacherPositionSavePayload,
  TeacherPositionUpdatePayload,
  PositionEditData,
  PositionListItem,
} from '../types'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'

const props = defineProps<{
  open: boolean
  editData?: PositionEditData | null
  teacherId: string
}>()

const emit = defineEmits<{
  'update:open': [val: boolean]
  reload: []
}>()

const { isSavingPosition, savePosition, getPositionsList } = useTeacher()
const open = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
})

const positions = ref<PositionListItem[]>([])

async function fetchPositions() {
  positions.value = await getPositionsList()
}

const formSchema = toTypedSchema(
  z.object({
    positionId: z.string().min(1, 'Jabatan wajib dipilih.'),
    hireDate: z.string().min(1, 'Tanggal mulai menjabat wajib diisi.'),
    isPrimary: z.string().default('TAMBAHAN'),
  }),
)

const { handleSubmit, resetForm, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    positionId: '',
    hireDate: '',
    isPrimary: 'TAMBAHAN',
  },
})

watch(
  () => [props.open, props.editData],
  async () => {
    if (props.open) {
      await fetchPositions()
      const data = props.editData
      if (data) {
        setValues({
          positionId: data.positionId ?? data.position?.id ?? '',
          hireDate: data.hireDate ? new Date(data.hireDate).toISOString() : '',
          isPrimary: data.isPrimary ? 'UTAMA' : 'TAMBAHAN',
        })
      } else {
        resetForm()
      }
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit(async (values) => {
  const isPrimary = values.isPrimary === 'UTAMA'

  let hireDateStr = ''
  if (values.hireDate) {
    const d = new Date(values.hireDate)
    if (!isNaN(d.getTime())) {
      const tzOffset = d.getTimezoneOffset() * 60000
      hireDateStr = new Date(d.getTime() - tzOffset).toISOString().slice(0, 10)
    } else {
      hireDateStr = values.hireDate.substring(0, 10)
    }
  }

  if (props.editData) {
    const updatePayload: TeacherPositionUpdatePayload = {
      hireDate: hireDateStr || undefined,
      isPrimary,
    }
    const { success } = await savePosition(props.teacherId, updatePayload, {
      id: props.editData.id!,
    })
    if (success) {
      open.value = false
      emit('reload')
    }
  } else {
    const createPayload: TeacherPositionSavePayload = {
      positionId: values.positionId,
      hireDate: hireDateStr,
      isPrimary,
    }
    const { success } = await savePosition(props.teacherId, createPayload)
    if (success) {
      open.value = false
      emit('reload')
    }
  }
})

function categoryLabel(cat?: string) {
  if (!cat) return '-'
  const map: Record<string, string> = {
    MANAGEMENT: 'Pimpinan',
    FINANCE: 'Keuangan',
    ADMIN: 'Tata Usaha',
    ACADEMIC: 'Akademik',
  }
  return map[cat] ?? cat
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="w-full sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col gap-0 border-l p-0"
    >
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle class="text-xl">
          {{ editData ? 'Edit Riwayat Jabatan' : 'Tambah Jabatan' }}
        </DialogTitle>
        <DialogDescription class="sr-only"></DialogDescription>
      </DialogHeader>

      <form
        class="px-6 py-6 flex-1 overflow-y-auto"
        @submit.prevent="onSubmit"
      >
        <div class="grid gap-5 p-1">
          <FormField
            v-slot="{ value, handleChange }"
            name="positionId"
          >
            <FormItem class="content-start">
              <FormLabel>
                Jabatan <span class="text-destructive">*</span>
              </FormLabel>
              <Select
                :model-value="value"
                :disabled="!!editData"
                @update:model-value="handleChange"
              >
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih jabatan..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem
                    v-for="pos in positions"
                    :key="pos.id"
                    :value="pos.id"
                  >
                    {{ pos.name }} —
                    {{ categoryLabel(pos.category?.code) }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
              <p
                v-if="editData"
                class="text-xs text-muted-foreground mt-1"
              >
                Jabatan tidak dapat diubah setelah dibuat. Silakan hapus dan
                buat ulang jika salah pilih.
              </p>
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="hireDate"
          >
            <FormItem class="content-start">
              <FormLabel>
                Mulai Menjabat <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <DatePicker
                  :model-value="value"
                  placeholder="Pilih tanggal mulai"
                  @update:model-value="handleChange"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="isPrimary"
          >
            <FormItem class="content-start">
              <FormLabel>
                Tipe Jabatan <span class="text-destructive">*</span>
              </FormLabel>
              <Select
                :model-value="value"
                @update:model-value="handleChange"
              >
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih tipe jabatan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="UTAMA"> Jabatan Utama </SelectItem>
                  <SelectItem value="TAMBAHAN"> Jabatan Tambahan </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-xs text-muted-foreground mt-1">
                Jika dipilih "Jabatan Utama", jabatan utama sebelumnya akan
                otomatis menjadi tambahan.
              </p>
            </FormItem>
          </FormField>
        </div>
      </form>

      <DialogFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background relative mt-auto"
      >
        <Button
          variant="outline"
          :disabled="isSavingPosition"
          @click="open = false"
        >
          Batal
        </Button>
        <Button
          variant="default"
          :disabled="isSavingPosition"
          @click="onSubmit"
        >
          {{ isSavingPosition ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
