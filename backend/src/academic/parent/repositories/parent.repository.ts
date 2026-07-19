export { PrismaParentRepository as ParentRepository } from '../infrastructure/persistence/prisma-parent.repository.js';
export {
  ADDRESS_OMIT,
  PARENT_LIST_INCLUDE,
  PARENT_DETAIL_INCLUDE,
} from '../domain/interfaces/parent-repository.interface.js';
export type {
  ParentWithDetails,
  ParentListWithDetails,
} from '../domain/interfaces/parent-repository.interface.js';
