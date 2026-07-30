import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IPermissionRepository } from '../interfaces/permission-repository.interface.js';
import { IRoleRepository } from '../../role/index.js';

@Injectable()
export class RemovePermissionFromRoleUseCase {
  private readonly logger = new Logger(RemovePermissionFromRoleUseCase.name);

  constructor(
    private readonly permissionRepository: IPermissionRepository,
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(roleId: string, permissionId: string) {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    if (role.isSystem) {
      throw new ForbiddenException(
        'Permissions of system roles cannot be modified',
      );
    }

    const permission = await this.permissionRepository.findById(permissionId);
    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permissionId} not found`,
      );
    }

    const relation = await this.permissionRepository.findRolePermission(
      roleId,
      permissionId,
    );
    if (!relation) {
      throw new NotFoundException('Role does not have this permission');
    }

    await this.permissionRepository.removePermissionFromRole(
      roleId,
      permissionId,
    );
    this.logger.log(
      `Permission ${permission.code} removed from role ${role.code}`,
    );
  }
}
