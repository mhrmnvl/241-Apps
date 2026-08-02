import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../domain/interfaces/user-repository.interface.js';

@Injectable()
export class DeleteUserUseCase {
  private readonly logger = new Logger(DeleteUserUseCase.name);

  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string) {
    const exists = await this.userRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(id);
    this.logger.log(`User deleted: ${id}`);
  }
}
