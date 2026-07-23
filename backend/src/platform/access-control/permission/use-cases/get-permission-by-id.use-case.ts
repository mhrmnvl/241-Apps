import { Injectable, NotFoundException } from '@nestjs/common';
import { IPermissionRepository } from '../interfaces/permission-repository.interface.js';

@Injectable()
export class GetPermissionByIdUseCase {
  constructor(private readonly permissionsRepo: IPermissionRepository) {}

  async execute(id: string) {
    const permission = await this.permissionsRepo.findById(id);
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
  }
}
