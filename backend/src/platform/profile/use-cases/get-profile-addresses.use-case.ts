import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../index.js';
import { ProfileAddressRepository } from '../repositories/profile-address.repository.js';

@Injectable()
export class GetProfileAddressesUseCase {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly addressRepository: ProfileAddressRepository,
  ) {}

  async execute(userId: string) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile)
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    return this.addressRepository.findAllByUserId(userId);
  }
}
