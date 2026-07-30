import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from '../dto/request/create-permission.dto.js';
import { IPermissionRepository } from '../interfaces/permission-repository.interface.js';

@Injectable()
export class CreatePermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(dto: CreatePermissionDto) {
    // The code is always `module.action` so it matches the string a
    // `@RequirePermissions(...)` guard checks — it is derived, never free-form.
    const code = `${dto.module}.${dto.action}`;

    const existing = await this.permissionRepository.findByCode(code);
    if (existing) {
      throw new ConflictException(`Permission "${code}" already exists`);
    }

    return this.permissionRepository.createPermission({
      module: dto.module,
      action: dto.action,
      code,
      description: dto.description ?? '',
    });
  }
}
