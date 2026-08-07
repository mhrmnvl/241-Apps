// Public API of the post module. Never import the Module class or a DTO through
// this barrel from another module — that closes an ESM cycle and crashes boot.
export * from './domain/enums/post-type.enum.js';
export * from './domain/enums/content-status.enum.js';
export * from './domain/entities/post.entity.js';
export { IPostRepository } from './domain/interfaces/post-repository.interface.js';
export type {
  PostWithDetails,
  PublicPostQueryInput,
} from './domain/interfaces/post-repository.interface.js';
