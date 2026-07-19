import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateSocialMediaDto } from '../dto/create-social-media.dto.js';
import { ISocialMediaRepository } from '../interfaces/social-media-repository.interface.js';

@Injectable()
export class CreateSocialMediaService {
  private readonly logger = new Logger(CreateSocialMediaService.name);

  constructor(private readonly repo: ISocialMediaRepository) {}

  async execute(dto: CreateSocialMediaDto) {
    const existing = await this.repo.findByName(dto.name);
    if (existing)
      throw new ConflictException(`Platform "${dto.name}" already exists`);

    const platform = await this.repo.create(dto);
    this.logger.log(`Platform created: ${platform.name}`);
    return platform;
  }
}
