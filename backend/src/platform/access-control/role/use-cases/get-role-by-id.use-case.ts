import { Injectable, NotFoundException } from '@nestjs/common';
import { IRoleRepository } from '../domain/interfaces/role-repository.interface.js';

@Injectable()
export class GetRoleByIdUseCase {
  constructor(private readonly rolesRepo: IRoleRepository) {}

  async execute(id: string, userId: string) {
    const userRoles = await this.rolesRepo.findUserRoles(userId);
    const isSuperAdmin = userRoles.some((ur) => ur.role.code === 'SUPER_ADMIN');
    const role = await this.rolesRepo.findById(id, isSuperAdmin);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }
}
