<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Badge } from '@/ui/badge'
import { POST_TYPE_SLUGS, type PostSummary } from '../types'

const props = defineProps<{ post: PostSummary }>()

const to = computed(
  () => `/${POST_TYPE_SLUGS[props.post.type]}/${props.post.slug}`,
)

const publishedLabel = computed(() =>
  new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(props.post.publishedAt)),
)
</script>

<template>
  <RouterLink
    :to="to"
    class="group flex flex-col overflow-hidden rounded-lg border transition-colors hover:border-primary/50"
  >
    <div class="aspect-[16/9] overflow-hidden bg-muted">
      <img
        v-if="post.coverImageUrl"
        :src="post.coverImageUrl"
        :alt="post.coverAltText ?? ''"
        loading="lazy"
        class="h-full w-full object-cover transition-transform group-hover:scale-105"
      />
    </div>

    <div class="flex flex-1 flex-col gap-2 p-4">
      <div class="flex items-center gap-2">
        <Badge
          v-if="post.category"
          variant="secondary"
        >
          {{ post.category.name }}
        </Badge>
        <span class="text-xs text-muted-foreground">{{ publishedLabel }}</span>
      </div>

      <h3 class="font-semibold leading-snug group-hover:text-primary">
        {{ post.title }}
      </h3>

      <p class="line-clamp-3 text-sm text-muted-foreground">
        {{ post.summary }}
      </p>
    </div>
  </RouterLink>
</template>
