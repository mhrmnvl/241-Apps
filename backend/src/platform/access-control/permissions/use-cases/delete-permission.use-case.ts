import { Injectable, NotFoundException } from '@nestjs/common';
import { IPermissionsRepository } from '../interfaces/permissions-repository.interface.js';

@Injectable()
export class DeletePermissionUseCase {
  constructor(private readonly permissionsRepo: IPermissionsRepository) {}

  async execute(id: string) {
    const existing = await this.permissionsRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    // role_permissions rows referencing this permission are removed via the
    // schema's onDelete: Cascade.
    await this.permissionsRepo.deletePermission(id);
  }
}
