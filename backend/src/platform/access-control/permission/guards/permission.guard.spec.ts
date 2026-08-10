import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { IPermissionRepository } from '../domain/interfaces/permission-repository.interface.js';
import { PermissionGuard } from './permission.guard.js';

const USER_ID = '11111111-1111-4111-8111-111111111111';

function contextRequiring(...permissions: string[]): ExecutionContext {
  return {
    getHandler: () => ({}) as never,
    getClass: () => ({}) as never,
    switchToHttp: () => ({ getRequest: () => ({ user: { id: USER_ID } }) }),
  } as unknown as ExecutionContext & { __permissions: string[] };
}

function rolesOf(...codes: string[]) {
  return codes.map((code) => ({ role: { code } }));
}

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  const repository = {
    findUserRoles: jest.fn(),
    findUserPermissions: jest.fn(),
  };

  beforeEach(async () => {
    reflector = { getAllAndOverride: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionGuard,
        { provide: Reflector, useValue: reflector },
        { provide: IPermissionRepository, useValue: repository },
      ],
    }).compile();

    guard = module.get(PermissionGuard);
    jest.clearAllMocks();
    repository.findUserPermissions.mockResolvedValue([]);
  });

  /** Runs the guard as a user holding `roles` and `permissions`. */
  async function attempt(
    required: string[],
    roles: string[],
    permissions: string[] = [],
  ) {
    reflector.getAllAndOverride.mockReturnValue(required);
    repository.findUserRoles.mockResolvedValue(rolesOf(...roles));
    repository.findUserPermissions.mockResolvedValue(permissions);
    return guard.canActivate(contextRequiring(...required));
  }

  it('lets an unguarded route through without touching the repository', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    await expect(guard.canActivate(contextRequiring())).resolves.toBe(true);
    expect(repository.findUserRoles).not.toHaveBeenCalled();
  });

  it('refuses an unauthenticated request', async () => {
    reflector.getAllAndOverride.mockReturnValue(['students.read']);
    const context = {
      getHandler: () => ({}) as never,
      getClass: () => ({}) as never,
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  // The four cases from contracts/permissions.md. These are the whole of
  // ADR-0006: an ADMIN's blanket bypass stops at the portal boundary, and
  // nothing else about the guard changes.
  describe('the ADMIN bypass and its portal exemption (ADR-0006)', () => {
    it('(a) refuses an ADMIN a portal code they do not hold', async () => {
      await expect(
        attempt(['portal-posts.publish'], ['ADMIN']),
      ).rejects.toThrow(ForbiddenException);
    });

    it('(b) still passes an ADMIN every non-portal code, unchanged', async () => {
      for (const code of [
        'students.read',
        'grades.update',
        'assets.delete',
        'applications.read',
        'settings.update',
      ]) {
        await expect(attempt([code], ['ADMIN'])).resolves.toBe(true);
      }
      // The bypass answered every one of them without a permission lookup.
      expect(repository.findUserPermissions).not.toHaveBeenCalled();
    });

    it('(c) passes a SUPER_ADMIN on both portal and non-portal codes', async () => {
      await expect(
        attempt(['portal-posts.publish'], ['SUPER_ADMIN']),
      ).resolves.toBe(true);
      await expect(attempt(['students.read'], ['SUPER_ADMIN'])).resolves.toBe(
        true,
      );
    });

    it('(d) passes a portal editor on portal codes and refuses academic ones', async () => {
      const portalCodes = ['portal-posts.publish', 'portal-posts.read'];

      await expect(
        attempt(['portal-posts.publish'], ['PORTAL_EDITOR'], portalCodes),
      ).resolves.toBe(true);

      await expect(
        attempt(['students.read'], ['PORTAL_EDITOR'], portalCodes),
      ).rejects.toThrow(ForbiddenException);
    });

    // An ADMIN who was explicitly granted the code still gets in. The exemption
    // removes the free pass, not the permission itself — otherwise the portal
    // could never be delegated to someone who also administers SIAKAD.
    it('passes an ADMIN who actually holds the portal permission', async () => {
      await expect(
        attempt(['portal-posts.publish'], ['ADMIN'], ['portal-posts.publish']),
      ).resolves.toBe(true);
    });

    // A route requiring both must not be waved through on the strength of the
    // non-portal half.
    it('refuses an ADMIN when only one of several required codes is a portal code', async () => {
      await expect(
        attempt(['students.read', 'portal-posts.publish'], ['ADMIN']),
      ).rejects.toThrow(ForbiddenException);
    });

    it('passes a SUPER_ADMIN who also holds ADMIN', async () => {
      await expect(
        attempt(['portal-posts.publish'], ['ADMIN', 'SUPER_ADMIN']),
      ).resolves.toBe(true);
    });
  });

  // ADR-0008. Salary is the second exempt prefix, and the reason is sharper than
  // the portal's: without the exemption no grant configuration can keep an ADMIN
  // out, because the bypass runs before permissions are read.
  describe('the payroll exemption', () => {
    it('refuses an ADMIN a payroll code they do not hold', async () => {
      await expect(attempt(['payroll-runs.read'], ['ADMIN'])).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('refuses an ADMIN the salary-setting code specifically', async () => {
      await expect(
        attempt(['payroll-salaries.update'], ['ADMIN']),
      ).rejects.toThrow(ForbiddenException);
    });

    // The exemption must stay narrow. An ADMIN administers attendance; only the
    // money is fenced off.
    it('still passes an ADMIN every presence code by role alone', async () => {
      await expect(
        attempt(['presence-records.update'], ['ADMIN']),
      ).resolves.toBe(true);
      await expect(
        attempt(['presence-credentials.create'], ['ADMIN']),
      ).resolves.toBe(true);
    });

    it('passes an ADMIN who actually holds the payroll permission', async () => {
      await expect(
        attempt(['payroll-runs.read'], ['ADMIN'], ['payroll-runs.read']),
      ).resolves.toBe(true);
    });

    it('refuses an ADMIN when only one of several required codes is a payroll code', async () => {
      await expect(
        attempt(['presence-records.read', 'payroll-payslips.read'], ['ADMIN']),
      ).rejects.toThrow(ForbiddenException);
    });

    it('keeps SUPER_ADMIN break-glass over payroll', async () => {
      await expect(
        attempt(['payroll-salaries.update'], ['SUPER_ADMIN']),
      ).resolves.toBe(true);
    });

    // The two exempt prefixes are independent; neither implies the other.
    it('refuses an ADMIN a payroll code even while holding every portal code', async () => {
      await expect(
        attempt(['payroll-runs.approve'], ['ADMIN'], ['portal-posts.publish']),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('the ordinary permission path', () => {
    it('requires every listed permission, not just one', async () => {
      await expect(
        attempt(
          ['portal-posts.read', 'portal-posts.update'],
          ['PORTAL_EDITOR'],
          ['portal-posts.read'],
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('names the required permissions in the refusal', async () => {
      await expect(
        attempt(['portal-posts.publish'], ['PORTAL_EDITOR'], []),
      ).rejects.toThrow(/portal-posts\.publish/);
    });
  });
});
