import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdatePermissionDto } from '../dto/request/update-permission.dto.js';
import { IPermissionRepository } from '../interfaces/permission-repository.interface.js';

@Injectable()
export class UpdatePermissionUseCase {
  constructor(private readonly permissionsRepo: IPermissionRepository) {}

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
