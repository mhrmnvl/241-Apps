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
 * Codes the ADMIN blanket bypass does not cover.
 *
 * `portal-`: holding an administrative role in SIAKAD must not by itself confer
 * the right to publish to the school's public website — its operators may be
 * different people, and a boundary the top delegated role walks straight through
 * is not a boundary (FR-062, ADR-0006).
 *
 * `payroll-`: the same argument with money. Without the exemption every ADMIN
 * reads every salary in the school by virtue of the role, and — the part that
 * matters — no grant configuration can prevent it, because the bypass runs
 * before permissions are consulted (ADR-0008).
 *
 * SUPER_ADMIN keeps the full bypass on purpose: it is the break-glass path that
 * keeps both recoverable if every operator is locked out.
 *
 * This is data, not new branching. Blast radius is zero for everything outside
 * the prefixes.
 */
const ROLE_BYPASS_EXEMPT_PREFIXES = ['portal-', 'payroll-'] as const;

const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';
const ADMIN_ROLE = 'ADMIN';

function isExemptFromRoleBypass(permission: string): boolean {
  return ROLE_BYPASS_EXEMPT_PREFIXES.some((prefix) =>
    permission.startsWith(prefix),
  );
}

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

    // Super Admin bypasses everything — the one break-glass account type.
    if (roleCodes.includes(SUPER_ADMIN_ROLE)) {
      return true;
    }

    // Admin bypasses everything except the exempt prefixes. An Admin asking for
    // a portal code falls through to the ordinary permission check below and is
    // granted only if the role actually holds it.
    if (
      roleCodes.includes(ADMIN_ROLE) &&
      !requiredPermissions.some(isExemptFromRoleBypass)
    ) {
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
