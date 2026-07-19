import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from '../dto/request/update-user.request.dto.js';
import { IUserRepository } from '../interfaces/user-repository.interface.js';
import { hashPassword } from '../../../shared/utils/hash.helper.js';

@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(private readonly usersRepository: IUserRepository) {}

  async execute(id: string, dto: UpdateUserDto) {
    const currentUser = await this.usersRepository.findById(id);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    if (dto.identifier) {
      const existing = await this.usersRepository.findByIdentifier(
        dto.identifier,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException('Identifier already taken');
      }
    }

    const data: Prisma.UserUpdateInput = {};

    if (dto.identifier) {
      data.identifier = dto.identifier;
    }

    if (dto.password) {
      data.passwordHash = await hashPassword(dto.password);
    }

    const updated = await this.usersRepository.update(id, data);
    this.logger.log(`User updated: ${id}`);
    return updated;
  }
}
