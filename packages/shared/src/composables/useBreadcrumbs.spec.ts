import { describe, it, expect } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import type { Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { provideBreadcrumbs, useBreadcrumbs } from './useBreadcrumbs'
import type { BreadcrumbItemType } from '../types/breadcrumb.types'

type Trail = BreadcrumbItemType[] | null

/** Stands in for the app shell: provides the override and exposes it. */
function makeShell() {
  let override: Ref<Trail> | null = null

  const Shell = defineComponent({
    props: { showA: { type: Boolean, default: true }, showB: Boolean },
    setup(props, { slots }) {
      override = provideBreadcrumbs()
      return () => h('div', slots.default?.({ ...props }))
    },
  })

  return { Shell, read: () => override?.value ?? null }
}

/** Stands in for a view whose trail depends on something it loaded. */
const View = defineComponent({
  props: { label: { type: String, required: true } },
  setup(props) {
    useBreadcrumbs(() => [{ title: props.label }])
    return () => h('p', props.label)
  },
})

describe('useBreadcrumbs', () => {
  it('publishes a view trail to the shell', () => {
    const { Shell, read } = makeShell()
    mount(Shell, { slots: { default: () => h(View, { label: 'Kelas 7A' }) } })
    expect(read()).toEqual([{ title: 'Kelas 7A' }])
  })

  it('follows the trail as the view resolves its data', async () => {
    const { Shell, read } = makeShell()
    const name = ref('Memuat')
    const Live = defineComponent({
      setup() {
        useBreadcrumbs(() => [{ title: name.value }])
        return () => h('p')
      },
    })

    mount(Shell, { slots: { default: () => h(Live) } })
    expect(read()).toEqual([{ title: 'Memuat' }])

    name.value = 'Kurikulum Merdeka'
    await Promise.resolve()
    expect(read()).toEqual([{ title: 'Kurikulum Merdeka' }])
  })

  it('drops the trail when the view goes away', () => {
    const { Shell, read } = makeShell()
    const wrapper = mount(Shell, {
      slots: { default: () => h(View, { label: 'Kelas 7A' }) },
    })
    expect(read()).not.toBeNull()

    wrapper.unmount()
    expect(read()).toBeNull()
  })

  it('does not wipe a trail the next view has already set', async () => {
    // Vue may mount the incoming view before unmounting the outgoing one. A
    // blind reset on teardown would clear the new view's trail, leaving the
    // shell blank until something else happened to update it.
    const { Shell, read } = makeShell()
    const showOld = ref(true)
    const showNew = ref(false)

    const wrapper = mount(Shell, {
      slots: {
        default: () => [
          showOld.value ? h(View, { label: 'Lama', key: 'old' }) : null,
          showNew.value ? h(View, { label: 'Baru', key: 'new' }) : null,
        ],
      },
    })
    expect(read()).toEqual([{ title: 'Lama' }])

    showNew.value = true
    await wrapper.vm.$nextTick()
    expect(read()).toEqual([{ title: 'Baru' }])

    showOld.value = false
    await wrapper.vm.$nextTick()
    expect(read()).toEqual([{ title: 'Baru' }])
  })

  it('is inert when rendered outside a shell', () => {
    // A route deliberately placed outside the layout, or a test harness: there
    // is nothing rendering a trail, so publishing one must not throw.
    expect(() =>
      mount(
        defineComponent({
          setup() {
            useBreadcrumbs(() => [{ title: 'Tanpa shell' }])
            return () => h('p')
          },
        }),
      ),
    ).not.toThrow()
  })
})
