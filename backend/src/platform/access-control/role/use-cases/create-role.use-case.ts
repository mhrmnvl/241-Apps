import { ConflictException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from '../dto/create-role.dto.js';
import { IRoleRepository } from '../domain/interfaces/role-repository.interface.js';

@Injectable()
export class CreateRoleUseCase {
  constructor(private readonly rolesRepo: IRoleRepository) {}

  async execute(dto: CreateRoleDto) {
    const existing = await this.rolesRepo.findByCode(dto.code);
    if (existing) throw new ConflictException('Role code already exists');
    return this.rolesRepo.create(dto);
  }
}
