import { ConflictException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from '../dto/request/create-role.dto.js';
import { IRoleRepository } from '../domain/interfaces/role-repository.interface.js';

@Injectable()
export class CreateRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(dto: CreateRoleDto) {
    const existing = await this.roleRepository.findByCode(dto.code);
    if (existing) throw new ConflictException('Role code already exists');
    return this.roleRepository.create({
      name: dto.name,
      code: dto.code,
      description: dto.description,
      permissionIds: dto.permissionIds,
    });
  }
}
