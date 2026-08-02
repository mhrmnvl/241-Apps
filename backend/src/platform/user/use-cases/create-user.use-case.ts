import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '../dto/request/create-user.dto.js';
import { IUserRepository } from '../domain/interfaces/user-repository.interface.js';
import { hashPassword } from '../../../shared/utils/hash.helper.js';

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserDto) {
    const taken = await this.userRepository.existsByIdentifier(dto.identifier);
    if (taken) {
      throw new ConflictException(
        `Identifier ${dto.identifier} already in use`,
      );
    }

    const user = await this.userRepository.create({
      identifier: dto.identifier,
      passwordHash: await hashPassword(dto.password),
    });

    this.logger.log(`User created: ${dto.identifier}`);
    return user;
  }
}
