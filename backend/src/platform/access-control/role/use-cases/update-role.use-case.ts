import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateRoleDto } from '../dto/request/update-role.dto.js';
import { IRoleRepository } from '../domain/interfaces/role-repository.interface.js';

@Injectable()
export class UpdateRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(id: string, dto: UpdateRoleDto) {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    // SUPER_ADMIN is all-powerful (it bypasses every permission check), so it is
    // never editable. Other roles — including built-in system roles like ADMIN or
    // TEACHER — can have their name, description, and permissions configured; only
    // their immutable `code` is protected (it is not part of UpdateRoleDto).
    if (role.code === 'SUPER_ADMIN') {
      throw new ForbiddenException('The SUPER_ADMIN role cannot be modified');
    }
    return this.roleRepository.update(id, dto);
  }
}
