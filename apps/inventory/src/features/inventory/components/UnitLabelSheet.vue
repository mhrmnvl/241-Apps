<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, watchEffect } from 'vue'
import type { LabelUnit } from '../types'
import {
  CELL_PADDING_MM,
  DEFAULT_PAPER_ID,
  LABEL_HEIGHT_MM,
  LABEL_WIDTH_MM,
  NUMBER_FONT_MM,
  PAGE_MARGIN_MM,
  labelSheetLayout,
  nameFontMm,
  paginateLabels,
} from '../logic/labelSheetLayout'

const props = withDefaults(
  defineProps<{
    units: LabelUnit[]
    /** A `PAPER_SIZES` id; an unknown one falls back to A4 rather than failing. */
    paperSize?: string
  }>(),
  { paperSize: DEFAULT_PAPER_ID },
)

/**
 * The pages are worked out here, not left to the browser.
 *
 * Automatic fragmentation kept putting a label — or the cut guide beside it —
 * across a page boundary: a grid broken at whatever point the content happened
 * to reach, with `break-inside: avoid` treated as a hint. The label is one
 * known size, so the rows and columns that fit are arithmetic, and the units
 * are cut into pages before anything is rendered.
 *
 * The same numbers drive the CSS below, so what a label is drawn at and what it
 * was counted as cannot drift apart.
 */
const layout = computed(() => labelSheetLayout(props.paperSize))
const pages = computed(() =>
  paginateLabels(props.units, layout.value.labelsPerPage),
)

const sheetStyle = computed(() => ({
  '--label-cols': String(layout.value.columns),
  '--cell-w': `${layout.value.cellWidthMm}mm`,
  '--cell-h': `${layout.value.cellHeightMm}mm`,
  '--cell-pad': `${CELL_PADDING_MM}mm`,
  '--label-w': `${LABEL_WIDTH_MM}mm`,
  '--label-h': `${LABEL_HEIGHT_MM}mm`,
  '--font-number': `${NUMBER_FONT_MM}mm`,
}))

/**
 * The name is sized per label rather than once for the sheet.
 *
 * Names are all different lengths, and one size chosen for the longest wastes
 * the label of every short one — so each gets as much type as its own half of
 * the label can hold. The number stays one size for every label: those are all
 * the same length, and a column of codes at different sizes would read as a
 * mistake.
 */
function nameStyle(name: string) {
  return { fontSize: `${nameFontMm(name)}mm` }
}

/**
 * `@page` cannot read a custom property, so the paper size is written into a
 * stylesheet of its own instead.
 *
 * One element with a fixed id, rewritten in place: the size has to be in the
 * document before `window.print()` is called, and a rule left behind from a
 * previous choice would silently print the wrong paper.
 */
const PAGE_STYLE_ID = 'unit-label-page-size'

function applyPageSize() {
  const { paper } = layout.value
  let style = document.getElementById(PAGE_STYLE_ID) as HTMLStyleElement | null
  if (!style) {
    style = document.createElement('style')
    style.id = PAGE_STYLE_ID
    document.head.appendChild(style)
  }
  style.textContent =
    `@page { size: ${paper.widthMm}mm ${paper.heightMm}mm;` +
    ` margin: ${PAGE_MARGIN_MM}mm; }`
}

watchEffect(applyPageSize)

onBeforeUnmount(() => {
  document.getElementById(PAGE_STYLE_ID)?.remove()
})

async function print() {
  applyPageSize()
  await nextTick()
  window.print()
}

defineExpose({ print })
</script>

