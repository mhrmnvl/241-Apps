<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/ui/dialog'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import { Switch } from '@/ui/switch'
import { Checkbox } from '@/ui/checkbox'
import { Image } from 'lucide-vue-next'
import { Separator } from '@/ui/separator'
import AppLayout from '@/layouts/AppLayout.vue'
import { useSettingsStore } from '../stores/settingsStore'
import type { AppKey } from '../types/app-setting.types'
import type { MenuSection } from '@/shared/types/menu.types'
import { menuItemKey } from '@/shared/types/menu.types'

const props = defineProps<{
  appKey: AppKey
  menuSections: MenuSection[]
}>()

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Pengaturan Umum', href: '#' },
]

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
const isUploadingLogo = ref(false)
const isUploadingFavicon = ref(false)

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

const logoFile = ref<File | null>(null)
const logoPreviewUrl = ref<string | null>(null)
const faviconFile = ref<File | null>(null)
const faviconPreviewUrl = ref<string | null>(null)

const effectiveLogoUrl = computed(() => {
  return logoPreviewUrl.value || settingsStore.settings?.logoUrl
})

const effectiveFaviconUrl = computed(() => {
  return faviconPreviewUrl.value || settingsStore.settings?.faviconUrl
})

function handleLogoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  logoFile.value = file
  if (logoPreviewUrl.value) {
    URL.revokeObjectURL(logoPreviewUrl.value)
  }
  logoPreviewUrl.value = URL.createObjectURL(file)
}

function handleFaviconChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  faviconFile.value = file
  if (faviconPreviewUrl.value) {
    URL.revokeObjectURL(faviconPreviewUrl.value)
  }
  faviconPreviewUrl.value = URL.createObjectURL(file)
}

function cancelLogoSelection() {
  logoFile.value = null
  if (logoPreviewUrl.value) {
    URL.revokeObjectURL(logoPreviewUrl.value)
    logoPreviewUrl.value = null
  }
  const input = document.getElementById('logo-input') as HTMLInputElement | null
  if (input) input.value = ''
}

function cancelFaviconSelection() {
  faviconFile.value = null
  if (faviconPreviewUrl.value) {
    URL.revokeObjectURL(faviconPreviewUrl.value)
    faviconPreviewUrl.value = null
  }
  const input = document.getElementById(
    'favicon-input',
  ) as HTMLInputElement | null
  if (input) input.value = ''
}

async function applyLogo() {
  if (!logoFile.value) return
  isUploadingLogo.value = true
  try {
    await settingsStore.uploadLogo(props.appKey, logoFile.value)
    toast.success('Logo berhasil diperbarui')
    cancelLogoSelection()
  } catch {
    toast.error(settingsStore.error ?? 'Gagal mengunggah logo')
  } finally {
    isUploadingLogo.value = false
  }
}

async function applyFavicon() {
  if (!faviconFile.value) return
  isUploadingFavicon.value = true
  try {
    await settingsStore.uploadFavicon(props.appKey, faviconFile.value)
    toast.success('Favicon berhasil diperbarui')
    cancelFaviconSelection()
  } catch {
    toast.error(settingsStore.error ?? 'Gagal mengunggah favicon')
  } finally {
    isUploadingFavicon.value = false
  }
}

function triggerLogoUpload() {
  const input = document.getElementById('logo-input') as HTMLInputElement | null
  if (input) input.click()
}

function triggerFaviconUpload() {
  const input = document.getElementById(
    'favicon-input',
  ) as HTMLInputElement | null
  if (input) input.click()
}

function toggleMenuKey(key: string) {
  const index = form.hiddenMenuKeys.indexOf(key)
  if (index > -1) {
    form.hiddenMenuKeys.splice(index, 1)
  } else {
    form.hiddenMenuKeys.push(key)
  }
}

function getSectionChildrenKeys(section: MenuSection): string[] {
  const keys: string[] = []
  for (const item of section.items) {
    keys.push(menuItemKey(item))
    if (item.items) {
      for (const sub of item.items) {
        keys.push(menuItemKey(sub))
      }
    }
  }
  return keys
}

