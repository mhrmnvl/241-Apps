<script setup lang="ts">
import { useAddressForm } from '../composables/useAddressForm'
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
import { useAddress } from '../composables/useAddress'
import type { EditAddressProps } from '../types'

const props = defineProps<EditAddressProps>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  reload: []
}>()

const { isSaving, saveAddress } = useAddress()

const { open, existingAddress, onSubmit } = useAddressForm({
  props,
  emit,
  saveAddress,
})
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent
      class="w-full sm:max-w-xl md:max-w-xl lg:max-w-xl flex flex-col gap-0 border-l p-0"
    >
      <form
        class="flex flex-col h-full"
        @submit.prevent="onSubmit"
      >
        <SheetHeader class="px-6 py-6 border-b shrink-0">
          <SheetTitle class="text-xl">
            {{ existingAddress ? 'Ubah Alamat' : 'Tambah Alamat' }}
          </SheetTitle>
          <SheetDescription>
            Masukkan atau perbarui data alamat tempat tinggal Anda saat ini
            dengan lengkap dan valid.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea class="flex-1 min-h-0">
          <div class="p-6">
            <div class="grid gap-5 md:grid-cols-2">
              <FormField
                v-slot="{ componentField }"
                name="street"
              >
                <FormItem class="md:col-span-2 content-start">
                  <FormLabel
                    >Jalan / Dusun
                    <span class="text-destructive">*</span></FormLabel
                  >
                  <FormControl>
                    <Input
                      placeholder="Nama Jalan, Gedung, No. Rumah"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="rt"
              >
                <FormItem class="content-start">
                  <FormLabel>RT</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: 001"
                      maxlength="5"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="rw"
              >
                <FormItem class="content-start">
                  <FormLabel>RW</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: 002"
                      maxlength="5"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="village"
              >
                <FormItem class="content-start">
                  <FormLabel
                    >Desa / Kelurahan
                    <span class="text-destructive">*</span></FormLabel
                  >
                  <FormControl>
                    <Input
                      placeholder="Nama Desa atau Kelurahan"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="district"
              >
                <FormItem class="content-start">
                  <FormLabel
                    >Kecamatan
                    <span class="text-destructive">*</span></FormLabel
                  >
                  <FormControl>
                    <Input
                      placeholder="Nama Kecamatan"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="city"
              >
                <FormItem class="content-start">
                  <FormLabel
                    >Kabupaten / Kota
                    <span class="text-destructive">*</span></FormLabel
                  >
                  <FormControl>
                    <Input
                      placeholder="Nama Kabupaten atau Kota"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="province"
              >
                <FormItem class="content-start">
                  <FormLabel
                    >Provinsi <span class="text-destructive">*</span></FormLabel
                  >
                  <FormControl>
                    <Input
                      placeholder="Nama Provinsi"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="country"
              >
                <FormItem class="content-start">
                  <FormLabel
                    >Negara <span class="text-destructive">*</span></FormLabel
                  >
                  <FormControl>
                    <Input
                      placeholder="Negara"
                      disabled
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="postalCode"
              >
                <FormItem class="content-start">
                  <FormLabel>Kode Pos</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Kode Pos"
                      maxlength="10"
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
                : existingAddress
                  ? 'Simpan Perubahan'
                  : 'Tambah Alamat'
            }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
