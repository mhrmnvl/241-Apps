import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IRoleRepository } from '../domain/interfaces/role-repository.interface.js';

@Injectable()
export class DeleteRoleUseCase {
  constructor(private readonly rolesRepo: IRoleRepository) {}

  async execute(id: string) {
    const role = await this.rolesRepo.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem)
      throw new ForbiddenException('System roles cannot be deleted');
    return this.rolesRepo.delete(id);
  }
}
