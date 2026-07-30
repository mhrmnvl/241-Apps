import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IPermissionRepository } from '../interfaces/permission-repository.interface.js';
import { IRoleRepository } from '../../role/index.js';

@Injectable()
export class AssignPermissionToRoleUseCase {
  private readonly logger = new Logger(AssignPermissionToRoleUseCase.name);

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

    const existingRelation = await this.permissionRepository.findRolePermission(
      roleId,
      permissionId,
    );
    if (existingRelation) {
      throw new ConflictException('Role already has this permission');
    }

    await this.permissionRepository.assignPermissionToRole(
      roleId,
      permissionId,
    );
    this.logger.log(
      `Permission ${permission.code} assigned to role ${role.code}`,
    );
  }
}
