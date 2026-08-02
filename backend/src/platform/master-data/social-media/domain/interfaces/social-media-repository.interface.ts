import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../../shared/domain/interfaces/repository.interface.js';
import { SocialMediaEntity } from '../entities/social-media.entity.js';

export interface SocialMediaQueryInput extends PaginationQueryInput {
  search?: string;
}

export interface CreateSocialMediaRepositoryInput {
  name: string;
  baseUrl: string;
}

export type UpdateSocialMediaRepositoryInput =
  Partial<CreateSocialMediaRepositoryInput>;

export abstract class ISocialMediaRepository {
  abstract findAll(
    query: SocialMediaQueryInput,
  ): Promise<PaginatedResult<SocialMediaEntity>>;

  abstract findById(id: string): Promise<SocialMediaEntity | null>;

  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<SocialMediaEntity | null>;

  abstract findByCode(
    code: string,
    excludeId?: string,
  ): Promise<SocialMediaEntity | null>;

  abstract create(
    input: CreateSocialMediaRepositoryInput,
  ): Promise<SocialMediaEntity>;

  abstract update(
    id: string,
    input: UpdateSocialMediaRepositoryInput,
  ): Promise<SocialMediaEntity>;

  abstract remove(id: string): Promise<SocialMediaEntity>;
}
