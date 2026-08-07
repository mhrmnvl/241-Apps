<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '@/ui/sonner'
</script>

<template>
  <router-view />
  <Toaster
    rich-colors
    position="bottom-right"
  />
</template>