<template>
  <!--
    Teleported to <body> on purpose.

    The sheet is rendered from a view mounted deep inside the app, and print
    isolation used to be done where it sat: hide everything, show this subtree
    again, and pin it with `position: fixed` so it covered the page. A fixed box
    is laid out against a single page box and cannot break across pages, which
    is why the print used to stop after one.

    As a direct child of <body> it needs no pin: the app's other body children
    are hidden for print, and this one lays out in normal flow.
  -->
  <Teleport to="body">
    <div
      class="unit-label-print"
      :style="sheetStyle"
    >
      <!--
        One section per page, ended by an explicit break. Nothing here depends
        on the browser choosing where to divide the sheet.
      -->
      <section
        v-for="(page, index) in pages"
        :key="index"
        class="label-page"
      >
        <div class="label-grid">
          <div
            v-for="u in page"
            :key="u.id"
            class="label-cell"
          >
            <!--
              Three parts: the logo square on the left, and beside it the unit
              number above the asset name. The number goes on top and is set
              larger — it is what identifies this one unit; the name below tells
              you which cupboard you are looking at.
            -->
            <div class="label-card">
              <div class="label-logo-box">
                <img
                  src="/logo.webp"
                  alt=""
                  class="label-logo"
                />
              </div>
              <div class="label-text">
                <!--
                  The text sits in a span of its own rather than directly in
                  the row. The row is a flex container, and `text-overflow`
                  does not apply to one — the number was overrunning the edge
                  of the label instead of ending in an ellipsis.
                -->
                <div class="label-row label-number">
                  <span class="label-value">{{ u.unitNumber }}</span>
                </div>
                <div class="label-row label-name">
                  <span
                    class="label-value"
                    :style="nameStyle(u.assetName)"
                  >
                    {{ u.assetName }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<!-- Global (unscoped) so print isolation can hide the rest of the app. -->
<style>
.unit-label-print {
  display: none;
}

@media print {
  /*
    Everything the app renders into <body> goes away — the SPA root, the toast
    container, any dialog portal — leaving the teleported sheet alone on the
    page. `display: none` rather than `visibility: hidden`: a hidden box still
    occupies its space, and a hidden-but-present app is what forced the sheet to
    be pinned over the top of it.

    The `@page` rule is not here: it carries the chosen paper size, so it is
    written into its own stylesheet from the script above.
  */
  body > *:not(.unit-label-print) {
    display: none !important;
  }
  .unit-label-print {
    display: block !important;
    background: #fff;
  }

  .unit-label-print .label-page {
    page-break-after: always;
    break-after: page;
  }
  /* Or the sheet ends with a blank sheet. */
  .unit-label-print .label-page:last-child {
    page-break-after: auto;
    break-after: auto;
  }

  /*
    The cut guide is one line between two labels, not two side by side.

    Each cell draws only its right and bottom edge, and the grid draws the top
    and the left. Adjacent cells then share a single line, and the grid closes
    the outside of whichever page it is on — a border belongs to a box that is
    really there, so it breaks where the box does rather than being painted
    across a boundary the way an outline was.
  */
  .unit-label-print .label-grid {
    display: grid;
    /*
      Fixed columns, not `1fr`. A label is a physical object: stretching it to
      fill whatever paper it landed on is what made the same asset come out a
      different size on A3. Whatever is left over is shared as margin.
    */
    grid-template-columns: repeat(var(--label-cols, 3), var(--cell-w));
    justify-content: center;
    gap: 0;
    border-top: 0.15mm dashed #999;
    border-left: 0.15mm dashed #999;
  }
  .unit-label-print .label-cell {
    box-sizing: border-box;
    /* Fixed, and the same numbers the page count was worked out from. */
    width: var(--cell-w);
    height: var(--cell-h);
    padding: var(--cell-pad);
    border-right: 0.15mm dashed #999;
    border-bottom: 0.15mm dashed #999;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .unit-label-print .label-card {
    display: flex;
    align-items: stretch;
    width: var(--label-w);
    height: var(--label-h);
    border: 0.3mm solid #000;
    overflow: hidden;
    font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
    color: #000;
  }
  /*
    Square, and as tall as the label — which is what makes the label as tall as
    the logo rather than the other way round. `aspect-ratio` keeps the two
    sides equal without anyone having to state the width, so there is one
    number and nothing to keep in step.
  */
  .unit-label-print .label-logo-box {
    flex: 0 0 auto;
    height: 100%;
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.8mm;
    border-right: 0.3mm solid #000;
  }
  .unit-label-print .label-logo {
    display: block;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  /* Two halves of equal height, divided by a rule, as on the drawing. */
  .unit-label-print .label-text {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .unit-label-print .label-row {
    flex: 1 1 50%;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0.4mm 1.2mm;
    line-height: 1.15;
    overflow: hidden;
  }
  /*
    Sized from the label rather than fixed at 7pt, which was the same height of
    type on any label and lost on all of them. Width is what binds: the font is
    the text column divided by the characters it has to hold, which
    `labelSheetLayout` works out.
  */
  .unit-label-print .label-value {
    max-width: 100%;
    overflow: hidden;
  }
  .unit-label-print .label-number {
    border-bottom: 0.3mm solid #000;
    font-size: var(--font-number);
    font-weight: 700;
  }
  /* One line, always: half a unit number is worse than a truncated one. */
  .unit-label-print .label-number .label-value {
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /* Size comes from the element's own style attribute — see `nameStyle`. */
  /* Two lines: an asset name is the half of a label most likely to be long. */
  .unit-label-print .label-name .label-value {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-word;
  }
}
</style>
