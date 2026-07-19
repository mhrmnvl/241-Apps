import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateRoleDto } from '../dto/update-role.dto.js';
import { IRoleRepository } from '../domain/interfaces/role-repository.interface.js';

@Injectable()
export class UpdateRoleUseCase {
  constructor(private readonly rolesRepo: IRoleRepository) {}

  async execute(id: string, dto: UpdateRoleDto) {
    const role = await this.rolesRepo.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem)
      throw new ForbiddenException('System roles cannot be edited');
    return this.rolesRepo.update(id, dto);
  }
}
