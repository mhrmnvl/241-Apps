import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '../dto/request/create-user.dto.js';
import { IUserRepository } from '../interfaces/user-repository.interface.js';
import { hashPassword } from '../../../shared/utils/hash.helper.js';

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(private readonly usersRepository: IUserRepository) {}

  async execute(dto: CreateUserDto) {
    const taken = await this.usersRepository.existsByIdentifier(dto.identifier);
    if (taken) {
      throw new ConflictException('Identifier already taken');
    }

    const user = await this.usersRepository.create({
      identifier: dto.identifier,
      passwordHash: await hashPassword(dto.password),
    });

    this.logger.log(`User created: ${dto.identifier}`);
    return user;
  }
}
