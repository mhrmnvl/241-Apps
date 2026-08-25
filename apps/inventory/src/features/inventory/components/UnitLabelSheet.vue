<script setup lang="ts">
import { nextTick } from 'vue'
import QRCode from 'qrcode'
import type { LabelUnit } from '../types'

// columns = how many labels per row on the A4 sheet (more = smaller labels).
const props = withDefaults(
  defineProps<{
    units: LabelUnit[]
    columns?: number
  }>(),
  { columns: 3 },
)

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
    isolation used to be done where it sat: hide everything with
    `visibility: hidden`, show this subtree again, and pin it with
    `position: fixed; inset: 0` so it covered the page instead of sitting
    wherever the page happened to be scrolled to.

    That pin is what limited the print to one page. A fixed box is laid out
    against a single page box and cannot break across pages, so every label
    past the first page's worth was clipped — silently, and only when enough
    were selected to need a second page.

    As a direct child of <body> it needs no pin: the app's other body children
    are hidden for print, and this one lays out in normal flow and paginates
    the way any long document does.
  -->
  <Teleport to="body">
    <div class="unit-label-print">
      <div
        class="label-grid"
        :style="{ '--label-cols': String(columns) }"
      >
        <table
          v-for="u in units"
          :key="u.id"
          class="label-card"
        >
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
  </Teleport>
</template>

<!-- Global (unscoped) so print isolation can hide the rest of the app. -->
<style>
.unit-label-print {
  display: none;
}

@media print {
  @page {
    size: A4;
    margin: 8mm;
  }

  /*
    Everything the app renders into <body> goes away — the SPA root, the toast
    container, any dialog portal — leaving the teleported sheet as the only
    thing on the page.

    `display: none` rather than `visibility: hidden`: hidden boxes still take
    up their space, and a hidden app is what forced the sheet to be pinned over
    the top of it in the first place.
  */
  body > *:not(.unit-label-print) {
    display: none !important;
  }
  .unit-label-print {
    display: block !important;
    background: #fff;
  }
  .unit-label-print .label-grid {
    display: grid;
    grid-template-columns: repeat(var(--label-cols, 3), 1fr);
    gap: 6mm;
    padding: 3mm;
  }
  .unit-label-print .label-card {
    width: 100%;
    height: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    /* A label split down the middle by a page boundary is a wasted label. */
    page-break-inside: avoid;
    break-inside: avoid;
    /* Cut guide: dashed line in the middle of the gap between labels. */
    outline: 0.15mm dashed #999;
    outline-offset: 3mm;
    font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
  }
  .unit-label-print .label-card td {
    border: 1px solid #000;
    overflow: hidden;
  }
  .unit-label-print .label-logo-cell,
  .unit-label-print .label-qr-cell {
    width: 11mm;
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
