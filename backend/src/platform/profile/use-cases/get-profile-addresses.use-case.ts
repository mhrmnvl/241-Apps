import { Injectable, NotFoundException } from '@nestjs/common';
import { IProfileRepository } from '../index.js';
import { IProfileAddressRepository } from '../domain/interfaces/profile-address-repository.interface.js';

@Injectable()
export class GetProfileAddressesUseCase {
  constructor(
    private readonly profileRepository: IProfileRepository,
    private readonly addressRepository: IProfileAddressRepository,
  ) {}

  async execute(userId: string) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile)
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    return this.addressRepository.findAllByUserId(userId);
  }
}
