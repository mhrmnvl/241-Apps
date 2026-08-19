import { PrismaStudentIdentityReadPort } from '../../infrastructure/persistence/prisma-student-identity.read-port.js';
import { PrismaTeacherIdentityReadPort } from '../../../teacher/infrastructure/persistence/prisma-teacher-identity.read-port.js';
import type { PrismaService } from '../../../../core/database/prisma.service.js';

/**
 * These two ports decide whose data a self-service read is about, so the case
 * that matters is the one where the answer is "nobody".
 *
 * A null must reach the caller as null and become an empty result. If it were
 * ever treated as "no filter", the read would widen to everyone — and an
 * unscoped list of report cards is indistinguishable, on screen, from a correct
 * one. That is the whole failure this boundary exists to prevent.
 */
describe('identity read ports', () => {
  function studentPortWith(row: { id: string } | null) {
    const findFirst = jest.fn().mockResolvedValue(row);
    const prisma = { student: { findFirst } } as unknown as PrismaService;
    return { port: new PrismaStudentIdentityReadPort(prisma), findFirst };
  }

  function teacherPortWith(row: { id: string } | null) {
    const findFirst = jest.fn().mockResolvedValue(row);
    const prisma = { teacher: { findFirst } } as unknown as PrismaService;
    return { port: new PrismaTeacherIdentityReadPort(prisma), findFirst };
  }

  describe('student', () => {
    it('resolves an account to its student id', async () => {
      const { port } = studentPortWith({ id: 'stu-1' });
      await expect(port.findStudentIdByUserId('user-1')).resolves.toBe('stu-1');
    });

    it('returns null for an account with no student record', async () => {
      const { port } = studentPortWith(null);
      await expect(port.findStudentIdByUserId('user-1')).resolves.toBeNull();
    });

    /**
     * A soft-deleted student must stop answering as themselves. Without
     * `deletedAt: null` the account keeps resolving to a record the rest of the
     * system treats as gone.
     */
    it('excludes soft-deleted students from the lookup', async () => {
      const { port, findFirst } = studentPortWith(null);
      await port.findStudentIdByUserId('user-1');

      expect(findFirst.mock.calls[0][0].where).toEqual({
        userId: 'user-1',
        deletedAt: null,
      });
    });

    it('selects the id alone', async () => {
      const { port, findFirst } = studentPortWith({ id: 'stu-1' });
      await port.findStudentIdByUserId('user-1');

      expect(findFirst.mock.calls[0][0].select).toEqual({ id: true });
    });
  });

  describe('teacher', () => {
    it('resolves an account to its teacher id', async () => {
      const { port } = teacherPortWith({ id: 'tea-1' });
      await expect(port.findTeacherIdByUserId('user-1')).resolves.toBe('tea-1');
    });

    it('returns null for an account with no teaching record', async () => {
      const { port } = teacherPortWith(null);
      await expect(port.findTeacherIdByUserId('user-1')).resolves.toBeNull();
    });

    it('excludes soft-deleted teachers from the lookup', async () => {
      const { port, findFirst } = teacherPortWith(null);
      await port.findTeacherIdByUserId('user-1');

      expect(findFirst.mock.calls[0][0].where).toEqual({
        userId: 'user-1',
        deletedAt: null,
      });
    });
  });
});
