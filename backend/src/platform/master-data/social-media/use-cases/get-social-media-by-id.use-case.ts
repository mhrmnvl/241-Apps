import { Injectable, NotFoundException } from '@nestjs/common';
import { ISocialMediaRepository } from '../interfaces/social-media-repository.interface.js';

@Injectable()
export class GetSocialMediaByIdUseCase {
  constructor(private readonly repo: ISocialMediaRepository) {}

  async execute(id: string) {
    const platform = await this.repo.findById(id);
    if (!platform)
      throw new NotFoundException(`Platform with ID ${id} not found`);
    return platform;
  }
}
