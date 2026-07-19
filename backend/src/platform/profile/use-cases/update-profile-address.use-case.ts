import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateAddressDto } from '../../../shared/dto/address.dto.js';
import { ProfileRepository } from '../index.js';
import { ProfileAddressRepository } from '../repositories/profile-address.repository.js';

@Injectable()
export class UpdateProfileAddressUseCase {
  private readonly logger = new Logger(UpdateProfileAddressUseCase.name);

  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly addressRepo: ProfileAddressRepository,
  ) {}

  async execute(userId: string, addressId: string, dto: UpdateAddressDto) {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile)
      throw new NotFoundException(`Profile for user ID ${userId} not found`);

    const address = await this.addressRepo.findAddressForUser(
      addressId,
      userId,
    );
    if (!address)
      throw new NotFoundException(
        `Address with ID ${addressId} not found for this profile`,
      );

    if (dto.isPrimary) {
      if (address.studentId)
        await this.addressRepo.clearPrimaryForStudentExclude(
          address.studentId,
          addressId,
        );
      else if (address.teacherId)
        await this.addressRepo.clearPrimaryForTeacherExclude(
          address.teacherId,
          addressId,
        );
    }

    const updated = await this.addressRepo.update(addressId, dto);
    this.logger.log(`Address ${addressId} updated for user ${userId}`);
    return updated;
  }
}
