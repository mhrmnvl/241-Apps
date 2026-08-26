import { nextTick, watch, type Ref } from 'vue'

/** The app shell scrolls an inner element, not the document. */
function scrollableAncestor(from: HTMLElement | null): HTMLElement | null {
  let node = from?.parentElement ?? null
  while (node) {
    const { overflowY } = getComputedStyle(node)
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      node.scrollHeight > node.clientHeight
    ) {
      return node
    }
    node = node.parentElement
  }
  return null
}

/**
 * Hold the page still while a dialog is open.
 *
 * Opening one lets Reka lock the body — `overflow: hidden`, plus a
 * `padding-right` the width of the scrollbar it just removed. That is a change
 * of viewport width, and FullCalendar listens for exactly that: it re-lays the
 * month grid, the page briefly gets shorter, and the browser clamps the scroll
 * position of whatever was scrolling. Closing the dialog undoes the padding and
 * re-lays it again, by which point the position is already lost. Somebody
 * reading December has to scroll back down after every event they open.
 *
 * The position is taken when the dialog opens and put back once it has closed
 * and the grid has settled. It is deliberately not a fix to the lock itself:
 * the scroll container here is the shell's inner element, and Reka only ever
 * touches `document.body`.
 */
export function usePreservedScroll(
  isOpen: Ref<boolean>,
  anchor: Ref<HTMLElement | null>,
) {
  let container: HTMLElement | null = null
  let offset = 0

  watch(isOpen, async (open) => {
    if (open) {
      container = scrollableAncestor(anchor.value)
      offset = container?.scrollTop ?? 0
      return
    }

    if (!container) return

    // Two ticks: one for the dialog to unmount and the body styles to come
    // off, one for the grid to finish re-laying itself out. Restoring before
    // that puts the position back and then loses it again.
    await nextTick()
    requestAnimationFrame(() => {
      if (container) container.scrollTop = offset
    })
  })
}
