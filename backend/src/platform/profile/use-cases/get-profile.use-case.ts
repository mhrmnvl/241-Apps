import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../repositories/profile.repository.js';

@Injectable()
export class GetProfileUseCase {
  constructor(private readonly repo: ProfileRepository) {}

  async execute(userId: string) {
    const user = await this.repo.findDetailByUserId(userId);

    if (!user?.profile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    }

    return user;
  }
}
