<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAchievementForm } from '../composables/useAchievementForm'
import { Button } from '@/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import { ScrollArea } from '@/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import type { AchievementEditData } from '../types'
import { achievementTypeApi } from '@/features/platform/achievement-type/api/achievementTypeApi'

const props = defineProps<{
  open: boolean
  editingItem?: AchievementEditData | null
  profileId: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  reload: []
}>()

const { open, isCreate, isSaving, onSubmit } = useAchievementForm({
  props,
  emit,
})

const achievementTypes = ref<{ id: string; name: string }[]>([])

onMounted(async () => {
  try {
    const res = await achievementTypeApi.getAchievementTypes({
      limit: 100,
      isActive: true,
    })
    achievementTypes.value = res.data?.data ?? []
  } catch (error) {
    console.error('Gagal memuat tipe prestasi:', error)
  }
})
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent class="w-full sm:max-w-xl flex flex-col gap-0 border-l p-0">
      <form
        class="flex flex-col h-full"
        @submit.prevent="onSubmit"
      >
        <SheetHeader class="px-6 py-6 border-b shrink-0">
          <SheetTitle class="text-xl">
            {{ isCreate ? 'Tambah Prestasi' : 'Edit Prestasi' }}
          </SheetTitle>
          <SheetDescription>
            {{
              isCreate
                ? 'Catat prestasi baru yang telah diraih.'
                : 'Perbarui data prestasi yang sudah ada.'
            }}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea class="flex-1 min-h-0">
          <div class="p-6">
            <div class="grid gap-5 md:grid-cols-2">
              <FormField
                v-slot="{ componentField }"
                name="name"
              >
                <FormItem class="md:col-span-2 content-start">
                  <FormLabel>
                    Nama Prestasi
                    <span class="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Olimpiade Matematika Nasional"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="level"
              >
                <FormItem class="content-start">
                  <FormLabel>
                    Pencapaian
                    <span class="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Juara 1, Medali Emas"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="typeId"
              >
                <FormItem class="content-start">
                  <FormLabel>
                    Tingkat <span class="text-destructive">*</span>
                  </FormLabel>
                  <Select v-bind="componentField">
                    <FormControl>
                      <SelectTrigger class="w-full">
                        <SelectValue placeholder="Pilih Tingkat" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem
                        v-for="at in achievementTypes"
                        :key="at.id"
                        :value="at.id"
                      >
                        {{ at.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="year"
              >
                <FormItem class="md:col-span-2 content-start">
                  <FormLabel>
                    Tahun <span class="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2024"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="description"
              >
                <FormItem class="md:col-span-2 content-start">
                  <FormLabel>Keterangan Singkat</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsi singkat mengenai prestasi ini..."
                      :rows="3"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter
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
            {{
              isSaving
                ? 'Menyimpan...'
                : isCreate
                  ? 'Tambah'
                  : 'Simpan Perubahan'
            }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
