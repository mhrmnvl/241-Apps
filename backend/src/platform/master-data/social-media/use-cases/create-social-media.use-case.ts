import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateSocialMediaDto } from '../dto/request/create-social-media.dto.js';
import { ISocialMediaRepository } from '../domain/interfaces/social-media-repository.interface.js';

@Injectable()
export class CreateSocialMediaUseCase {
  private readonly logger = new Logger(CreateSocialMediaUseCase.name);

  constructor(private readonly socialMediaRepository: ISocialMediaRepository) {}

  async execute(dto: CreateSocialMediaDto) {
    const existing = await this.socialMediaRepository.findByName(dto.name);
    if (existing)
      throw new ConflictException(`Platform "${dto.name}" already exists`);

    const platform = await this.socialMediaRepository.create({
      name: dto.name,
      baseUrl: dto.baseUrl,
    });
    this.logger.log(`Platform created: ${platform.name}`);
    return platform;
  }
}