function isSectionAllVisible(section: MenuSection): boolean {
  const keys = getSectionChildrenKeys(section)
  return keys.every((key) => !form.hiddenMenuKeys.includes(key))
}

function isSectionSomeVisible(section: MenuSection): boolean {
  const keys = getSectionChildrenKeys(section)
  return keys.some((key) => !form.hiddenMenuKeys.includes(key))
}

function toggleSectionAll(section: MenuSection) {
  const childrenKeys = getSectionChildrenKeys(section)
  const allVisible = isSectionAllVisible(section)

  if (allVisible) {
    // Hide section and all children
    if (section.key && !form.hiddenMenuKeys.includes(section.key)) {
      form.hiddenMenuKeys.push(section.key)
    }
    for (const key of childrenKeys) {
      if (!form.hiddenMenuKeys.includes(key)) {
        form.hiddenMenuKeys.push(key)
      }
    }
  } else {
    // Show section and all children
    if (section.key) {
      const idx = form.hiddenMenuKeys.indexOf(section.key)
      if (idx > -1) form.hiddenMenuKeys.splice(idx, 1)
    }
    for (const key of childrenKeys) {
      const idx = form.hiddenMenuKeys.indexOf(key)
      if (idx > -1) {
        form.hiddenMenuKeys.splice(idx, 1)
      }
    }
  }
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
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
              <!-- Section 1: Branding -->
              <div
                class="rounded-xl border bg-card text-card-foreground shadow-xs p-6 space-y-4"
              >
                <h3 class="text-lg font-bold text-foreground">Branding</h3>
                <Separator />
                <div class="space-y-1">
                  <label class="text-sm font-semibold">Nama Aplikasi</label>
                  <Input
                    v-model="form.appTitle"
                    placeholder="SIAKAD 241"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-semibold">Subjudul Aplikasi</label>
                  <Input
                    v-model="form.appSubtitle"
                    placeholder="Sistem Informasi Akademik"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-semibold">
                    Judul Halaman Login
                  </label>
                  <Input
                    v-model="form.loginTitle"
                    placeholder="Masuk ke SIAKAD"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-semibold">
                    Deskripsi Meta (SEO)
                  </label>
                  <Textarea
                    v-model="form.metaDescription"
                    rows="2"
                  />
                </div>
              </div>

              <!-- Section: Logo & Favicon -->
              <div
                class="rounded-xl border bg-card text-card-foreground shadow-xs p-6 space-y-4"
              >
                <h3 class="text-lg font-bold text-foreground">
                  Logo & Favicon
                </h3>
                <Separator />
                <div class="space-y-3">
                  <div class="space-y-1">
                    <label class="text-sm font-semibold">Logo Aplikasi</label>
                    <div class="flex items-center gap-3 w-full">
                      <Dialog v-if="effectiveLogoUrl">
                        <DialogTrigger as-child>
                          <button
                            type="button"
                            class="h-9 w-9 rounded-md border bg-muted/30 flex items-center justify-center overflow-hidden p-1 shrink-0 hover:bg-muted/60 transition-colors cursor-zoom-in"
                            title="Klik untuk memperbesar"
                          >
                            <img
                              :src="effectiveLogoUrl"
                              alt="Logo"
                              class="h-full w-full object-contain"
                            />
                          </button>
                        </DialogTrigger>
                        <DialogContent
                          class="max-w-md p-6 flex flex-col items-center justify-center gap-4"
                        >
                          <h4 class="text-sm font-semibold self-start">
                            Pratinjau Logo
                          </h4>
                          <div
                            class="rounded-xl border bg-muted/10 p-6 flex items-center justify-center max-h-[300px] w-full overflow-hidden"
                          >
                            <img
                              :src="effectiveLogoUrl"
                              alt="Logo"
                              class="max-h-[250px] w-auto object-contain"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                      <div class="flex items-center flex-1">
                        <input
                          id="logo-input"
                          type="file"
                          accept="image/*"
                          class="hidden"
                          @change="handleLogoChange"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          class="h-9 w-full justify-start text-muted-foreground"
                          @click="triggerLogoUpload"
                        >
                          <Image class="h-4 w-4 mr-2 shrink-0" />
                          Pilih Berkas
                        </Button>
                      </div>
                    </div>
                    <div
                      class="text-xs text-muted-foreground pl-12 min-h-5 flex items-center mt-1"
                    >
                      <span
                        v-if="logoFile"
                        class="bg-muted/50 px-2 py-0.5 rounded-md flex items-center max-w-full"
                      >
                        <span class="truncate max-w-[250px]">{{
                          logoFile.name
                        }}</span>
                      </span>
                      <span v-else> Tidak ada berkas terpilih </span>
                    </div>
                    <div
                      v-if="logoFile"
                      class="flex items-center justify-end gap-2 mt-2"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        :disabled="isUploadingLogo"
                        @click="cancelLogoSelection"
                      >
                        Batal
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        :disabled="isUploadingLogo"
                        @click="applyLogo"
                      >
                        {{ isUploadingLogo ? 'Menerapkan...' : 'Terapkan' }}
                      </Button>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-semibold">Favicon</label>
                    <div class="flex items-center gap-3 w-full">
                      <Dialog v-if="effectiveFaviconUrl">
                        <DialogTrigger as-child>
                          <button
                            type="button"
                            class="h-9 w-9 rounded-md border bg-muted/30 flex items-center justify-center overflow-hidden p-1 shrink-0 hover:bg-muted/60 transition-colors cursor-zoom-in"
                            title="Klik untuk memperbesar"
                          >
                            <img
                              :src="effectiveFaviconUrl"
                              alt="Favicon"
                              class="h-full w-full object-contain"
                            />
                          </button>
                        </DialogTrigger>
                        <DialogContent
                          class="max-w-xs p-6 flex flex-col items-center justify-center gap-4"
                        >
                          <h4 class="text-sm font-semibold self-start">
                            Pratinjau Favicon
                          </h4>
                          <div
                            class="rounded-xl border bg-muted/10 p-6 flex items-center justify-center h-40 w-40 overflow-hidden"
                          >
                            <img
                              :src="effectiveFaviconUrl"
                              alt="Favicon"
                              class="h-24 w-24 object-contain"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                      <div class="flex items-center flex-1">
                        <input
                          id="favicon-input"
                          type="file"
                          accept="image/*"
                          class="hidden"
                          @change="handleFaviconChange"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          class="h-9 w-full justify-start text-muted-foreground"
                          @click="triggerFaviconUpload"
                        >
                          <Image class="h-4 w-4 mr-2 shrink-0" />
                          Pilih Berkas
                        </Button>
                      </div>
                    </div>
                    <div
                      class="text-xs text-muted-foreground pl-12 min-h-5 flex items-center mt-1"
                    >
                      <span
                        v-if="faviconFile"
                        class="bg-muted/50 px-2 py-0.5 rounded-md flex items-center max-w-full"
                      >
                        <span class="truncate max-w-[250px]">{{
                          faviconFile.name
                        }}</span>
                      </span>
                      <span v-else> Tidak ada berkas terpilih </span>
                    </div>
                    <div
                      v-if="faviconFile"
                      class="flex items-center justify-end gap-2 mt-2"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        :disabled="isUploadingFavicon"
                        @click="cancelFaviconSelection"
                      >
                        Batal
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        :disabled="isUploadingFavicon"
                        @click="applyFavicon"
                      >
                        {{ isUploadingFavicon ? 'Menerapkan...' : 'Terapkan' }}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 2: Kontak & Footer -->
              <div
                class="rounded-xl border bg-card text-card-foreground shadow-xs p-6 space-y-4"
              >
                <h3 class="text-lg font-bold text-foreground">
                  Kontak & Footer
                </h3>
                <Separator />
                <div class="space-y-1">
                  <label class="text-sm font-semibold">Email Kontak</label>
                  <Input
                    v-model="form.contactEmail"
                    type="email"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-semibold">Telepon Kontak</label>
                  <Input v-model="form.contactPhone" />
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-semibold">Teks Footer</label>
                  <Input v-model="form.footerText" />
                </div>
              </div>

              <!-- Section 3: Mode Pemeliharaan -->
              <div
                class="rounded-xl border bg-card text-card-foreground shadow-xs p-6 space-y-4"
              >
                <h3 class="text-lg font-bold text-foreground">
                  Mode Pemeliharaan
                </h3>
                <Separator />
                <div class="flex items-center gap-3">
                  <Switch
                    :model-value="form.maintenanceMode"
                    @update:model-value="
                      (v) => (form.maintenanceMode = Boolean(v))
                    "
                  />
                  <span class="text-sm">
                    Aktifkan mode pemeliharaan (memblokir akses pengguna
                    non-admin)
                  </span>
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-semibold"
                    >Pesan Pemeliharaan</label
                  >
                  <Textarea
                    v-model="form.maintenanceMessage"
                    rows="2"
                    placeholder="Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti."
                  />
                </div>
              </div>

              <!-- Section 4: Visibilitas Menu -->
              <div
                class="rounded-xl border bg-card text-card-foreground shadow-xs p-6 space-y-4 col-span-1 md:col-span-2"
              >
                <h3 class="text-lg font-bold text-foreground">
                  Visibilitas Menu
                </h3>
                <Separator />
                <div class="max-h-[400px] overflow-y-auto pr-2 space-y-4">
                  <div
                    v-for="section in props.menuSections"
                    :key="section.label"
                    class="border border-border/60 rounded-xl bg-card overflow-hidden shadow-xs transition-all duration-200"
                  >
                    <!-- Section Header -->
                    <div
                      class="flex items-center justify-between px-4 py-3 bg-muted/10 border-b cursor-pointer select-none"
                      @click="toggleSectionAll(section)"
                    >
                      <div class="flex items-center gap-3">
                        <Checkbox
                          :model-value="
                            isSectionAllVisible(section)
                              ? true
                              : isSectionSomeVisible(section)
                                ? 'indeterminate'
                                : false
                          "
                          @click.stop
                          @update:model-value="() => toggleSectionAll(section)"
                        />
                        <span class="font-semibold text-sm">{{
                          section.label
                        }}</span>
                      </div>
                    </div>

                    <!-- Items Grid -->
                    <div
                      class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-card/50"
                    >
                      <template
                        v-for="item in section.items"
                        :key="item.title"
                      >
                        <!-- Main Item Card -->
                        <div
                          class="flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/40 cursor-pointer transition-colors"
                          @click="toggleMenuKey(menuItemKey(item))"
                        >
                          <Checkbox
                            :model-value="
                              !form.hiddenMenuKeys.includes(menuItemKey(item))
                            "
                            class="mt-0.5"
                            @click.stop
                            @update:model-value="
                              () => toggleMenuKey(menuItemKey(item))
                            "
                          />
                          <div class="space-y-0.5 select-none">
                            <div class="text-xs font-semibold tracking-tight">
                              {{ item.title }}
                            </div>
                            <div
                              class="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]"
                              :title="item.url"
                            >
                              {{ item.url }}
                            </div>
                          </div>
                        </div>

                        <!-- Sub Items if exist -->
                        <template v-if="item.items && item.items.length > 0">
                          <div
                            v-for="sub in item.items"
                            :key="sub.url"
                            class="flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/40 cursor-pointer transition-colors bg-muted/5"
                            @click="toggleMenuKey(menuItemKey(sub))"
                          >
                            <Checkbox
                              :model-value="
                                !form.hiddenMenuKeys.includes(menuItemKey(sub))
                              "
                              class="mt-0.5"
                              @click.stop
                              @update:model-value="
                                () => toggleMenuKey(menuItemKey(sub))
                              "
                            />
                            <div class="space-y-0.5 select-none">
                              <div
                                class="text-xs font-semibold tracking-tight flex items-center gap-1.5"
                              >
                                {{ sub.title }}
                                <span
                                  class="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground font-semibold"
                                  >Sub</span
                                >
                              </div>
                              <div
                                class="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]"
                                :title="sub.url"
                              >
                                {{ sub.url }}
                              </div>
                            </div>
                          </div>
                        </template>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
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
  </AppLayout>
</template>
