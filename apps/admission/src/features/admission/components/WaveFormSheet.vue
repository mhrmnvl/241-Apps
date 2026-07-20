<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import { ScrollArea } from '@/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import type {
  AdmissionAcademicYear,
  AdmissionWaveSummary,
  WaveSavePayload,
} from '../types'

const props = defineProps<{
  open: boolean
  wave: AdmissionWaveSummary | null
  isSaving: boolean
  academicYears: AdmissionAcademicYear[]
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'save', payload: WaveSavePayload): void
}>()

const isEdit = computed(() => !!props.wave)

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Nama gelombang wajib diisi'),
    code: z.string().min(1, 'Kode wajib diisi'),
    academicYearId: z.string().min(1, 'Tahun ajaran wajib dipilih'),
    startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
    endDate: z.string().min(1, 'Tanggal selesai wajib diisi'),
    quota: z.coerce.number().min(1, 'Kuota minimal 1'),
    registrationFee: z.coerce.number().min(0, 'Biaya tidak boleh negatif'),
    description: z.string().optional().default(''),
    isActive: z.boolean().default(true),
  }),
)

interface WaveFormValues {
  name: string
  code: string
  academicYearId: string
  startDate: string
  endDate: string
  quota: number
  registrationFee: number
  description: string
  isActive: boolean
}

const { handleSubmit, resetForm } = useForm<WaveFormValues>({
  validationSchema: formSchema,
})

function resolveAcademicYearId(wave: AdmissionWaveSummary | null): string {
  if (wave) {
    if (typeof wave.academicYear === 'object' && wave.academicYear) {
      return wave.academicYear.id
    }
    if (typeof wave.academicYear === 'string' && wave.academicYear) {
      return wave.academicYear
    }
  }
  // Create (or unknown on edit): default to the active academic year.
  return props.academicYears.find((y) => y.isActive)?.id ?? ''
}

watch(
  () => [props.open, props.wave],
  () => {
    if (!props.open) return
    if (props.wave) {
      resetForm({
        values: {
          name: props.wave.name,
          code: props.wave.code,
          academicYearId: resolveAcademicYearId(props.wave),
          startDate: props.wave.startDate.slice(0, 10),
          endDate: props.wave.endDate.slice(0, 10),
          quota: Number(props.wave.quota),
          registrationFee: Number(props.wave.registrationFee),
          description: props.wave.description ?? '',
          isActive: props.wave.isActive ?? true,
        },
      })
    } else {
      resetForm({
        values: {
          name: '',
          code: '',
          academicYearId: resolveAcademicYearId(null),
          startDate: '',
          endDate: '',
          quota: 100,
          registrationFee: 250000,
          description: '',
          isActive: true,
        },
      })
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  emit('save', {
    name: values.name.trim(),
    code: values.code.trim(),
    academicYearId: values.academicYearId,
    startDate: values.startDate,
    endDate: values.endDate,
    quota: values.quota,
    registrationFee: values.registrationFee,
    description: values.description || undefined,
    isActive: values.isActive,
  })
})
</script>

<template>
  <Sheet
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <SheetContent class="w-full sm:max-w-md flex flex-col gap-0 border-l p-0">
      <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
        <SheetTitle>
          {{ isEdit ? 'Ubah Gelombang' : 'Tambah Gelombang' }}
        </SheetTitle>
        <SheetDescription>
          Atur periode, kuota, dan biaya pendaftaran gelombang PSB.
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="wave-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="onSubmit"
        >
          <FormField
            v-slot="{ componentField }"
            name="name"
          >
            <FormItem>
              <FormLabel
                >Nama Gelombang
                <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Gelombang 1 — 2026/2027"
                  :disabled="isSaving"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="code"
          >
            <FormItem>
              <FormLabel
                >Kode <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="G1-2026"
                  :disabled="isSaving"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

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
                :disabled="isSaving || isEdit"
                @update:model-value="handleChange"
              >
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih tahun ajaran" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem
                    v-for="year in academicYears"
                    :key="year.id"
                    :value="year.id"
                  >
                    {{ year.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p
                v-if="isEdit"
                class="text-xs text-muted-foreground"
              >
                Tahun ajaran tidak dapat diubah setelah gelombang dibuat.
              </p>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="grid grid-cols-2 gap-4">
            <FormField
              v-slot="{ componentField }"
              name="startDate"
            >
              <FormItem>
                <FormLabel
                  >Mulai <span class="text-destructive">*</span></FormLabel
                >
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="date"
                    :disabled="isSaving"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ componentField }"
              name="endDate"
            >
              <FormItem>
                <FormLabel
                  >Selesai <span class="text-destructive">*</span></FormLabel
                >
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="date"
                    :disabled="isSaving"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <FormField
              v-slot="{ componentField }"
              name="quota"
            >
              <FormItem>
                <FormLabel>Kuota</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="number"
                    min="1"
                    :disabled="isSaving"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ componentField }"
              name="registrationFee"
            >
              <FormItem>
                <FormLabel>Biaya (Rp)</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="number"
                    min="0"
                    :disabled="isSaving"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <FormField
            v-slot="{ componentField }"
            name="description"
          >
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  v-bind="componentField"
                  rows="3"
                  placeholder="Keterangan tambahan (opsional)"
                  :disabled="isSaving"
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
              <FormLabel>Status</FormLabel>
              <Select
                :model-value="String(value)"
                :disabled="isSaving"
                @update:model-value="handleChange($event === 'true')"
              >
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>
      </ScrollArea>

      <SheetFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background"
      >
        <Button
          type="button"
          variant="outline"
          :disabled="isSaving"
          @click="emit('update:open', false)"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="wave-form"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Menyimpan…' : 'Simpan' }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
