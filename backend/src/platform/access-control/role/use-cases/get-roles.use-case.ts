import { Injectable } from '@nestjs/common';
import { IRoleRepository } from '../domain/interfaces/role-repository.interface.js';

@Injectable()
export class GetRolesUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(userId: string) {
    const userRoles = await this.roleRepository.findUserRoles(userId);
    const isSuperAdmin = userRoles.some((ur) => ur.role.code === 'SUPER_ADMIN');
    return this.roleRepository.findAll(isSuperAdmin);
  }
}
