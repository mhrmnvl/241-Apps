import { ref, type Ref } from 'vue'

export function useDynamicEntryList<T>(factory: (index: number) => T) {
  const items: Ref<T[]> = ref([])

  function addItem() {
    items.value.push(factory(items.value.length))
  }

  function removeItem(index: number) {
    items.value.splice(index, 1)
  }

  return { items, addItem, removeItem }
}
