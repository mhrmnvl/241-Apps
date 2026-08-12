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

    // Roles overlap by design — a user holding both TEACHER and WALI_KELAS
    // gets each shared code once, because the frontend treats this as a set.
    const permissions = [
      ...new Set(
        user.userRoles?.flatMap(
          (ur) =>
            ur.role.rolePermissions?.map((rp) => rp.permission.code) ?? [],
        ) ?? [],
      ),
    ];

    return {
      id: user.id,
      identifier: user.identifier,
      isActive: user.isActive,
      name: user.profile?.name ?? null,
      roles: user.userRoles?.map((ur) => ur.role.code) ?? [],
      permissions,
    };
  }
}
