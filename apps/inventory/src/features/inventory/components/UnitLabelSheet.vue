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

  body * {
    visibility: hidden !important;
  }
  .unit-label-print,
  .unit-label-print * {
    visibility: visible !important;
  }
  .unit-label-print {
    display: block !important;
    position: fixed;
    inset: 0;
    background: #fff;
  }
  .unit-label-print .label-grid {
    display: grid;
    grid-template-columns: repeat(var(--label-cols, 3), 1fr);
    gap: 6mm;
    padding: 3mm;
    /* Cut guide: outer boundary of the whole sheet of labels. */
    outline: 0.15mm dashed #999;
  }
  .unit-label-print .label-card {
    width: 100%;
    height: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    page-break-inside: avoid;
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
