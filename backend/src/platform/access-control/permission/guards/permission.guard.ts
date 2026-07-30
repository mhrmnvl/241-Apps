import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator.js';
import { IPermissionRepository } from '../interfaces/permission-repository.interface.js';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { id: string } }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied. User not authenticated.');
    }

    // Admin and Super Admin bypass all permission checks
    const userRoles = await this.permissionRepository.findUserRoles(user.id);
    const isAdmin = userRoles.some(
      (ur) => ur.role.code === 'SUPER_ADMIN' || ur.role.code === 'ADMIN',
    );
    if (isAdmin) {
      return true;
    }

    const userPermissions = await this.permissionRepository.findUserPermissions(
      user.id,
    );

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
