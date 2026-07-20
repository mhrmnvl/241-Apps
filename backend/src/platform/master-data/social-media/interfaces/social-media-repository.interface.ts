import { SocialMedia } from '@prisma/client';
import { CreateSocialMediaDto } from '../dto/request/create-social-media.dto.js';
import { UpdateSocialMediaDto } from '../dto/request/update-social-media.dto.js';

export abstract class ISocialMediaRepository {
  abstract findAll(params: { skip: number; take: number }): Promise<{
    data: SocialMedia[];
    total: number;
  }>;

  abstract findById(id: string): Promise<SocialMedia | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<SocialMedia | null>;

  abstract create(dto: CreateSocialMediaDto): Promise<SocialMedia>;
  abstract update(id: string, dto: UpdateSocialMediaDto): Promise<SocialMedia>;
  abstract remove(id: string): Promise<SocialMedia>;
}
