import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IRoleRepository } from '../domain/interfaces/role-repository.interface.js';

@Injectable()
export class DeleteRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem)
      throw new ForbiddenException('System roles cannot be deleted');
    return this.roleRepository.delete(id);
  }
}
