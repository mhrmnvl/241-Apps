<script setup lang="ts">
import { authConfig } from '../config'
import AuthLogo from './AuthLogo.vue'
</script>

<template>
  <div
    class="relative hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-8"
  >
    <picture class="absolute inset-0">
      <source
        srcset="/bg.webp"
        type="image/webp"
      />
      <img
        src="/bg.png"
        alt=""
        class="h-full w-full object-cover"
      />
    </picture>
    <div class="absolute inset-0 bg-black/75" />
    <div
      class="relative z-10 flex flex-col items-center gap-6 px-12 text-center"
    >
      <AuthLogo size="lg" />
      <h2
        class="text-4xl font-extrabold tracking-tight text-white drop-shadow-md"
      >
        {{ authConfig.appTitle }}
      </h2>
      <div class="flex items-center gap-3">
        <span class="h-px w-12 bg-[#b49b50]" />
        <p
          class="text-sm font-semibold tracking-widest text-[#b49b50] uppercase"
        >
          {{ authConfig.appSubtitle }}
        </p>
        <span class="h-px w-12 bg-[#b49b50]" />
      </div>
      <p
        class="max-w-md text-base leading-relaxed text-white/70 italic text-balance"
      >
        "Membentuk Insan Ulul Albaab, Tafaqquh Fiddin, Waladan Sholihan, serta
        Kader Ulama dan Zu'ama Masa Depan"
      </p>
    </div>
  </div>
</template>
