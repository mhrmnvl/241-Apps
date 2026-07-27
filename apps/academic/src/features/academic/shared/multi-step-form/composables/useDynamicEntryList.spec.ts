import { describe, it, expect } from 'vitest'
import { useDynamicEntryList } from './useDynamicEntryList'

interface Entry {
  name: string
  isPrimary: boolean
}

describe('useDynamicEntryList', () => {
  it('starts empty', () => {
    const { items } = useDynamicEntryList<Entry>((index) => ({
      name: '',
      isPrimary: index === 0,
    }))
    expect(items.value).toEqual([])
  })

  it('adds an item built from the factory', () => {
    const { items, addItem } = useDynamicEntryList<Entry>((index) => ({
      name: '',
      isPrimary: index === 0,
    }))
    addItem()
    expect(items.value).toEqual([{ name: '', isPrimary: true }])
  })

  it('passes the current length as the index, so only the first item is primary', () => {
    const { items, addItem } = useDynamicEntryList<Entry>((index) => ({
      name: '',
      isPrimary: index === 0,
    }))
    addItem()
    addItem()
    addItem()
    expect(items.value).toEqual([
      { name: '', isPrimary: true },
      { name: '', isPrimary: false },
      { name: '', isPrimary: false },
    ])
  })

  it('removes an item by index', () => {
    const { items, addItem, removeItem } = useDynamicEntryList<Entry>(
      (index) => ({ name: `entry-${index}`, isPrimary: false }),
    )
    addItem()
    addItem()
    addItem()
    removeItem(1)
    expect(items.value.map((i) => i.name)).toEqual(['entry-0', 'entry-2'])
  })
})
