<script setup lang="ts">
import { computed, toRefs, ref } from 'vue'
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
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { AppCombobox } from '@/ui'
import { AlertCircle } from 'lucide-vue-next'
import type { Parent, ParentSavePayload } from '../types'
import type { Occupation } from '@/features/academic/occupation'
import { useParentForm } from '../composables/useParentForm'

const props = defineProps<{
  open: boolean
  formError: string | null
  isSaving: boolean
  editData?: Parent | null
  occupations: Occupation[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: ParentSavePayload]
}>()

const { editData, occupations } = toRefs(props)
const showConfirmAlert = ref(false)
const pendingPayload = ref<ParentSavePayload | null>(null)

const open = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value) parentForm.resetForm()
    emit('update:open', value)
  },
})

const parentForm = useParentForm({
  open,
  editData,
  occupations,
  onSave: (payload) => {
    if (parentForm.isEditing.value) {
      pendingPayload.value = payload
      showConfirmAlert.value = true
    } else {
      emit('save', payload)
    }
  },
})

function confirmSave() {
  showConfirmAlert.value = false
  if (pendingPayload.value) {
    emit('save', pendingPayload.value)
    pendingPayload.value = null
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>
          {{
            parentForm.isEditing.value
              ? 'Edit Data Orang Tua'
              : 'Tambah Data Orang Tua'
          }}
        </DialogTitle>
        <DialogDescription>
          {{
            parentForm.isEditing.value
              ? 'Perbarui informasi data orang tua siswa.'
              : 'Masukkan informasi data orang tua baru.'
          }}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="parent-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="parentForm.onSubmit"
        >
          <Alert
            v-if="formError"
            variant="destructive"
          >
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Gagal Menyimpan</AlertTitle>
            <AlertDescription>{{ formError }}</AlertDescription>
          </Alert>

          <FormField
            v-slot="{ componentField }"
            name="name"
          >
            <FormItem>
              <FormLabel>
                Nama Lengkap <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Contoh: Budi Santoso"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="nik"
          >
            <FormItem>
              <FormLabel>
                NIK <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="16 digit NIK"
                  maxlength="16"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="grid grid-cols-2 gap-3">
            <FormField
              v-slot="{ componentField }"
              name="birthPlace"
            >
              <FormItem>
                <FormLabel>
                  Tempat Lahir <span class="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    placeholder="Contoh: Jakarta"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ componentField }"
              name="birthDate"
            >
              <FormItem>
                <FormLabel>
                  Tanggal Lahir <span class="text-destructive">*</span>
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
          </div>

          <FormField
            v-slot="{ componentField }"
            name="occupationId"
          >
            <FormItem>
              <FormLabel>
                Pekerjaan <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <AppCombobox
                  v-bind="componentField"
                  :options="parentForm.occupationOptions.value"
                  placeholder="Pilih Pekerjaan"
                  search-placeholder="Cari pekerjaan..."
                  empty-text="Pekerjaan tidak ditemukan."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="income"
          >
            <FormItem>
              <FormLabel>Penghasilan Bulanan</FormLabel>
              <FormControl>
                <Select
                  :model-value="value"
                  @update:model-value="handleChange"
                >
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih Penghasilan (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in parentForm.incomeOptions"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="phone"
          >
            <FormItem>
              <FormLabel>No. Telepon</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Contoh: 081234567890 (opsional)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="email"
          >
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  v-bind="componentField"
                  placeholder="Contoh: orangtua@email.com (opsional)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>
      </ScrollArea>

      <DialogFooter
        class="p-6 border-t bg-muted/10 flex items-center justify-end gap-2 shrink-0"
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
          form="parent-form"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <AlertDialog v-model:open="showConfirmAlert">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Konfirmasi Perubahan</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin menyimpan perubahan data orang tua ini?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Batal</AlertDialogCancel>
        <AlertDialogAction @click="confirmSave">Ya, Simpan</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
