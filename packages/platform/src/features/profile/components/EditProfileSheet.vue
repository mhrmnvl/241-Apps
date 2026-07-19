<script setup lang="ts">
import { useProfileForm } from '../composables/useProfileForm'
import ProfileFormBasic from './ProfileFormBasic.vue'
import ProfileFormAdvanced from './ProfileFormAdvanced.vue'
import { Button } from '@/ui/button'
import { ScrollArea } from '@/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import type { RawProfileData, ProfileUpdatePayload } from '../types'

const props = defineProps<{
  open: boolean
  isSaving: boolean
  profileData?: RawProfileData | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: ProfileUpdatePayload]
}>()

const { open, activeTab, form, onSubmit, handleNext, handleBack } =
  useProfileForm({
    open: props.open,
    profileData: props.profileData,
    emit,
  })
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent
      class="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col gap-0 border-l p-0"
    >
      <form
        class="flex flex-col h-full"
        @submit.prevent="onSubmit"
      >
        <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
          <SheetTitle class="text-xl"> Ubah Data Diri </SheetTitle>
          <SheetDescription>
            Perbarui data diri dasar dan informasi pendaftaran Anda. Gunakan
            form di bawah ini lalu klik Simpan.
          </SheetDescription>
        </SheetHeader>

        <Tabs
          v-model="activeTab"
          class="flex-1 w-full flex flex-col min-h-0"
        >
          <div
            class="px-6 pt-4 pb-2 border-b shrink-0 z-10 bg-background shadow-sm"
          >
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger
                value="utama"
                :class="activeTab === 'utama' ? 'bg-background shadow-sm' : ''"
              >
                Data Utama
              </TabsTrigger>
              <TabsTrigger
                value="lanjutan"
                :class="
                  activeTab === 'lanjutan' ? 'bg-background shadow-sm' : ''
                "
              >
                Kontak & Lanjutan
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea class="flex-1 min-h-0">
            <div class="px-6 py-4">
              <TabsContent
                value="utama"
                class="mt-0"
              >
                <ProfileFormBasic :form="form" />
              </TabsContent>
              <TabsContent
                value="lanjutan"
                class="mt-0"
              >
                <ProfileFormAdvanced />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        <SheetFooter
          class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background relative mt-auto"
        >
          <Button
            type="button"
            variant="outline"
            :disabled="isSaving"
            @click="handleBack"
          >
            {{ activeTab === 'utama' ? 'Batal' : 'Kembali' }}
          </Button>

          <Button
            v-if="activeTab === 'utama'"
            type="button"
            variant="default"
            @click="handleNext"
          >
            Lanjut
          </Button>
          <Button
            v-else
            type="submit"
            variant="default"
            :disabled="isSaving"
          >
            {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
