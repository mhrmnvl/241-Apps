import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateSocialMediaDto } from '../dto/request/update-social-media.dto.js';
import { ISocialMediaRepository } from '../domain/interfaces/social-media-repository.interface.js';

@Injectable()
export class UpdateSocialMediaUseCase {
  private readonly logger = new Logger(UpdateSocialMediaUseCase.name);

  constructor(private readonly socialMediaRepository: ISocialMediaRepository) {}

  async execute(id: string, dto: UpdateSocialMediaDto) {
    const existing = await this.socialMediaRepository.findById(id);
    if (!existing)
      throw new NotFoundException(`Platform with ID ${id} not found`);

    if (dto.name) {
      const duplicate = await this.socialMediaRepository.findByName(
        dto.name,
        id,
      );
      if (duplicate)
        throw new ConflictException(`Platform "${dto.name}" already exists`);
    }

    const platform = await this.socialMediaRepository.update(id, {
      name: dto.name,
      baseUrl: dto.baseUrl,
    });
    this.logger.log(`Platform updated: ${platform.name}`);
    return platform;
  }
}
