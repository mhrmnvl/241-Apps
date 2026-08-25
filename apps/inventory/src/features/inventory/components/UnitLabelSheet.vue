<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, watchEffect } from 'vue'
import QRCode from 'qrcode'
import type { LabelUnit } from '../types'
import {
  DEFAULT_PAPER_ID,
  PAGE_MARGIN_MM,
  labelSheetLayout,
  paginateLabels,
} from '../logic/labelSheetLayout'

const props = withDefaults(
  defineProps<{
    units: LabelUnit[]
    /** How many labels per row. What a paper can take is `columnChoicesFor`. */
    columns?: number
    /** A `PAPER_SIZES` id; an unknown one falls back to A4 rather than failing. */
    paperSize?: string
  }>(),
  { columns: 3, paperSize: DEFAULT_PAPER_ID },
)

/**
 * The pages are worked out here, not left to the browser.
 *
 * Automatic fragmentation kept putting a label — or the dashed guide beside it
 * — across a page boundary: a grid broken at whatever point the content
 * happened to reach, with `break-inside: avoid` treated as a hint. Every label
 * is now a known height, so the number of rows that fit is arithmetic, and the
 * units are cut into pages before anything is rendered.
 *
 * The same numbers drive the CSS below, so the height a label is drawn at and
 * the count used to chunk them cannot drift apart.
 */
const layout = computed(() => labelSheetLayout(props.paperSize, props.columns))
const pages = computed(() =>
  paginateLabels(props.units, layout.value.labelsPerPage),
)

const sheetStyle = computed(() => ({
  '--label-cols': String(layout.value.columns),
  '--label-h': `${layout.value.labelHeightMm}mm`,
  '--cell-h': `${layout.value.cellHeightMm}mm`,
  '--label-square': `${layout.value.squareMm}mm`,
}))

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

async function renderQrs() {
  await Promise.all(
    props.units.map(async (u) => {
      const el = document.getElementById(`unit-qr-${u.id}`)
      if (!el) return
      try {
        // SVG scales crisply to the label size regardless of printer DPI.
        const code =
          u.barcode && u.barcode.length > 0 ? u.barcode : u.unitNumber
        el.innerHTML = await QRCode.toString(code, {
          type: 'svg',
          margin: 0,
          errorCorrectionLevel: 'M',
        })
      } catch {
        // ignore content that can't be encoded
      }
    }),
  )
}

async function print() {
  applyPageSize()
  await nextTick()
  await renderQrs()
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
          <!--
            The cut guide is a border on this cell, not an outline on the table
            inside it. An outline is painted rather than laid out — it takes no
            space and no page break is decided around it, so the guide could be
            drawn past a boundary the browser had already chosen. A border
            belongs to a box that is really there.
          -->
          <div
            v-for="u in page"
            :key="u.id"
            class="label-cell"
          >
            <table class="label-card">
              <tbody>
                <tr>
                  <td
                    class="label-logo-cell"
                    rowspan="2"
                  >
                    <img
                      src="/logo.webp"
                      alt=""
                      class="label-logo"
                    />
                  </td>
                  <td class="label-number-cell">{{ u.unitNumber }}</td>
                  <td
                    class="label-qr-cell"
                    rowspan="2"
                  >
                    <div
                      :id="`unit-qr-${u.id}`"
                      class="label-qr"
                    ></div>
                  </td>
                </tr>
                <tr>
                  <td class="label-name-cell">{{ u.assetName }}</td>
                </tr>
              </tbody>
            </table>
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

  .unit-label-print .label-grid {
    display: grid;
    grid-template-columns: repeat(var(--label-cols, 3), 1fr);
    /*
      No gap. The 6mm that used to separate two labels is 3mm of padding inside
      each of their cells, so the guide sits where the gap was and the cells
      tile edge to edge — which is what lets the dashes run unbroken along a row
      instead of restarting at every label.
    */
    gap: 0;
  }
  .unit-label-print .label-cell {
    box-sizing: border-box;
    /* Fixed, and the same number the page count was worked out from. */
    height: var(--cell-h);
    padding: 3mm;
    /* Cut guide. Adjacent cells each draw their own, so the line between two
       labels is two hairlines; at 0.15mm that is what a guillotine sits on. */
    border: 0.15mm dashed #999;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .unit-label-print .label-card {
    width: 100%;
    height: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
  }
  .unit-label-print .label-card td {
    border: 1px solid #000;
    overflow: hidden;
  }
  /*
    Square, and as large as the label is tall — but capped so that on a narrow
    label the two of them cannot crowd out the text between them. Both numbers
    come from `labelSheetLayout`.
  */
  .unit-label-print .label-logo-cell,
  .unit-label-print .label-qr-cell {
    width: var(--label-square);
    text-align: center;
    vertical-align: middle;
    padding: 1.2mm;
  }
  .unit-label-print .label-logo {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    margin: 0 auto;
  }
  .unit-label-print .label-qr {
    width: 100%;
    height: 100%;
  }
  .unit-label-print .label-qr svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  .unit-label-print .label-number-cell,
  .unit-label-print .label-name-cell {
    text-align: center;
    vertical-align: middle;
    padding: 1mm 1.5mm;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #000;
  }
  .unit-label-print .label-number-cell {
    font-size: 7pt;
    font-weight: 700;
  }
  .unit-label-print .label-name-cell {
    font-size: 6.5pt;
  }
}
</style>
