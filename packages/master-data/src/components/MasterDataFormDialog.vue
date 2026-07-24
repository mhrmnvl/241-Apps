<script setup lang="ts" generic="T extends MasterDataEntity">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, watch } from 'vue'
import { Button } from '@/ui/button'
import { ScrollArea } from '@/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
import { Switch } from '@/ui/switch'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { Loader2 } from 'lucide-vue-next'
import {
  buildFieldSchema,
  buildInitialValues,
} from '../schema/buildFieldSchema'
import type { MasterDataEntity, MasterDataField } from '../types/config'

const props = defineProps<{
  open: boolean
  fields: MasterDataField[]
  entityLabel: { singular: string; plural: string }
  isSubmitting?: boolean
  initialData?: T | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [payload: Record<string, unknown>]
}>()

const isEditing = computed(() => !!props.initialData)

const formSchema = computed(() => toTypedSchema(buildFieldSchema(props.fields)))
const initialValues = computed(() => buildInitialValues(props.fields))

const { handleSubmit, setValues, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues,
})

watch(
  () => [props.open, props.initialData] as const,
  ([isOpen]) => {
    if (!isOpen) return
    if (props.initialData) {
      const values: Record<string, unknown> = {}
      for (const field of props.fields) {
        values[field.key] = props.initialData[field.key]
      }
      setValues(values)
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  emit('save', values)
})
</script>

<template>
  <Dialog
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>
          {{ isEditing ? 'Edit' : 'Tambah' }} {{ entityLabel.singular }}
        </DialogTitle>
        <DialogDescription class="sr-only" />
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="master-data-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="onSubmit"
        >
          <FormField
            v-for="field in fields"
            :key="field.key"
            v-slot="{ value, handleChange, componentField }"
            :name="field.key"
          >
            <FormItem v-if="field.kind === 'text'">
              <FormLabel>
                {{ field.label }}
                <span
                  v-if="field.required"
                  class="text-destructive"
                  >*</span
                >
              </FormLabel>
              <FormControl>
                <Input
                  :placeholder="field.placeholder"
                  :disabled="isSubmitting"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem
              v-else
              class="flex items-center justify-between gap-2"
            >
              <FormLabel>{{ field.label }}</FormLabel>
              <FormControl>
                <Switch
                  :model-value="Boolean(value)"
                  :disabled="isSubmitting"
                  @update:model-value="handleChange"
                />
              </FormControl>
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
          :disabled="isSubmitting"
          @click="$emit('update:open', false)"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="master-data-form"
          :disabled="isSubmitting"
        >
          <Loader2
            v-if="isSubmitting"
            class="mr-2 h-4 w-4 animate-spin"
          />
          {{ isEditing ? 'Simpan' : 'Tambah' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
