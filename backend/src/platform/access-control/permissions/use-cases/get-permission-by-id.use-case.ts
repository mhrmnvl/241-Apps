import { Injectable, NotFoundException } from '@nestjs/common';
import { IPermissionsRepository } from '../interfaces/permissions-repository.interface.js';

@Injectable()
export class GetPermissionByIdUseCase {
  constructor(private readonly permissionsRepo: IPermissionsRepository) {}

  async execute(id: string) {
    const permission = await this.permissionsRepo.findById(id);
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
  }
}
