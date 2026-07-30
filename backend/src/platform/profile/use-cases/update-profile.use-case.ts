import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateProfileDto } from '../dto/request/update-profile.dto.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { StorageService } from '../../../core/storage/storage.service.js';
import { withAvatarUrl } from '../mappers/profile-avatar.mapper.js';

@Injectable()
export class UpdateProfileUseCase {
  private readonly logger = new Logger(UpdateProfileUseCase.name);

  constructor(
    private readonly repository: ProfileRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto) {
    const profile = await this.repository.findByUserId(userId);
    if (!profile)
      throw new NotFoundException(`Profile for user ID ${userId} not found`);

    if (dto.nik) {
      const dup = await this.repository.findByNik(dto.nik, userId);
      if (dup)
        throw new ConflictException(`NIK "${dto.nik}" is already registered`);
    }
    if (dto.email) {
      const dup = await this.repository.findByEmail(dto.email, userId);
      if (dup)
        throw new ConflictException(
          `Email "${dto.email}" is already registered`,
        );
    }
    if (dto.phone) {
      const dup = await this.repository.findByPhone(dto.phone, userId);
      if (dup)
        throw new ConflictException(
          `Phone "${dto.phone}" is already registered`,
        );
    }

    const updated = await this.repository.update(userId, dto);
    this.logger.log(`Profile updated for user ${userId}`);
    return withAvatarUrl(updated, this.storage);
  }
}
