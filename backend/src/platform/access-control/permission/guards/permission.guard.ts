import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator.js';
import { IPermissionRepository } from '../domain/interfaces/permission-repository.interface.js';

/**
 * One role bypasses the permission check, and only one.
 *
 * SUPER_ADMIN is the break-glass path: it exists so the school can recover when
 * a grant configuration has locked everybody out, and it is the single place
 * where a role name decides an authorization outcome.
 *
 * ADMIN used to bypass too — everything except codes prefixed `portal-` and
 * `payroll-`, which were carved out one at a time (ADR-0006, ADR-0008) because
 * a boundary the top delegated role walks straight through is not a boundary.
 *
 * That exemption list is gone because it was the wrong shape. Each new area
 * needing separation had to be *remembered* into it, and forgetting was silent:
 * the permission simply worked for every ADMIN, and no configuration could
 * prevent it, because the bypass ran before grants were read. The school asked
 * for per-application administrators — academic, portal, admission, inventory —
 * and a role that passes everything contradicts that at the root.
 *
 * So ADMIN is now an ordinary role: whatever its grants say, and nothing more.
 * "Admin Akademik" and "Admin Portal" are roles like any other, and the
 * difference between them is the permissions they hold rather than a name the
 * guard recognises.
 *
 * Nobody held ADMIN in either database when this changed — zero users in dev,
 * and the role did not exist in production — so the change cost nothing to make
 * and would have grown more expensive every week.
 */
const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';

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

    const userRoles = await this.permissionRepository.findUserRoles(user.id);
    const roleCodes = userRoles.map((ur) => ur.role.code);

    // Super Admin bypasses everything — the one break-glass account type, and
    // the only role name this guard knows.
    if (roleCodes.includes(SUPER_ADMIN_ROLE)) {
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
