import { ExecutionContext, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import ExcelJS from 'exceljs';
import type { Server } from 'node:http';
import { LoggerModule } from 'nestjs-pino';
import request from 'supertest';
import { PrismaModule } from '../src/core/database/prisma.module.js';
import { PrismaService } from '../src/core/database/prisma.service.js';
import { ResponseInterceptor } from '../src/core/interceptors/response.interceptor.js';
import { StudentModule } from '../src/academic/student/student.module.js';
import { IPermissionRepository } from '../src/platform/access-control/permission/domain/interfaces/permission-repository.interface.js';
import { PermissionGuard } from '../src/platform/access-control/permission/guards/permission.guard.js';
import { JwtAuthGuard } from '../src/platform/auth/guards/jwt-auth.guard.js';

/**
 * The student import, over HTTP.
 *
 * This is the route that will load the school's roster into a production
 * database that currently holds one account, so the claim worth pinning is not
 * that the import works — the unit tests cover that — but that the *preview*
 * half of it does not write. It used to. `POST /students/bulk-import` created
 * every valid row as it walked the sheet and then returned a report, which
 * made the confirmation dialog a description of work already done and left
 * "Batal" cancelling nothing.
 *
 * A unit test can assert that a use case does not call a create use case. Only
 * a request can assert that nothing anywhere behind the endpoint reached the
 * database, which is why this lives here: every write method on the Prisma
 * mock is watched, and the preview must leave all of them untouched.
 *
 * The second claim is the permission pair. `bulk-import/resolve` creates the
 * new rows *and* updates the conflicting ones, so it asks for `students.create`
 * and `students.update` together. Holding one is not enough, and a future
 * change that relaxes it back to a single permission would otherwise be
 * invisible — the route would simply start accepting callers who cannot be
 * trusted with half of what it does.
 *
 * No database: `PrismaService` and the permission repository are mocked, the
 * same shape as `payroll-authorization.e2e-spec.ts`.
 */

const CALLER_ID = '11111111-1111-4111-8111-111111111111';

const VALID_ROW = {
  NIS: '2024001',
  NISN: '0012345678',
  Nama: 'Ahmad Fauzi',
  NIK: '3578010101080001',
  'Jenis Kelamin': 'L',
  'Tempat Lahir': 'Malang',
  'Tanggal Lahir': '2008-01-01',
  Email: 'ahmad@test.com',
  Telepon: '081234567890',
  Kelas: '',
  Username: 'siswa001',
  Password: 'P@ssw0rd!',
};

async function makeSheet(
  rows: Record<string, ExcelJS.CellValue>[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sheet1');
  const keys = Object.keys(rows[0]);
  sheet.columns = keys.map((key) => ({ header: key, key, width: 20 }));
  sheet.addRows(rows);
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

/** Stands in for `JwtAuthGuard`: admits everyone, as the named caller. */
function authenticateAs(userId: string) {
  return {
    canActivate: (context: ExecutionContext) => {
      context.switchToHttp().getRequest<{ user: unknown }>().user = {
        id: userId,
        identifier: 'tu',
      };
      return true;
    },
  };
}

interface PreviewRow {
  row: number;
  status: 'SUCCESS' | 'FAILED' | 'CONFLICT';
  existingId?: string;
  error?: string;
}

interface PreviewData {
  total: number;
  success: number;
  failed: number;
  conflict: number;
  results: PreviewRow[];
}

describe('student import (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  let grantedPermissions: string[] = [];

  /**
   * Every method here writes. The preview must not touch a single one, so they
   * are declared together and asserted together rather than one at a time —
   * a new write reached by a future change should fail this test by default.
   */
  const writeMethods = () => [
    prismaMock.student.create,
    prismaMock.student.update,
    prismaMock.student.updateMany,
    prismaMock.student.delete,
    prismaMock.user.create,
    prismaMock.user.update,
    prismaMock.profile.create,
    prismaMock.profile.update,
    prismaMock.studentEnrollment.create,
    prismaMock.$transaction,
  ];

  const prismaMock = {
    student: {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
    },
    profile: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
    },
    grade: { findFirst: jest.fn().mockResolvedValue(null) },
    classroom: { findFirst: jest.fn().mockResolvedValue(null) },
    studentEnrollment: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  const permissionsMock = {
    findUserRoles: jest.fn(() => Promise.resolve([{ role: { code: 'TU' } }])),
    findUserPermissions: jest.fn(() => Promise.resolve(grantedPermissions)),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        // The config is supplied inline rather than read from the environment.
        // Three of the four e2e specs fail with `Configuration key
        // "JWT_SECRET" does not exist` on any checkout without a
        // `backend/.env` — a fresh clone, a git worktree, CI. That is a
        // property of the harness, not of the code under test, and a spec
        // that only runs on a developer's own machine is not a regression net.
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              JWT_SECRET: 'test-jwt-secret-for-e2e-testing-minimum-32-chars',
              NODE_ENV: 'test',
            }),
          ],
        }),
        LoggerModule.forRoot({ pinoHttp: { enabled: false } }),
        PrismaModule,
        StudentModule,
      ],
      providers: [
        { provide: IPermissionRepository, useValue: permissionsMock },
        // Order mirrors app.module.ts: authentication populates `request.user`,
        // and the permission guard reads it.
        { provide: APP_GUARD, useValue: authenticateAs(CALLER_ID) },
        { provide: APP_GUARD, useClass: PermissionGuard },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideGuard(JwtAuthGuard)
      .useValue(authenticateAs(CALLER_ID))
      .compile();

    app = moduleRef.createNestApplication();
    // Production wraps every response in `{ statusCode, message, data }`. The
    // assertions below read `.data`, so without this they would be testing a
    // shape the client never receives.
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // clearAllMocks wipes call records, not implementations — restore the
    // lookups so a test that makes one find something cannot leak.
    prismaMock.student.findFirst.mockResolvedValue(null);
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.grade.findFirst.mockResolvedValue(null);
    prismaMock.classroom.findFirst.mockResolvedValue(null);
    grantedPermissions = [];
  });

  describe('POST /students/bulk-import — the preview', () => {
    it('reports what each row would do', async () => {
      grantedPermissions = ['students.create'];
      const sheet = await makeSheet([VALID_ROW]);

      const response = await request(server)
        .post('/students/bulk-import')
        .attach('file', sheet, 'import.xlsx');

      expect(response.status).toBe(201);
      const data = (response.body as { data: PreviewData }).data;
      expect(data.total).toBe(1);
      expect(data.success).toBe(1);
      expect(data.results[0].status).toBe('SUCCESS');
    });

    // The claim this file exists for.
    it('writes nothing at all', async () => {
      grantedPermissions = ['students.create'];
      const sheet = await makeSheet([
        VALID_ROW,
        { ...VALID_ROW, NIS: '2024002', NISN: '0012345679', Username: 's2' },
      ]);

      const response = await request(server)
        .post('/students/bulk-import')
        .attach('file', sheet, 'import.xlsx');

      expect(response.status).toBe(201);
      for (const write of writeMethods()) {
        expect(write).not.toHaveBeenCalled();
      }
    });

    it('flags a row already in the database as a conflict, still without writing', async () => {
      grantedPermissions = ['students.create'];
      prismaMock.student.findFirst.mockResolvedValue({ id: 'stu-existing' });
      const sheet = await makeSheet([VALID_ROW]);

      const response = await request(server)
        .post('/students/bulk-import')
        .attach('file', sheet, 'import.xlsx');

      const data = (response.body as { data: PreviewData }).data;
      expect(data.conflict).toBe(1);
      expect(data.results[0].status).toBe('CONFLICT');
      expect(data.results[0].existingId).toBe('stu-existing');
      for (const write of writeMethods()) {
        expect(write).not.toHaveBeenCalled();
      }
    });

    it('refuses a caller without students.create', async () => {
      grantedPermissions = [];
      const sheet = await makeSheet([VALID_ROW]);

      const response = await request(server)
        .post('/students/bulk-import')
        .attach('file', sheet, 'import.xlsx');

      expect(response.status).toBe(403);
    });
  });

  describe('POST /students/bulk-import/resolve — the write', () => {
    const decisions = {
      conflicts: [
        {
          action: 'skip' as const,
          existingId: 'stu-1',
          data: {
            identifier: 'siswa001',
            name: 'Ahmad Fauzi',
            nik: '3578010101080001',
            gender: 'MALE',
            birthPlace: 'Malang',
            birthDate: '2008-01-01',
            nis: '2024001',
            nisn: '0012345678',
          },
        },
      ],
    };

    it('refuses a caller holding only students.update', async () => {
      grantedPermissions = ['students.update'];

      const response = await request(server)
        .post('/students/bulk-import/resolve')
        .send(decisions);

      expect(response.status).toBe(403);
    });

    it('refuses a caller holding only students.create', async () => {
      grantedPermissions = ['students.create'];

      const response = await request(server)
        .post('/students/bulk-import/resolve')
        .send(decisions);

      expect(response.status).toBe(403);
    });

    it('admits a caller holding both', async () => {
      grantedPermissions = ['students.create', 'students.update'];

      const response = await request(server)
        .post('/students/bulk-import/resolve')
        .send(decisions);

      expect(response.status).not.toBe(403);
    });

    // The other half of the preview's claim. "Writes nothing" is only worth
    // asserting if the same watch can see a write when one happens — otherwise
    // the preview tests would keep passing after the write detection broke.
    it('does write when the caller confirms an update', async () => {
      grantedPermissions = ['students.create', 'students.update'];
      prismaMock.student.findFirst.mockResolvedValue({ id: 'stu-1' });

      const response = await request(server)
        .post('/students/bulk-import/resolve')
        .send({
          conflicts: [{ ...decisions.conflicts[0], action: 'update' }],
        });

      expect(response.status).not.toBe(403);
      const touched = writeMethods().some(
        (write) => write.mock.calls.length > 0,
      );
      expect(touched).toBe(true);
    });
  });
});
