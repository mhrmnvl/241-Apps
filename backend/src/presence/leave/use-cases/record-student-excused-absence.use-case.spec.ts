import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ILeaveRepository } from '../domain/interfaces/leave-repository.interface.js';
import { WorkingDayExpanderService } from '../services/working-day-expander.service.js';
import { RecordStudentExcusedAbsenceUseCase } from './record-student-excused-absence.use-case.js';

const STUDENT = '11111111-1111-4111-8111-111111111111';
const TEACHER = '22222222-2222-4222-8222-222222222222';

const SAKIT_SISWA = {
  id: 'type-1',
  name: 'Sakit (Siswa)',
  treatment: 'ON_LEAVE',
  appliesTo: 'STUDENT',
  isActive: true,
};

function dto(overrides: Record<string, unknown> = {}) {
  return {
    studentUserId: STUDENT,
    leaveTypeId: 'type-1',
    startDate: '2026-09-01',
    reason: 'Sick note from the parents',
    ...overrides,
  };
}

describe('RecordStudentExcusedAbsenceUseCase', () => {
  let useCase: RecordStudentExcusedAbsenceUseCase;
  const leave = {
    findTypeById: jest.fn(),
    submit: jest.fn(),
    approve: jest.fn(),
  };
  const expander = { expand: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordStudentExcusedAbsenceUseCase,
        { provide: ILeaveRepository, useValue: leave },
        { provide: WorkingDayExpanderService, useValue: expander },
      ],
    }).compile();

    useCase = module.get(RecordStudentExcusedAbsenceUseCase);
    jest.clearAllMocks();
    leave.findTypeById.mockResolvedValue(SAKIT_SISWA);
    leave.submit.mockResolvedValue({ id: 'req-1' });
    leave.approve.mockResolvedValue({ id: 'req-1', status: 'APPROVED' });
    expander.expand.mockResolvedValue([new Date('2026-09-01T00:00:00.000Z')]);
  });

  // Recorded and approved in one step: the wali kelas *is* the decision.
  it('files and approves in a single action', async () => {
    await useCase.execute(dto(), TEACHER);

    expect(leave.submit).toHaveBeenCalled();
    expect(leave.approve).toHaveBeenCalledWith(
      'req-1',
      { approverId: TEACHER, decidedAt: expect.any(Date) },
      'ON_LEAVE',
      'STUDENT',
    );
  });

  // Attributability: the teacher who recorded it is on the record.
  it('records the teacher as the approver', async () => {
    await useCase.execute(dto(), TEACHER);

    const [, decision] = leave.approve.mock.calls[0] as [
      string,
      { approverId: string },
    ];
    expect(decision.approverId).toBe(TEACHER);
  });

  it('treats a single-day note as one day', async () => {
    await useCase.execute(dto(), TEACHER);

    const [input] = leave.submit.mock.calls[0] as [
      { startDate: Date; endDate: Date },
    ];
    expect(input.startDate).toEqual(input.endDate);
  });

  it('accepts an explicit range', async () => {
    expander.expand.mockResolvedValue([
      new Date('2026-09-01T00:00:00.000Z'),
      new Date('2026-09-02T00:00:00.000Z'),
    ]);

    await useCase.execute(dto({ endDate: '2026-09-02' }), TEACHER);

    expect(leave.submit).toHaveBeenCalledWith(
      expect.objectContaining({ workingDayCount: 2 }),
    );
  });

  // Employee leave types have quotas and approval rules that make no sense for
  // a pupil, and would land on the wrong recap.
  it('refuses an employee leave type', async () => {
    leave.findTypeById.mockResolvedValue({
      ...SAKIT_SISWA,
      appliesTo: 'EMPLOYEE',
      name: 'Cuti Tahunan',
    });

    await expect(useCase.execute(dto(), TEACHER)).rejects.toThrow(
      /not a student leave type/,
    );
    expect(leave.submit).not.toHaveBeenCalled();
  });

  it('refuses a range with no school days', async () => {
    expander.expand.mockResolvedValue([]);

    await expect(useCase.execute(dto(), TEACHER)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('refuses a deactivated type', async () => {
    leave.findTypeById.mockResolvedValue({ ...SAKIT_SISWA, isActive: false });

    await expect(useCase.execute(dto(), TEACHER)).rejects.toThrow(/not found/);
  });

  // The same path employee leave takes, so the day lands in DailyPresence and
  // the recap counts it identically.
  it('records the student as the requester, not the teacher', async () => {
    await useCase.execute(dto(), TEACHER);

    expect(leave.submit).toHaveBeenCalledWith(
      expect.objectContaining({ requesterId: STUDENT }),
    );
  });
});
