import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IProfileRepository } from '../index.js';
import { IProfileAddressRepository } from '../domain/interfaces/profile-address-repository.interface.js';

@Injectable()
export class RemoveProfileAddressUseCase {
  private readonly logger = new Logger(RemoveProfileAddressUseCase.name);

  constructor(
    private readonly profileRepository: IProfileRepository,
    private readonly addressRepository: IProfileAddressRepository,
  ) {}

  async execute(userId: string, addressId: string): Promise<void> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile)
      throw new NotFoundException(`Profile for user ID ${userId} not found`);

    const address = await this.addressRepository.findAddressForUser(
      addressId,
      userId,
    );
    if (!address)
      throw new NotFoundException(
        `Address with ID ${addressId} not found for this profile`,
      );

    await this.addressRepository.remove(addressId);
    this.logger.log(`Address ${addressId} removed for user ${userId}`);
  }
}
