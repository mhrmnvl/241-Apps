import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateSocialMediaDto } from '../dto/request/update-social-media.dto.js';
import { ISocialMediaRepository } from '../interfaces/social-media-repository.interface.js';

@Injectable()
export class UpdateSocialMediaUseCase {
  private readonly logger = new Logger(UpdateSocialMediaUseCase.name);

  constructor(private readonly repo: ISocialMediaRepository) {}

  async execute(id: string, dto: UpdateSocialMediaDto) {
    const existing = await this.repo.findById(id);
    if (!existing)
      throw new NotFoundException(`Platform with ID ${id} not found`);

    if (dto.name) {
      const duplicate = await this.repo.findByName(dto.name, id);
      if (duplicate)
        throw new ConflictException(`Platform "${dto.name}" already exists`);
    }

    const platform = await this.repo.update(id, dto);
    this.logger.log(`Platform updated: ${platform.name}`);
    return platform;
  }
}
