import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from '../dto/request/update-user.dto.js';
import { IUserRepository } from '../interfaces/user-repository.interface.js';
import { hashPassword } from '../../../shared/utils/hash.helper.js';

@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string, dto: UpdateUserDto) {
    const currentUser = await this.userRepository.findById(id);
    if (!currentUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (dto.identifier && dto.identifier !== currentUser.identifier) {
      const existing = await this.userRepository.findByIdentifier(
        dto.identifier,
      );
      if (existing) {
        throw new ConflictException(
          `Identifier ${dto.identifier} is already in use`,
        );
      }
    }

    const data: Partial<{
      identifier: string;
      passwordHash: string;
      isActive: boolean;
    }> = {};

    if (dto.identifier) {
      data.identifier = dto.identifier;
    }

    if (dto.password) {
      data.passwordHash = await hashPassword(dto.password);
    }

    const updated = await this.userRepository.update(id, data);
    this.logger.log(`User updated: ${id}`);
    return updated;
  }
}
