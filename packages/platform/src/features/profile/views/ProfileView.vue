<script setup lang="ts">
import { onMounted, computed, unref, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card } from '@/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { Button } from '@/ui/button'
import { Loader2, Camera, Trash2 } from 'lucide-vue-next'
import { Avatar, AvatarImage, AvatarFallback } from '@/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/ui/dialog'

import PersonalInfoTab from '../components/PersonalInfoTab.vue'
import ProfileSheets from '../components/ProfileSheets.vue'
import ChangePasswordSection from '../components/ChangePasswordSection.vue'

import {
  AddressInfoTab,
  useAddress,
  type AddressSavePayload,
} from '@/features/platform/address'
import { useProfileView } from '../composables/useProfileView'
import { profileConfig } from '../config'

const breadcrumbs = [{ title: 'Profil', href: '#' }, { title: 'Detail Profil' }]

const {
  activeTab,
  showEditProfile,
  showEditAddress,
  loading,
  profileData,
  rawProfile,
  isSaving,
  isUploadingPhoto,
  isAdmin,
  isEditable,
  isOwnProfile,
  initials,
  profileSubtitle,
  avatarUrl,
  getUserId,
  actionConfig,
  reloadProfile,
  handleActionClick,
  handleUpdateProfile,
  handlePhotoChange,
  handlePhotoDelete,
} = useProfileView()

const { saveAddress } = useAddress()

const handleUpdateAddress = async (payload: AddressSavePayload) => {
  const addressId = rawProfile.value?.address?.id
  const isCreate = !addressId
  const { success } = await saveAddress(payload, isCreate, addressId)
  if (success) {
    reloadProfile()
  }
}

const isPhotoDialogOpen = ref(false)

function triggerPhotoUpload() {
  if (isUploadingPhoto.value) return
  const input = document.getElementById(
    'profile-photo-input',
  ) as HTMLInputElement | null
  if (input) input.click()
}

async function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    await handlePhotoChange(file)
    isPhotoDialogOpen.value = false
  }
  ;(e.target as HTMLInputElement).value = ''
}

async function onPhotoDeleteClick() {
  await handlePhotoDelete()
  isPhotoDialogOpen.value = false
}

const activeTabLabel = computed(() => {
  if (activeTab.value === 'personal') return 'Data Diri'
  if (activeTab.value === 'address') return 'Alamat'
  if (activeTab.value === 'security') return 'Keamanan'

  const extraTab = profileConfig.value.extraTabs.find(
    (tab) => tab.value === activeTab.value,
  )
  return extraTab ? extraTab.label : 'Profil Pengguna'
})

const hasExtraAction = computed(() => {
  const extraTab = profileConfig.value.extraTabs.find(
    (tab) => tab.value === activeTab.value,
  )
  return !!extraTab?.actionConfig
})

