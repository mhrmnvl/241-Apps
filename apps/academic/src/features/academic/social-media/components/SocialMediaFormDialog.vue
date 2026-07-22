<script setup lang="ts">
import { watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { ScrollArea } from '@/ui/scroll-area'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { useSocialMedia } from '../composables/useSocialMedia'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'

const {
  selectedSocialMedia,
  isFormOpen,
  isSubmitting,
  resetForm: resetStoreForm,
  handleSubmit: submitSocialMedia,
} = useSocialMedia()

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Nama socialMedia wajib diisi.'),
    baseUrl: z
      .string()
      .url('Format URL tidak valid (contoh: https://instagram.com/).')
      .min(1, 'Base URL wajib diisi.'),
  }),
)

const { handleSubmit, setValues, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    baseUrl: '',
  },
})

watch(
  selectedSocialMedia,
  (newVal) => {
    if (newVal) {
      setValues({
        name: newVal.name,
        baseUrl: newVal.baseUrl,
      })
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

const handleClose = () => {
  resetStoreForm()
}

const onSubmit = handleSubmit(async (values) => {
  const success = await submitSocialMedia(values)
  if (success) {
    handleClose()
  }
})
</script>

<template>
  <Dialog
    :open="isFormOpen"
    @update:open="handleClose"
  >
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>{{
          selectedSocialMedia ? 'Edit SocialMedia' : 'Tambah SocialMedia'
        }}</DialogTitle>
        <DialogDescription>
          Isi form di bawah ini untuk
          {{ selectedSocialMedia ? 'mengubah' : 'menambahkan' }} data
          socialMedia.
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="socialMedia-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="onSubmit"
        >
          <FormField
            v-slot="{ componentField }"
            name="name"
          >
            <FormItem>
              <FormLabel>Nama SocialMedia</FormLabel>
              <FormControl>
                <Input
                  placeholder="Misal: Instagram"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="baseUrl"
          >
            <FormItem>
              <FormLabel>Base URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="Misal: https://instagram.com/"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>
      </ScrollArea>

      <DialogFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background"
      >
        <Button
          type="button"
          variant="outline"
          @click="handleClose"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="socialMedia-form"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
