import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateAddressDto } from '../../../shared/dto/address.dto.js';
import { IProfileRepository } from '../index.js';
import { IProfileAddressRepository } from '../domain/interfaces/profile-address-repository.interface.js';

@Injectable()
export class UpdateProfileAddressUseCase {
  private readonly logger = new Logger(UpdateProfileAddressUseCase.name);

  constructor(
    private readonly profileRepository: IProfileRepository,
    private readonly addressRepository: IProfileAddressRepository,
  ) {}

  async execute(userId: string, addressId: string, dto: UpdateAddressDto) {
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

    if (dto.isPrimary) {
      if (address.studentId)
        await this.addressRepository.clearPrimaryForStudentExclude(
          address.studentId,
          addressId,
        );
      else if (address.teacherId)
        await this.addressRepository.clearPrimaryForTeacherExclude(
          address.teacherId,
          addressId,
        );
    }

    const updated = await this.addressRepository.update(addressId, dto);
    this.logger.log(`Address ${addressId} updated for user ${userId}`);
    return updated;
  }
}
