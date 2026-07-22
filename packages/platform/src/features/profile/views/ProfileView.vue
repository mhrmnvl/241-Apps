<script setup lang="ts">
import { onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardHeader, CardTitle } from '@/ui/card'
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
import { KeyRound, Loader2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import PersonalInfoTab from '../components/PersonalInfoTab.vue'
import ProfileHeaderCard from '../components/ProfileHeaderCard.vue'
import ProfileSheets from '../components/ProfileSheets.vue'

import { AddressInfoTab } from '@/features/platform/address'
import { useProfileView } from '../composables/useProfileView'
import { profileConfig } from '../config'

const router = useRouter()

const breadcrumbs = [{ title: 'Profil', href: '#' }, { title: 'Detail Profil' }]

const {
  activeTab,
  showEditProfile,
  showEditAddress,
  loading,
  profileData,
  rawProfile,
  isSaving,
  isAdmin,
  isEditable,
  initials,
  profileSubtitle,
  getUserId,
  actionConfig,
  reloadProfile,
  handleActionClick,
  handleUpdateProfile,
} = useProfileView()

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
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader class="px-6 py-5 border-b bg-background">
          <CardTitle class="text-2xl font-bold tracking-tight">
            Profil Pengguna
          </CardTitle>
        </CardHeader>

        <ProfileHeaderCard
          :full-name="profileData.fullName ?? ''"
          :subtitle="profileSubtitle"
          :initials="initials"
          :is-editable="isEditable"
          :active-tab="activeTab"
          :action-config="actionConfig"
          @action-click="handleActionClick"
        />

        <Tabs
          v-model="activeTab"
          class="w-full px-6 pb-6 mt-4"
        >
          <div class="md:hidden w-full">
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
          <TabsList
            class="hidden md:grid w-full h-auto md:grid-cols-3 lg:grid-cols-5 gap-1 mb-2"
          >
            <TabsTrigger value="personal"> Data Diri </TabsTrigger>
            <template
              v-for="tab in profileConfig.extraTabs"
              :key="tab.value"
            >
              <TabsTrigger
                v-if="!tab.show || tab.show(profileData.roles ?? [])"
                :value="tab.value"
              >
                {{ tab.label }}
              </TabsTrigger>
            </template>
            <TabsTrigger value="address"> Alamat </TabsTrigger>
            <TabsTrigger value="security"> Keamanan </TabsTrigger>
          </TabsList>

          <TabsContent
            value="personal"
            class="mt-0"
          >
            <PersonalInfoTab :data="profileData" />
          </TabsContent>

          <template
            v-for="tab in profileConfig.extraTabs"
            :key="tab.value"
          >
            <TabsContent
              v-if="!tab.show || tab.show(profileData.roles ?? [])"
              :value="tab.value"
              class="mt-0"
            >
              <component
                :is="tab.component"
                v-bind="
                  tab.props
                    ? tab.props({
                        profileData,
                        rawProfile,
                        isAdmin,
                        reloadProfile,
                      })
                    : { data: profileData }
                "
              />
            </TabsContent>
          </template>

          <TabsContent
            value="address"
            class="mt-0"
          >
            <AddressInfoTab :data="profileData" />
          </TabsContent>
          <TabsContent
            value="security"
            class="mt-0"
          >
            <div class="max-w-xl py-4 space-y-4">
              <div>
                <h3 class="text-lg font-medium text-slate-900">
                  Keamanan Akun
                </h3>
                <p class="text-sm text-muted-foreground">
                  Kelola password akun Anda di halaman khusus untuk menjaga
                  keamanan data.
                </p>
              </div>
              <Button
                variant="outline"
                @click="router.push({ name: 'profile-change-password' })"
              >
                <KeyRound class="mr-2 h-4 w-4" />
                Ubah Password
              </Button>
            </div>
          </TabsContent>
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
          rawProfile,
          profileData,
          reloadProfile,
          isAdmin,
        })
      "
    />
  </AppLayout>
</template>
