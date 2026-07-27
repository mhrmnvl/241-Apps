<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { AlertCircle, Info } from 'lucide-vue-next'
import PermissionMatrixPicker from './PermissionMatrixPicker.vue'
import type {
  Role,
  Permission,
  CreateRolePayload,
  UpdateRolePayload,
} from '../types'

const SYSTEM_ROLES = ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT']

const props = defineProps<{
  editData?: Role | null
  isSaving: boolean
  formError: string | null
  permissions: Permission[]
  isLoadingPermissions: boolean
}>()

const emit = defineEmits<{
  cancel: []
  save: [data: CreateRolePayload | UpdateRolePayload]
}>()

const isEditing = computed(() => !!props.editData)
const isSystemRole = computed(() => {
  if (!props.editData) return false
  return props.editData.isSystem
    ? true
    : SYSTEM_ROLES.includes(props.editData.code)
})

const permissionIds = ref<string[]>([])

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Nama Role wajib diisi.'),
    code: z
      .string()
      .min(1, 'Kode Role wajib diisi.')
      .regex(
        /^[A-Z0-9_]+$/,
        'Kode Role hanya boleh berisi huruf besar, angka, dan underscore.',
      ),
    description: z.string().optional().default(''),
  }),
)

const { handleSubmit, resetForm, setValues, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    code: '',
    description: '',
  },
})

watch(
  () => props.editData,
  (newData) => {
    if (newData) {
      setValues({
        name: newData.name ?? '',
        code: newData.code ?? '',
        description: newData.description ?? '',
      })
      permissionIds.value = newData.permissions?.map((p) => p.id) ?? []
    } else {
      resetForm()
      permissionIds.value = []
    }
  },
  { immediate: true },
)

const showConfirmAlert = ref(false)

function buildPayload() {
  if (isEditing.value) {
    const payload: UpdateRolePayload = {
      name: values.name ?? '',
      description: values.description ?? '',
      permissionIds: permissionIds.value,
    }
    return payload
  } else {
    const payload: CreateRolePayload = {
      name: values.name ?? '',
      code: (values.code ?? '').toUpperCase(),
      description: values.description ?? '',
      permissionIds: permissionIds.value,
    }
    return payload
  }
}

const onSubmit = handleSubmit(() => {
  if (isEditing.value) {
    showConfirmAlert.value = true
  } else {
    emit('save', buildPayload())
  }
})

function confirmSave() {
  showConfirmAlert.value = false
  emit('save', buildPayload())
}
</script>

<template>
  <form
    class="flex flex-col h-full gap-0"
    @submit.prevent="onSubmit"
  >
    <div class="px-6 pb-6 pt-8 space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column: Role Details Card -->
        <div class="lg:col-span-1">
          <Card
            class="rounded-2xl border border-border/80 shadow-sm shadow-black/5 flex flex-col gap-0"
          >
            <CardHeader
              class="border-b px-6 py-4 lg:py-0 lg:h-[72px] flex flex-row items-center shrink-0"
            >
              <CardTitle class="text-lg font-bold">Detail Role</CardTitle>
            </CardHeader>
            <CardContent class="px-6 pt-4 pb-6 space-y-4">
              <FormField
                v-slot="{ componentField }"
                name="name"
              >
                <FormItem>
                  <FormLabel class="font-semibold">
                    Nama Role <span class="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama role"
                      v-bind="componentField"
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
                  <FormLabel class="font-semibold">
                    Kode Role <span class="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan kode role"
                      v-bind="componentField"
                      :disabled="isEditing"
                      @input="
                        (e: any) =>
                          setValues({ code: e.target.value.toUpperCase() })
                      "
                    />
                  </FormControl>
                  <p
                    v-if="isEditing"
                    class="text-xs text-muted-foreground mt-1"
                  >
                    <span class="text-amber-600 font-medium block mt-1">
                      Kode role tidak dapat diubah setelah dibuat.
                    </span>
                  </p>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="description"
              >
                <FormItem>
                  <FormLabel class="font-semibold">Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan deskripsi"
                      rows="3"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <div
                v-if="isSystemRole"
                class="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300"
              >
                <Info class="size-5 shrink-0 text-amber-600" />
                <div class="space-y-1">
                  <p
                    class="font-semibold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400"
                  >
                    Role Sistem
                  </p>
                  <p
                    class="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed"
                  >
                    Ini adalah role bawaan sistem. Hak akses dapat
                    dikonfigurasi, namun kode role dilindungi dan tidak dapat
                    dihapus.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Right Column: Permissions Checklist Card -->
        <div class="lg:col-span-1">
          <PermissionMatrixPicker
            v-model="permissionIds"
            :permissions="permissions"
            :loading="isLoadingPermissions"
          />
        </div>
      </div>

      <!-- Alert Form Error -->
      <div v-if="formError">
        <Alert
          variant="destructive"
          class="rounded-xl"
        >
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Kesalahan Sistem</AlertTitle>
          <AlertDescription>{{ formError }}</AlertDescription>
        </Alert>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div
      class="flex items-center justify-between border-t px-6 py-4 bg-background shrink-0 mt-auto"
    >
      <Button
        type="button"
        variant="outline"
        :disabled="isSaving"
        @click="emit('cancel')"
      >
        Batal
      </Button>
      <Button
        type="submit"
        variant="default"
        :disabled="isSaving || isLoadingPermissions"
      >
        <div
          v-if="isSaving"
          class="size-4 mr-2 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin"
        />
        {{ isSaving ? 'Menyimpan...' : 'Simpan Role & Hak Akses' }}
      </Button>
    </div>
  </form>

  <AlertDialog v-model:open="showConfirmAlert">
    <AlertDialogContent class="rounded-2xl">
      <AlertDialogHeader>
        <AlertDialogTitle>Simpan Perubahan?</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin menyimpan perubahan pada hak akses role ini?
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
          {{ isSaving ? 'Menyimpan...' : 'Ya, Simpan' }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
