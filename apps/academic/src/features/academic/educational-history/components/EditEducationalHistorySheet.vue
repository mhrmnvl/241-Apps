<script setup lang="ts">
import { useEducationalHistoryForm } from '../composables/useEducationalHistoryForm'
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
import { ScrollArea } from '@/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import type { EducationalHistoryEditData } from '../types'

const props = defineProps<{
  open: boolean
  editingItem?: EducationalHistoryEditData | null
  userId: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  reload: []
}>()

const { isCreate, isSaving, educationLevels, onSubmit } =
  useEducationalHistoryForm({
    get open() {
      return props.open
    },
    get editingItem() {
      return props.editingItem
    },
    get userId() {
      return props.userId
    },
    emit,
  })
</script>

<template>
  <Sheet
    :open="open"
    @update:open="(val) => emit('update:open', val)"
  >
    <SheetContent class="w-full sm:max-w-xl flex flex-col gap-0 border-l p-0">
      <form
        class="flex flex-col h-full"
        @submit.prevent="onSubmit"
      >
        <SheetHeader class="px-6 py-6 border-b shrink-0">
          <SheetTitle class="text-xl">
            {{
              isCreate ? 'Tambah Riwayat Pendidikan' : 'Edit Riwayat Pendidikan'
            }}
          </SheetTitle>
          <SheetDescription>
            {{
              isCreate
                ? 'Tambahkan riwayat pendidikan baru.'
                : 'Perbarui data riwayat pendidikan yang sudah ada.'
            }}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea class="flex-1 min-h-0">
          <div class="p-6">
            <div class="grid gap-5 md:grid-cols-2">
              <FormField
                v-slot="{ componentField }"
                name="level"
              >
                <FormItem class="content-start">
                  <FormLabel>
                    Jenjang <span class="text-destructive">*</span>
                  </FormLabel>
                  <Select v-bind="componentField">
                    <FormControl>
                      <SelectTrigger class="w-full">
                        <SelectValue placeholder="Pilih Jenjang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem
                        v-for="edu in educationLevels"
                        :key="edu.id"
                        :value="edu.name"
                      >
                        {{ edu.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="institution"
              >
                <FormItem class="content-start">
                  <FormLabel>
                    Nama Institusi
                    <span class="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: SMAN 1 Malang"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="major"
              >
                <FormItem class="md:col-span-2 content-start">
                  <FormLabel>Jurusan / Bidang Studi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Kosongkan jika tidak ada"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="startYear"
              >
                <FormItem class="content-start">
                  <FormLabel>
                    Tahun Masuk
                    <span class="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2020"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="endYear"
              >
                <FormItem class="content-start">
                  <FormLabel>Tahun Keluar</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Kosongkan jika masih aktif"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="status"
              >
                <FormItem class="md:col-span-2 content-start">
                  <FormLabel>Keterangan</FormLabel>
                  <Select v-bind="componentField">
                    <FormControl>
                      <SelectTrigger class="w-full">
                        <SelectValue placeholder="Pilih status (opsional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Lulus"> Lulus </SelectItem>
                      <SelectItem value="Aktif">
                        Aktif / Masih Berjalan
                      </SelectItem>
                      <SelectItem value="Pindahan"> Pindahan </SelectItem>
                      <SelectItem value="Keluar"> Keluar </SelectItem>
                    </SelectContent>
                  </Select>
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
            @click="emit('update:open', false)"
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
