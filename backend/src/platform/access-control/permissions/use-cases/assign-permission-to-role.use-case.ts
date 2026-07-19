import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IPermissionsRepository } from '../interfaces/permissions-repository.interface.js';
import { IRoleRepository } from '../../role/index.js';

@Injectable()
export class AssignPermissionToRoleUseCase {
  private readonly logger = new Logger(AssignPermissionToRoleUseCase.name);

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

    const existingRelation = await this.permissionsRepo.findRolePermission(
      roleId,
      permissionId,
    );
    if (existingRelation) {
      throw new ConflictException('Role already has this permission');
    }

    await this.permissionsRepo.assignPermissionToRole(roleId, permissionId);
    this.logger.log(
      `Permission ${permission.code} assigned to role ${role.code}`,
    );
  }
}
