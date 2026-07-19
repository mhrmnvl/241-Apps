import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdatePermissionDto } from '../dto/update-permission.dto.js';
import { IPermissionsRepository } from '../interfaces/permissions-repository.interface.js';

@Injectable()
export class UpdatePermissionUseCase {
  constructor(private readonly permissionsRepo: IPermissionsRepository) {}

  async execute(id: string, dto: UpdatePermissionDto) {
    const existing = await this.permissionsRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return this.permissionsRepo.updatePermission(id, {
      description: dto.description ?? '',
    });
  }
}
