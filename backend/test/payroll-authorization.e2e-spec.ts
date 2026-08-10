import { ExecutionContext, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import { LoggerModule } from 'nestjs-pino';
import request from 'supertest';
import { PrismaModule } from '../src/core/database/prisma.module.js';
import { PrismaService } from '../src/core/database/prisma.service.js';
import { PayrollModule } from '../src/payroll/payroll.module.js';
import { IPermissionRepository } from '../src/platform/access-control/permission/domain/interfaces/permission-repository.interface.js';
import { PermissionGuard } from '../src/platform/access-control/permission/guards/permission.guard.js';
import { JwtAuthGuard } from '../src/platform/auth/guards/jwt-auth.guard.js';

/**
 * ADR-0008's regression net.
 *
 * `payroll-` is exempt from the `ADMIN` role bypass, which means an account
 * holding the top delegated role reads **no** salary in the school unless each
 * permission is granted to it explicitly. That exemption is one array in
 * `permission.guard.ts`; without this test, removing an entry from it silently
 * reopens every route below, and nothing else in the suite would notice.
 *
 * Every route in contracts/payroll-api.md is enumerated. Each is asserted twice
 * — denied without the grant, and *not* denied with it — because a test that
 * only checks for 403 passes just as happily against a path that does not
 * exist.
 *
 * No database: `PrismaService` and the permission repository are mocked, the
 * same shape as `auth.e2e-spec.ts`. The claim under test is about the guard,
 * not about stored data.
 */

const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const UUID = '22222222-2222-4222-8222-222222222222';

interface Route {
  method: 'get' | 'post' | 'patch' | 'delete';
  path: string;
  permission: string;
}

const ROUTES: Route[] = [
  {
    method: 'get',
    path: '/payroll/components',
    permission: 'payroll-components.read',
  },
  {
    method: 'post',
    path: '/payroll/components',
    permission: 'payroll-components.create',
  },
  {
    method: 'patch',
    path: `/payroll/components/${UUID}`,
    permission: 'payroll-components.update',
  },
  {
    method: 'delete',
    path: `/payroll/components/${UUID}`,
    permission: 'payroll-components.delete',
  },
  {
    method: 'get',
    path: '/payroll/assignments',
    permission: 'payroll-salaries.read',
  },
  {
    method: 'get',
    path: `/payroll/assignments/user/${UUID}`,
    permission: 'payroll-salaries.read',
  },
  {
    method: 'post',
    path: '/payroll/assignments',
    permission: 'payroll-salaries.update',
  },
  {
    method: 'delete',
    path: `/payroll/assignments/${UUID}`,
    permission: 'payroll-salaries.update',
  },
  { method: 'get', path: '/payroll/runs', permission: 'payroll-runs.read' },
  {
    method: 'get',
    path: `/payroll/runs/${UUID}`,
    permission: 'payroll-runs.read',
  },
  { method: 'post', path: '/payroll/runs', permission: 'payroll-runs.create' },
  {
    method: 'post',
    path: `/payroll/runs/${UUID}/recalculate`,
    permission: 'payroll-runs.update',
  },
  {
    method: 'post',
    path: `/payroll/runs/${UUID}/submit`,
    permission: 'payroll-runs.update',
  },
  {
    method: 'post',
    path: `/payroll/runs/${UUID}/approve`,
    permission: 'payroll-runs.approve',
  },
  {
    method: 'get',
    path: `/payroll/runs/${UUID}/payslips`,
    permission: 'payroll-payslips.read',
  },
  {
    method: 'get',
    path: '/payroll/payslips/me',
    permission: 'payroll-payslips.read-own',
  },
  {
    method: 'get',
    path: `/payroll/payslips/${UUID}`,
    permission: 'payroll-payslips.read',
  },
];

/** Stands in for `JwtAuthGuard`: admits everyone, as the named user. */
function authenticateAs(userId: string) {
  return {
    canActivate: (context: ExecutionContext) => {
      context.switchToHttp().getRequest<{ user: unknown }>().user = {
        id: userId,
        identifier: 'admin',
      };
      return true;
    },
  };
}

describe('payroll authorization (ADR-0008)', () => {
  let app: INestApplication;
  let server: Server;

  /** What the account under test holds. Empty means "ADMIN role only". */
  let grantedPermissions: string[] = [];
  let roleCodes = ['ADMIN'];

  const prismaMock = {
    salaryComponent: { findMany: jest.fn().mockResolvedValue([]) },
    salaryAssignment: { findMany: jest.fn().mockResolvedValue([]) },
    payrollRun: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
    },
    payslip: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  const permissionsMock = {
    findUserRoles: jest.fn(() =>
      Promise.resolve(roleCodes.map((code) => ({ role: { code } }))),
    ),
    findUserPermissions: jest.fn(() => Promise.resolve(grantedPermissions)),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule.forRoot({ pinoHttp: { enabled: false } }),
        PrismaModule,
        PayrollModule,
      ],
      providers: [
        { provide: IPermissionRepository, useValue: permissionsMock },
        // Order matters and mirrors app.module.ts: authentication populates
        // `request.user`, and the permission guard reads it. Registered the
        // other way round, every route refuses as unauthenticated — which
        // looks exactly like the denial this test is trying to prove.
        { provide: APP_GUARD, useValue: authenticateAs(ADMIN_ID) },
        { provide: APP_GUARD, useClass: PermissionGuard },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      // Authentication is not what is under test; the controller-level guard
      // is replaced too, so every failure below is an authorisation one.
      .overrideGuard(JwtAuthGuard)
      .useValue(authenticateAs(ADMIN_ID))
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    grantedPermissions = [];
    roleCodes = ['ADMIN'];
  });

  describe.each(ROUTES)('$method $path', (route) => {
    it(`denies an ADMIN with no explicit ${route.permission}`, async () => {
      const response = await request(server)[route.method](route.path).send({});

      expect(response.status).toBe(403);
    });

    it(`admits the same account once ${route.permission} is granted`, async () => {
      grantedPermissions = [route.permission];

      const response = await request(server)[route.method](route.path).send({});

      // Not asserting 200: a mocked repository may 404 or 422 further in. The
      // claim is only that the refusal was the missing grant and nothing else —
      // which also fails loudly if the path above is wrong.
      expect(response.status).not.toBe(403);
    });
  });

  /**
   * The break-glass path stays open on purpose: if every operator is locked
   * out of payroll, someone has to be able to get back in.
   */
  it('lets SUPER_ADMIN through without an explicit grant', async () => {
    roleCodes = ['SUPER_ADMIN'];

    const response = await request(server).get('/payroll/components');

    expect(response.status).not.toBe(403);
  });

  it('denies an account holding no role at all', async () => {
    roleCodes = [];

    const response = await request(server).get('/payroll/components');

    expect(response.status).toBe(403);
  });
});
