import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IPermissionsRepository } from '../interfaces/permissions-repository.interface.js';
import { IRoleRepository } from '../../role/index.js';

@Injectable()
export class RemovePermissionFromRoleUseCase {
  private readonly logger = new Logger(RemovePermissionFromRoleUseCase.name);

  constructor(
    private readonly permissionsRepo: IPermissionsRepository,
    private readonly rolesRepo: IRoleRepository,
  ) {}

  async execute(roleId: string, permissionId: string) {
    const role = await this.rolesRepo.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    if (role.isSystem) {
      throw new ForbiddenException(
        'Permissions of system roles cannot be modified',
      );
    }

    const permission = await this.permissionsRepo.findById(permissionId);
    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permissionId} not found`,
      );
    }

    const relation = await this.permissionsRepo.findRolePermission(
      roleId,
      permissionId,
    );
    if (!relation) {
      throw new NotFoundException('Role does not have this permission');
    }

    await this.permissionsRepo.removePermissionFromRole(roleId, permissionId);
    this.logger.log(
      `Permission ${permission.code} removed from role ${role.code}`,
    );
  }
}
