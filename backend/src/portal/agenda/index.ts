// Public API of the agenda module. The Module class and DTOs are imported
// directly by consumers — a DTO importing this barrel would close an ESM cycle
// and crash boot (NESTJS-RULES.md).
export { IAgendaRepository } from './domain/interfaces/agenda-repository.interface.js';
export { GetPublicAgendaUseCase } from './use-cases/get-public-agenda.use-case.js';
export { toPublicAgenda } from './infrastructure/mappers/agenda.mapper.js';
export type {
  AgendaEntryRow,
  AgendaScope,
  PublicAgendaQueryInput,
} from './domain/interfaces/agenda-repository.interface.js';
