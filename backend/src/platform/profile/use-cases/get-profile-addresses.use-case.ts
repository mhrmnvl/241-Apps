import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../index.js';
import { ProfileAddressRepository } from '../repositories/profile-address.repository.js';

@Injectable()
export class GetProfileAddressesUseCase {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly addressRepo: ProfileAddressRepository,
  ) {}

  async execute(userId: string) {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile)
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    return this.addressRepo.findAllByUserId(userId);
  }
}
