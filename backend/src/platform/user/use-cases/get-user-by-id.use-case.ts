import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../interfaces/user-repository.interface.js';

@Injectable()
export class GetUserByIdUseCase {
  constructor(private readonly usersRepository: IUserRepository) {}

  async execute(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
