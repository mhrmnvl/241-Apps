import { Injectable, NotFoundException } from '@nestjs/common';
import { IPermissionRepository } from '../interfaces/permission-repository.interface.js';

@Injectable()
export class DeletePermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(id: string) {
    const existing = await this.permissionRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    // role_permissions rows referencing this permission are removed via the
    // schema's onDelete: Cascade.
    await this.permissionRepository.deletePermission(id);
  }
}
