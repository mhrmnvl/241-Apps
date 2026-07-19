import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../interfaces/user-repository.interface.js';

@Injectable()
export class DeleteUserUseCase {
  private readonly logger = new Logger(DeleteUserUseCase.name);

  constructor(private readonly usersRepository: IUserRepository) {}

  async execute(id: string) {
    const exists = await this.usersRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.remove(id);
    this.logger.log(`User deleted: ${id}`);
  }
}
