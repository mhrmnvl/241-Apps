// Public API of the page module. The Module class and DTOs are imported
// directly by consumers — a DTO importing this barrel would close an ESM cycle
// and crash boot (NESTJS-RULES.md).
export { IPageRepository } from './domain/interfaces/page-repository.interface.js';
export { INavigationRepository } from './domain/interfaces/navigation-repository.interface.js';
export { GetPublicPageUseCase } from './use-cases/get-public-page.use-case.js';
export type { PortalPageEntity } from './domain/interfaces/page-repository.interface.js';
export type { PublicNavItem } from './domain/interfaces/navigation-repository.interface.js';
