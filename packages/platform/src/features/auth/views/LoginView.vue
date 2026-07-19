<script setup lang="ts">
import { authConfig } from '../config'
import AuthLogo from '../components/AuthLogo.vue'
import LoginForm from '../components/LoginForm.vue'
import LoginHero from '../components/LoginHero.vue'
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col gap-4 bg-muted/50 p-6 md:p-10">
      <div class="hidden justify-center gap-2 lg:flex lg:justify-start">
        <a
          href="#"
          class="flex items-center gap-2.5 font-semibold text-lg tracking-tight"
        >
          <AuthLogo size="sm" />
          <span>{{ authConfig.appTitle }}</span>
        </a>
      </div>
      <div class="flex flex-1 flex-col items-center justify-center gap-6">
        <div class="flex flex-col items-center gap-3 lg:hidden">
          <AuthLogo size="md" />
          <h1 class="text-xl font-bold tracking-tight">
            {{ authConfig.appTitle }}
          </h1>
        </div>
        <div class="w-full max-w-sm rounded-xl border bg-card p-8 shadow-lg">
          <LoginForm />
        </div>
      </div>
    </div>
    <LoginHero />
  </div>
</template>
