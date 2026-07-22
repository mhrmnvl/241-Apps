<script setup lang="ts">
import { onMounted } from 'vue'
import AcademicCalendarDialog from '../components/AcademicCalendarDialog.vue'
import AcademicCalendarGridView from '../components/AcademicCalendarGridView.vue'
import AcademicCalendarTableView from '../components/AcademicCalendarTableView.vue'
import AcademicCalendarSidebar from '../components/AcademicCalendarSidebar.vue'
import { useAcademicCalendarView } from '../composables/useAcademicCalendarView'
import AppLayout from '@/layouts/AppLayout.vue'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { Plus } from 'lucide-vue-next'
import '../styles/calendar.css'

const breadcrumbs = [
  { title: 'Akademik', href: '#' },
  { title: 'Kalender Pendidikan' },
]

const {
  events,
  isLoading,
  tableEvents,
  tableLoading,
  isDeletingBulk,
  currentRange,
  fetchEvents,
  handleUpdateFilters,
  activeTab,
  canManageCalendar,
  sheetOpen,
  sheetEventData,
  selectedDate,
  tableViewRef,
  todayEvents,
  upcomingEvents,
  isSavingEvent,
  openCreateDialog,
  handleDateClick,
  handleEventClick,
  openEditSheet,
  handleDeleteBulk,
  handleSaveEvent,
  handleDeleteEvent,
  handleSavedOrDeleted,
} = useAcademicCalendarView()

onMounted(() => {
  void tableViewRef
  void canManageCalendar
  if (currentRange.value.start && currentRange.value.end) {
    void fetchEvents(currentRange.value)
  }
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
        >
          <div>
            <CardTitle class="text-2xl font-bold tracking-tight">
              Kalender Akademik
            </CardTitle>
          </div>
          <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <Button
              v-if="canManageCalendar"
              class="w-full sm:w-auto"
              @click="openCreateDialog"
            >
              <Plus class="size-4 mr-2" />
              Tambah Agenda
            </Button>
          </div>
        </CardHeader>

        <Tabs
          v-model="activeTab"
          class="w-full"
        >
          <div class="px-6 pt-2 border-b bg-muted/10">
            <TabsList class="h-auto rounded-none bg-transparent p-0">
              <TabsTrigger
                value="calendar"
                class="rounded-b-none border border-transparent border-b-0 px-4 py-2 data-[state=active]:-mb-px data-[state=active]:z-10 data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:shadow-none"
              >
                Tampilan Kalender
              </TabsTrigger>
              <TabsTrigger
                v-if="canManageCalendar"
                value="tabel"
                class="rounded-b-none border border-transparent border-b-0 px-4 py-2 data-[state=active]:-mb-px data-[state=active]:z-10 data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:shadow-none"
              >
                Manajemen Data
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="calendar"
            class="m-0 border-none outline-none focus-visible:ring-0 w-full"
          >
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
              <div class="lg:col-span-1">
                <AcademicCalendarSidebar
                  :today-events="todayEvents"
                  :upcoming-events="upcomingEvents"
                  @event-click="handleEventClick"
                />
              </div>

              <div
                class="lg:col-span-3 bg-background rounded-2xl border shadow-sm p-4 md:p-6"
              >
                <AcademicCalendarGridView
                  :events="events"
                  :is-loading="isLoading"
                  @date-click="handleDateClick"
                  @event-click="handleEventClick"
                  @fetch-events="fetchEvents"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="tabel"
            class="m-0 border-none outline-none focus-visible:ring-0 w-full bg-background rounded-b-2xl"
          >
            <AcademicCalendarTableView
              ref="tableViewRef"
              :table-events="tableEvents"
              :is-loading="tableLoading"
              :is-deleting-bulk="isDeletingBulk"
              :show-actions="canManageCalendar"
              @update-filters="handleUpdateFilters"
              @delete-bulk="handleDeleteBulk"
              @edit="openEditSheet"
              @deleted="handleSavedOrDeleted"
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>

    <AcademicCalendarDialog
      v-if="canManageCalendar"
      :open="sheetOpen"
      :event-data="sheetEventData"
      :selected-date="selectedDate"
      :is-saving="isSavingEvent"
      @update:open="sheetOpen = $event"
      @saved="handleSaveEvent"
      @deleted="handleDeleteEvent"
    />
  </AppLayout>
</template>
