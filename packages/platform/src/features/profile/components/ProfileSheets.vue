<script setup lang="ts">
import EditProfileSheet from './EditProfileSheet.vue'
import { EditAddressSheet } from '@/features/platform/address'

import type {
  RawProfileData,
  ProfileStoreData,
  ProfileUpdatePayload,
} from '../types'

defineProps<{
  rawProfile: RawProfileData | null
  profileData: ProfileStoreData | null
  isSaving: boolean
  userId: string
}>()

const emit = defineEmits<{
  saveProfile: [payload: ProfileUpdatePayload]
  reload: []
}>()

const showEditProfile = defineModel<boolean>('showEditProfile', {
  required: true,
})
const showEditAddress = defineModel<boolean>('showEditAddress', {
  required: true,
})
</script>

<template>
  <div>
    <EditProfileSheet
      v-model:open="showEditProfile"
      :profile-data="rawProfile"
      :is-saving="isSaving"
      @save="emit('saveProfile', $event)"
    />

    <EditAddressSheet
      v-model:open="showEditAddress"
      :profile-data="rawProfile"
      @reload="emit('reload')"
    />
  </div>
</template>
