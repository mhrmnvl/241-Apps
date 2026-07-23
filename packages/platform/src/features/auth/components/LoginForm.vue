<script setup lang="ts">
import { computed } from 'vue'
import { useLoginForm } from '../composables/useLoginForm'
import { cn } from '@/shared/utils/utils'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'

import { authConfig } from '../config'
import { useSettingsStore } from '../../settings/stores/settingsStore'

const props = defineProps<{
  class?: string
}>()

const { isSubmitting, errorMessage, onSubmit } = useLoginForm()

const settingsStore = useSettingsStore()
const loginTitle = computed(
  () => settingsStore.settings?.loginTitle ?? authConfig.value.loginTitle,
)
</script>

<template>
  <form
    :class="cn('flex flex-col gap-6', props.class)"
    @submit.prevent="onSubmit"
  >
    <div class="flex flex-col gap-6">
      <div class="flex flex-col items-center gap-1 text-center">
        <h1 class="text-2xl font-bold">{{ loginTitle }}</h1>
        <p class="text-muted-foreground text-sm text-balance">
          Masukkan kredensial Anda untuk melanjutkan
        </p>
      </div>
      <FormField
        v-slot="{ componentField }"
        name="identifier"
      >
        <FormItem>
          <FormLabel for="identifier"> ID Pengguna </FormLabel>
          <FormControl>
            <Input
              id="identifier"
              type="text"
              placeholder="NIS / NIP / No. HP / Username"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField
        v-slot="{ componentField }"
        name="password"
      >
        <FormItem>
          <FormLabel for="password"> Password </FormLabel>
          <FormControl>
            <Input
              id="password"
              type="password"
              placeholder="Kata sandi"
              v-bind="componentField"
            />
          </FormControl>
          <div class="flex justify-end mt-1">
            <router-link
              to="/forgot-password"
              class="text-xs text-primary font-semibold hover:underline"
            >
              Lupa Password?
            </router-link>
          </div>
          <FormMessage />
        </FormItem>
      </FormField>
      <Button
        type="submit"
        :disabled="isSubmitting"
        class="w-full cursor-pointer"
      >
        {{ isSubmitting ? 'Memproses...' : 'Masuk' }}
      </Button>
      <p
        v-if="errorMessage"
        class="text-center text-sm text-destructive"
      >
        {{ errorMessage }}
      </p>
    </div>
  </form>
</template>
