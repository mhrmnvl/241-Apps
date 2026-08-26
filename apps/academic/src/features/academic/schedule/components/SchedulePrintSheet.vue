<script setup lang="ts">
import { nextTick } from 'vue'
import { FREE_PERIOD, type ScheduleSheet } from '../logic/scheduleSheet'

const props = defineProps<{ sheet: ScheduleSheet }>()

/**
 * The timetable on paper, landscape.
 *
 * Six days plus the period and the time is eight columns; on portrait A4 they
 * come out as eight slivers and the subject names wrap to three lines each.
 * The page size is stated here rather than left to the print dialog, because a
 * dialog remembers whatever it was last used for.
 */
async function print() {
  await nextTick()
  window.print()
}

defineExpose({ print })
</script>

<template>
  <!--
    Teleported to <body> on purpose.

    Print isolation hides every other child of <body> and shows this one. Doing
    it in place would need the sheet pinned over the app with `position: fixed`,
    and a fixed box is laid out against a single page box — it cannot break
    across pages, so a long timetable would print its first page and stop.
  -->
  <Teleport to="body">
    <div class="schedule-print">
      <header class="schedule-print-head">
        <h1>{{ props.sheet.title }}</h1>
        <p>{{ props.sheet.subtitle }}</p>
      </header>

      <table class="schedule-print-grid">
        <thead>
          <tr>
            <th class="col-period">Jam</th>
            <th class="col-time">Waktu</th>
            <th
              v-for="label in props.sheet.dayLabels"
              :key="label"
            >
              {{ label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in props.sheet.rows"
            :key="`${row.period}-${index}`"
            :class="{ 'is-interruption': row.isInterruption }"
          >
            <td class="col-period">{{ row.period }}</td>
            <td class="col-time">{{ row.time }}</td>
            <!--
              One cell across the week where the whole school takes the period
              together, six otherwise. `colspan` rather than six copies of the
              same word.
            -->
            <td
              v-for="(cell, cellIndex) in row.cells"
              :key="cellIndex"
              :colspan="row.spansAllDays ? props.sheet.dayLabels.length : 1"
              :class="{ 'is-taken': cell.isInterruption }"
            >
              <span
                v-if="cell.title"
                class="cell-title"
                :class="{ 'is-free': cell.title === FREE_PERIOD }"
              >
                {{ cell.title }}
              </span>
              <span
                v-if="cell.subtitle"
                class="cell-subtitle"
              >
                {{ cell.subtitle }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Teleport>
</template>

<!-- Global (unscoped) so print isolation can hide the rest of the app. -->
<style>
.schedule-print {
  display: none;
}

@media print {
  /*
    Margin zero, and the padding moved onto the sheet itself.
    
    The date, the page title and the URL running along the top and bottom of a
    print are the browser's, not ours — no stylesheet can switch them off. What
    they need is somewhere to sit, which is the page margin; with no margin,
    Chrome and Edge leave them out. The 10mm the page used to reserve is now
    the sheet's own padding, so the layout is unchanged and the furniture is
    gone.

    A reader who has "Headers and footers" ticked in the print dialog will
    still see them. That switch belongs to them.
  */
  @page {
    size: A4 landscape;
    margin: 0;
  }

  /*
    `display: none` rather than `visibility: hidden`: a hidden box still
    occupies its space, and a hidden-but-present app is what forces a sheet to
    be pinned over the top of it.
  */
  body > *:not(.schedule-print) {
    display: none !important;
  }

  .schedule-print {
    display: block !important;
    padding: 10mm;
    background: #fff;
    color: #0f172a;
    font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
  }

  .schedule-print-head {
    margin-bottom: 6mm;
    text-align: center;
  }
  .schedule-print-head h1 {
    margin: 0;
    font-size: 15pt;
    font-weight: 700;
  }
  .schedule-print-head p {
    margin: 1mm 0 0;
    font-size: 9pt;
    color: #475569;
  }

  .schedule-print-grid {
    width: 100%;
    border-collapse: collapse;
    font-size: 8pt;
  }
  .schedule-print-grid th,
  .schedule-print-grid td {
    border: 0.2mm solid #94a3b8;
    padding: 1.6mm 1.2mm;
    text-align: center;
    vertical-align: middle;
  }
  .schedule-print-grid thead th {
    background: #e2e8f0;
    font-weight: 700;
  }
  /* Repeated on every page — a timetable that spills loses its days otherwise. */
  .schedule-print-grid thead {
    display: table-header-group;
  }
  .schedule-print-grid tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .col-period {
    width: 18mm;
    font-weight: 600;
  }
  .col-time {
    width: 22mm;
    color: #475569;
    white-space: nowrap;
  }

  .is-interruption td {
    background: #fef3c7;
    color: #92400e;
    font-weight: 600;
  }
  /* A ceremony standing inside a teaching period, tinted like its own row. */
  .schedule-print-grid td.is-taken {
    background: #fef3c7;
    color: #92400e;
    font-style: italic;
  }

  .cell-title {
    display: block;
    font-weight: 600;
  }
  /* A free period is marked, not shouted about. */
  .cell-title.is-free {
    font-weight: 400;
    color: #cbd5e1;
  }
  .cell-subtitle {
    display: block;
    margin-top: 0.5mm;
    font-size: 7pt;
    color: #475569;
  }
}
</style>