onMounted(() => {
  reloadProfile()
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <div
        v-if="loading"
        class="flex items-center justify-center min-h-[500px] rounded-2xl bg-card shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <div class="flex flex-col items-center gap-3">
          <Loader2 class="size-8 animate-spin text-muted-foreground" />
          <p class="text-sm text-muted-foreground">Memuat data profil...</p>
        </div>
      </div>

      <Card
        v-else-if="profileData"
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 bg-card border-none lg:h-[530px] flex flex-col"
      >
        <Tabs
          v-model="activeTab"
          class="w-full lg:h-full lg:flex lg:flex-col"
        >
          <div class="grid grid-cols-1 lg:grid-cols-4 lg:h-full lg:min-h-0">
            <!-- Left Column: Profile Navigation Sidebar -->
            <div
              class="lg:col-span-1 p-6 lg:border-r border-border/60 flex flex-col gap-6 lg:h-full lg:min-h-0"
            >
              <div class="flex flex-col items-center text-center shrink-0">
                <!-- Avatar block -->
                <div class="relative shrink-0 mb-4">
                  <Avatar class="size-24 border-2 border-primary/20">
                    <AvatarImage
                      v-if="avatarUrl"
                      :src="avatarUrl"
                      :alt="profileData.fullName"
                    />
                    <AvatarFallback
                      class="bg-primary/10 text-2xl font-bold text-primary"
                    >
                      {{ initials }}
                    </AvatarFallback>
                  </Avatar>

                  <template v-if="isOwnProfile">
                    <button
                      type="button"
                      title="Kelola foto profil"
                      class="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                      @click="isPhotoDialogOpen = true"
                    >
                      <Camera class="size-4" />
                    </button>
                  </template>
                </div>

                <!-- Info block -->
                <h2 class="text-xl font-bold text-foreground line-clamp-2">
                  {{ profileData.fullName || '-' }}
                </h2>
                <p class="text-xs font-medium text-muted-foreground mt-1">
                  {{ profileSubtitle }}
                </p>
              </div>

              <!-- Mobile selector -->
              <div class="lg:hidden w-full shrink-0">
                <Select v-model="activeTab">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih Tab" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="personal"> Data Diri </SelectItem>
                      <template
                        v-for="tab in profileConfig.extraTabs"
                        :key="tab.value"
                      >
                        <SelectItem
                          v-if="!tab.show || tab.show(profileData.roles ?? [])"
                          :value="tab.value"
                        >
                          {{ tab.label }}
                        </SelectItem>
                      </template>
                      <SelectItem value="address"> Alamat </SelectItem>
                      <SelectItem value="security"> Keamanan </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <!-- Desktop Vertical Navigation -->
              <TabsList
                class="hidden lg:flex flex-col gap-1 w-full bg-transparent border-0 h-auto p-0 flex-1 overflow-y-auto min-h-0 pr-1 select-none items-stretch justify-start [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
              >
                <!-- Trigger item styling: vertical sidebar items matching AppSidebar style -->
                <TabsTrigger
                  value="personal"
                  class="justify-start px-3 py-2 h-9 text-left w-full border-0 rounded-md bg-transparent text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=active]:bg-sidebar-accent data-[state=active]:font-medium data-[state=active]:text-sidebar-accent-foreground shadow-none data-[state=active]:shadow-none transition-all duration-200 cursor-pointer"
                >
                  Data Diri
                </TabsTrigger>
                <template
                  v-for="tab in profileConfig.extraTabs"
                  :key="tab.value"
                >
                  <TabsTrigger
                    v-if="!tab.show || tab.show(profileData.roles ?? [])"
                    :value="tab.value"
                    class="justify-start px-3 py-2 h-9 text-left w-full border-0 rounded-md bg-transparent text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=active]:bg-sidebar-accent data-[state=active]:font-medium data-[state=active]:text-sidebar-accent-foreground shadow-none data-[state=active]:shadow-none transition-all duration-200 cursor-pointer"
                  >
                    {{ tab.label }}
                  </TabsTrigger>
                </template>
                <TabsTrigger
                  value="address"
                  class="justify-start px-3 py-2 h-9 text-left w-full border-0 rounded-md bg-transparent text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=active]:bg-sidebar-accent data-[state=active]:font-medium data-[state=active]:text-sidebar-accent-foreground shadow-none data-[state=active]:shadow-none transition-all duration-200 cursor-pointer"
                >
                  Alamat
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  class="justify-start px-3 py-2 h-9 text-left w-full border-0 rounded-md bg-transparent text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=active]:bg-sidebar-accent data-[state=active]:font-medium data-[state=active]:text-sidebar-accent-foreground shadow-none data-[state=active]:shadow-none transition-all duration-200 cursor-pointer"
                >
                  Keamanan
                </TabsTrigger>
              </TabsList>
            </div>

            <!-- Right Column: Detail Content -->
            <div class="lg:col-span-3 flex flex-col lg:h-full lg:min-h-0">
              <!-- Top header of the content area -->
              <div
                class="px-6 py-3.5 border-b border-border/60 shrink-0 flex items-center justify-between"
              >
                <h3 class="text-lg font-bold tracking-tight text-foreground">
                  {{ activeTabLabel }}
                </h3>
                <Button
                  v-if="isEditable && hasExtraAction"
                  size="sm"
                  class="h-8 gap-1.5 cursor-pointer text-xs"
                  @click="handleActionClick(activeTab)"
                >
                  <component
                    :is="actionConfig.icon"
                    class="size-3.5"
                  />
                  {{ actionConfig.text }}
                </Button>
              </div>

              <!-- Main Content area below the header -->
              <div
                class="p-6 lg:p-6 lg:pt-1 flex-1 lg:overflow-y-auto lg:min-h-0"
              >
                <TabsContent
                  value="personal"
                  class="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in-50 duration-200"
                >
                  <PersonalInfoTab
                    :data="profileData"
                    :raw-profile="rawProfile"
                    :is-editable="isEditable"
                    :is-saving="isSaving"
                    @save="handleUpdateProfile"
                  />
                </TabsContent>

                <template
                  v-for="tab in profileConfig.extraTabs"
                  :key="tab.value"
                >
                  <TabsContent
                    v-if="!tab.show || tab.show(profileData.roles ?? [])"
                    :value="tab.value"
                    class="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in-50 duration-200"
                  >
                    <component
                      :is="tab.component"
                      v-bind="
                        tab.props
                          ? tab.props({
                              profileData: unref(profileData),
                              rawProfile: unref(rawProfile),
                              isAdmin,
                              reloadProfile,
                            })
                          : { data: profileData }
                      "
                      :is-editable="isEditable"
                      @reload="reloadProfile"
                    />
                  </TabsContent>
                </template>

                <TabsContent
                  value="address"
                  class="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in-50 duration-200"
                >
                  <AddressInfoTab
                    :data="profileData"
                    :raw-address="rawProfile?.address"
                    :is-editable="isEditable"
                    @save="handleUpdateAddress"
                  />
                </TabsContent>

                <TabsContent
                  value="security"
                  class="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in-50 duration-200"
                >
                  <ChangePasswordSection />
                </TabsContent>
              </div>
            </div>
          </div>
        </Tabs>
      </Card>
    </div>

    <ProfileSheets
      v-model:show-edit-profile="showEditProfile"
      v-model:show-edit-address="showEditAddress"
      :raw-profile="rawProfile"
      :profile-data="profileData"
      :is-saving="isSaving"
      :user-id="getUserId"
      @save-profile="handleUpdateProfile"
      @reload="reloadProfile"
    />

    <component
      :is="sheet.component"
      v-for="(sheet, i) in profileConfig.extraSheets"
      :key="i"
      v-bind="
        sheet.props({
          userId: getUserId,
          rawProfile: unref(rawProfile),
          profileData: unref(profileData),
          reloadProfile,
          isAdmin,
        })
      "
    />

    <!-- Dialog untuk Kelola Foto Profil -->
    <Dialog v-model:open="isPhotoDialogOpen">
      <DialogContent
        class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden"
      >
        <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
          <DialogTitle>Foto Profil</DialogTitle>
          <DialogDescription class="sr-only">
            Kelola foto profil Anda saat ini.
          </DialogDescription>
        </DialogHeader>

        <div class="flex flex-col items-center gap-6 p-6">
          <Avatar class="size-32 border-4 border-primary/10">
            <AvatarImage
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="profileData?.fullName ?? ''"
            />
            <AvatarFallback
              class="bg-primary/10 text-4xl font-bold text-primary"
            >
              {{ initials }}
            </AvatarFallback>
          </Avatar>

          <p class="text-sm text-center text-muted-foreground">
            Pilih tindakan untuk memperbarui atau menghapus foto profil Anda.
          </p>

          <input
            id="profile-photo-input"
            type="file"
            accept="image/*"
            class="hidden"
            :disabled="isUploadingPhoto"
            @change="handleFileChange"
          />
        </div>

        <DialogFooter
          class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background gap-2"
        >
          <Button
            type="button"
            variant="outline"
            class="cursor-pointer"
            @click="isPhotoDialogOpen = false"
          >
            Batal
          </Button>

          <div class="flex items-center gap-2">
            <Button
              v-if="avatarUrl"
              type="button"
              variant="destructive"
              class="gap-2 cursor-pointer"
              :disabled="isUploadingPhoto"
              @click="onPhotoDeleteClick"
            >
              <Trash2 class="size-4" />
              Hapus Foto
            </Button>

            <Button
              type="button"
              class="gap-2 cursor-pointer"
              :disabled="isUploadingPhoto"
              @click="triggerPhotoUpload"
            >
              <Camera class="size-4" />
              {{ isUploadingPhoto ? 'Mengunggah...' : 'Unggah Foto' }}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </AppLayout>
</template>
