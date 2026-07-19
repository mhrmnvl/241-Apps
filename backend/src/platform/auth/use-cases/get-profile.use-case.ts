import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface.js';

@Injectable()
export class GetProfileUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(userId: string) {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      identifier: user.identifier,
      isActive: user.isActive,
      name: user.profile?.name ?? null,
      roles: user.userRoles?.map((ur) => ur.role.code) ?? [],
    };
  }
}
