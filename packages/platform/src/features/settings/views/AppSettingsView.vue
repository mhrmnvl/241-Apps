<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/ui/card'
import { Button } from '@/ui/button'
import { useSettingsStore } from '../stores/settingsStore'
import type { AppKey } from '../types/app-setting.types'
import type { MenuSection } from '@/shared/types/menu.types'
import BrandingSection from '../components/BrandingSection.vue'
import ContactFooterSection from '../components/ContactFooterSection.vue'
import MaintenanceSection from '../components/MaintenanceSection.vue'
import LogoFaviconSection from '../components/LogoFaviconSection.vue'
import MenuVisibilityTree from '../components/MenuVisibilityTree.vue'

const props = defineProps<{
  appKey: AppKey
  menuSections: MenuSection[]
}>()

const settingsStore = useSettingsStore()

const form = reactive({
  appTitle: '',
  appSubtitle: '',
  loginTitle: '',
  metaDescription: '',
  contactEmail: '',
  contactPhone: '',
  footerText: '',
  maintenanceMode: false,
  maintenanceMessage: '',
  hiddenMenuKeys: [] as string[],
})

const isSaving = ref(false)

function syncFormFromStore() {
  const s = settingsStore.settings
  if (!s) return
  form.appTitle = s.appTitle
  form.appSubtitle = s.appSubtitle
  form.loginTitle = s.loginTitle
  form.metaDescription = s.metaDescription
  form.contactEmail = s.contactEmail ?? ''
  form.contactPhone = s.contactPhone ?? ''
  form.footerText = s.footerText ?? ''
  form.maintenanceMode = s.maintenanceMode
  form.maintenanceMessage = s.maintenanceMessage ?? ''
  form.hiddenMenuKeys = [...s.hiddenMenuKeys]
}

onMounted(async () => {
  await settingsStore.fetchSettings(props.appKey)
  syncFormFromStore()
})

async function handleSave() {
  isSaving.value = true
  try {
    await settingsStore.updateSettings(props.appKey, {
      appTitle: form.appTitle,
      appSubtitle: form.appSubtitle,
      loginTitle: form.loginTitle,
      metaDescription: form.metaDescription,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      footerText: form.footerText || undefined,
      maintenanceMode: form.maintenanceMode,
      maintenanceMessage: form.maintenanceMessage || undefined,
      hiddenMenuKeys: form.hiddenMenuKeys,
    })
    toast.success('Pengaturan berhasil disimpan')
  } catch {
    toast.error(settingsStore.error ?? 'Gagal menyimpan pengaturan')
  } finally {
    isSaving.value = false
  }
}

async function uploadLogo(file: File) {
  await settingsStore.uploadLogo(props.appKey, file)
}

async function uploadFavicon(file: File) {
  await settingsStore.uploadFavicon(props.appKey, file)
}
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <div
      v-if="settingsStore.isLoading && !settingsStore.isLoaded"
      class="py-12 text-center text-sm text-muted-foreground"
    >
      Memuat pengaturan...
    </div>

    <template v-else>
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 flex flex-col gap-0"
      >
        <CardHeader class="border-b px-6 py-5 shrink-0">
          <CardTitle class="text-2xl font-bold tracking-tight">
            Pengaturan Umum
          </CardTitle>
        </CardHeader>

        <CardContent class="p-6 md:p-8 lg:p-10 !pt-8 !md:pt-10 !lg:pt-12">
          <div class="grid gap-6 md:gap-8 md:grid-cols-2">
            <BrandingSection
              v-model:app-title="form.appTitle"
              v-model:app-subtitle="form.appSubtitle"
              v-model:login-title="form.loginTitle"
              v-model:meta-description="form.metaDescription"
            />

            <LogoFaviconSection
              :logo-url="settingsStore.settings?.logoUrl"
              :favicon-url="settingsStore.settings?.faviconUrl"
              :upload-logo="uploadLogo"
              :upload-favicon="uploadFavicon"
            />

            <ContactFooterSection
              v-model:contact-email="form.contactEmail"
              v-model:contact-phone="form.contactPhone"
              v-model:footer-text="form.footerText"
            />

            <MaintenanceSection
              v-model:maintenance-mode="form.maintenanceMode"
              v-model:maintenance-message="form.maintenanceMessage"
            />

            <MenuVisibilityTree
              v-model="form.hiddenMenuKeys"
              :menu-sections="props.menuSections"
            />
          </div>
        </CardContent>

        <CardFooter class="border-t px-6 py-4 flex justify-end bg-muted/10">
          <Button
            :disabled="isSaving"
            @click="handleSave"
          >
            {{ isSaving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
          </Button>
        </CardFooter>
      </Card>
    </template>
  </div>
</template>
