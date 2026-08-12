import { PrismaProfileRepository } from './prisma-profile.repository.js';
import { USER_IDENTITY_SELECT } from './prisma-profile.includes.js';
import type { PrismaService } from '../../../../core/database/prisma.service.js';

/**
 * `findDetailByUserId` was one query six levels deep. It is now three reads,
 * and the two things that could go wrong with that split are what these cover:
 * running a branch that does not apply, and returning a differently shaped
 * object than the caller had before.
 *
 * `GetProfileUseCase` spreads this row straight into the response, so its shape
 * *is* the response body.
 */

interface MockPrisma {
  user: { findUnique: jest.Mock };
  teacher: { findUnique: jest.Mock };
  student: { findUnique: jest.Mock };
}

const IDENTITY = {
  id: 'user-1',
  identifier: 'guru01',
  userRoles: [],
  profile: { name: 'Ahmad' },
};

function build(): { repo: PrismaProfileRepository; prisma: MockPrisma } {
  const prisma: MockPrisma = {
    user: { findUnique: jest.fn() },
    teacher: { findUnique: jest.fn() },
    student: { findUnique: jest.fn() },
  };
  return {
    repo: new PrismaProfileRepository(prisma as unknown as PrismaService),
    prisma,
  };
}

describe('PrismaProfileRepository.findDetailByUserId', () => {
  it('does not read the student branch for a teacher', async () => {
    const { repo, prisma } = build();
    prisma.user.findUnique.mockResolvedValue({
      ...IDENTITY,
      teacher: { id: 'teacher-1' },
      student: null,
    });
    prisma.teacher.findUnique.mockResolvedValue({ id: 'teacher-1' });

    const result = await repo.findDetailByUserId('user-1');

    expect(prisma.teacher.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.student.findUnique).not.toHaveBeenCalled();
    expect(result?.teacher).toEqual({ id: 'teacher-1' });
    expect(result?.student).toBeNull();
  });

  it('does not read the teacher branch for a student', async () => {
    const { repo, prisma } = build();
    prisma.user.findUnique.mockResolvedValue({
      ...IDENTITY,
      teacher: null,
      student: { id: 'student-1' },
    });
    prisma.student.findUnique.mockResolvedValue({ id: 'student-1' });

    const result = await repo.findDetailByUserId('user-1');

    expect(prisma.student.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.teacher.findUnique).not.toHaveBeenCalled();
    expect(result?.student).toEqual({ id: 'student-1' });
    expect(result?.teacher).toBeNull();
  });

  it('reads neither branch for a user who is neither', async () => {
    const { repo, prisma } = build();
    prisma.user.findUnique.mockResolvedValue({
      ...IDENTITY,
      teacher: null,
      student: null,
    });

    await repo.findDetailByUserId('user-1');

    expect(prisma.teacher.findUnique).not.toHaveBeenCalled();
    expect(prisma.student.findUnique).not.toHaveBeenCalled();
  });

  /**
   * The composed row replaces two keys rather than appending them, so the
   * response body keeps the field order it had as a single query. Asserting
   * the order, not just the membership, is the point: `{ ...user, teacher }`
   * and `{ teacher, ...user }` differ only here.
   */
  it('returns the fields in the order the single query produced them', async () => {
    const { repo, prisma } = build();
    prisma.user.findUnique.mockResolvedValue({
      ...IDENTITY,
      teacher: { id: 'teacher-1' },
      student: null,
    });
    prisma.teacher.findUnique.mockResolvedValue({ id: 'teacher-1' });

    const result = await repo.findDetailByUserId('user-1');

    expect(Object.keys(result!)).toEqual(Object.keys(USER_IDENTITY_SELECT));
  });

  it('returns null for a user that does not exist', async () => {
    const { repo, prisma } = build();
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(repo.findDetailByUserId('nobody')).resolves.toBeNull();
    expect(prisma.teacher.findUnique).not.toHaveBeenCalled();
  });

  it('asks for the identity by the shared projection', async () => {
    const { repo, prisma } = build();
    prisma.user.findUnique.mockResolvedValue(null);

    await repo.findDetailByUserId('user-1');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: USER_IDENTITY_SELECT,
    });
  });
});
