// Public API of the agenda feature. Everything the app consumes goes through
// here — never a deep import into views/, api/, or stores/.
export { portalAgendaRoutes, portalPublicAgendaRoutes } from './routes'
export { agendaService } from './services/agendaService'
export { useAgendaStore } from './stores/agendaStore'
export { default as AgendaCard } from './components/AgendaCard.vue'
export * from './types'
