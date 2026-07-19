<script setup lang="ts">
import { Button } from '@/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { cn } from '@/shared/utils/utils'
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import { computed, ref } from 'vue'

export interface ComboboxOption {
  value: string
  label: string
}

const props = withDefaults(
  defineProps<{
    options: ComboboxOption[]
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    class?: string
    disabled?: boolean
  }>(),
  {
    placeholder: 'Pilih opsi...',
    searchPlaceholder: 'Cari...',
    emptyText: 'Tidak ditemukan.',
    class: '',
    disabled: false,
  },
)

const modelValue = defineModel<string | null>({ default: '' })

const open = ref(false)

const selectedLabel = computed(() => {
  if (!modelValue.value) return ''
  const found = props.options.find((o) => o.value === modelValue.value)
  return found?.label ?? ''
})

function onSelect(val: string) {
  modelValue.value = val === modelValue.value ? '' : val
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        :disabled="disabled"
        :class="
          cn(
            'h-9 w-full justify-between font-normal',
            !modelValue && 'text-muted-foreground',
            props.class,
          )
        "
      >
        <span class="truncate">{{ selectedLabel || placeholder }}</span>
        <ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent
      class="w-[var(--reka-popover-trigger-width)] p-0"
      align="start"
    >
      <Command>
        <CommandInput :placeholder="searchPlaceholder" />
        <CommandList>
          <CommandEmpty>{{ emptyText }}</CommandEmpty>
          <CommandGroup>
            <CommandItem
              v-for="opt in options"
              :key="opt.value"
              :value="opt.label"
              @select="onSelect(opt.value)"
            >
              {{ opt.label }}
              <Check
                :class="
                  cn(
                    'ml-auto size-4',
                    modelValue === opt.value ? 'opacity-100' : 'opacity-0',
                  )
                "
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
