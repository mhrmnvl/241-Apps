import { BadRequestException } from '@nestjs/common';
import { CreateAcademicCalendarUseCase } from './create-academic-calendar.use-case.js';
import { IAcademicCalendarRepository } from '../domain/interfaces/academic-calendar-repository.interface.js';
import { IAcademicYearRepository } from '../../academic-year/index.js';
import { ISemesterRepository } from '../../semester/index.js';
import { IClassroomRepository } from '../../classroom/domain/interfaces/classroom-repository.interface.js';

/**
 * Hours on a calendar entry, and the entries that have none.
 *
 * The calendar measures days — a term is July to December, a holiday is the
 * 17th — and an activity is the exception that also names a clock time. So the
 * hours are optional, which makes "half of them" the state worth guarding: an
 * entry with a start and no end renders as "08:00 – " and asks the reader a
 * question the data cannot answer.
 */
describe('calendar hours', () => {
  const BASE = {
    academicYearId: 'ay-1',
    title: 'Rapat wali murid',
    typeId: 'type-1',
    startDate: '2026-09-08',
    endDate: '2026-09-08',
  };

  function makeUseCase() {
    const create = jest.fn().mockResolvedValue({ id: 'cal-1' });
    const useCase = new CreateAcademicCalendarUseCase(
      { create } as unknown as IAcademicCalendarRepository,
      {
        findById: jest.fn().mockResolvedValue({ id: 'ay-1' }),
      } as unknown as IAcademicYearRepository,
      { findById: jest.fn() } as unknown as ISemesterRepository,
      { findById: jest.fn() } as unknown as IClassroomRepository,
    );
    return { useCase, create };
  }

  it('stores the hours an activity names', async () => {
    const { useCase, create } = makeUseCase();

    await useCase.execute({ ...BASE, startTime: '08:00', endTime: '12:00' });

    const written = create.mock.calls[0][0] as {
      startTime: Date;
      endTime: Date;
    };
    expect(written.startTime.toISOString()).toContain('08:00:00');
    expect(written.endTime.toISOString()).toContain('12:00:00');
  });

  /**
   * The ordinary entry. Nulls rather than absent keys, so a later edit that
   * clears the hours writes the same shape the create did.
   */
  it('leaves an entry measured in days without hours', async () => {
    const { useCase, create } = makeUseCase();

    await useCase.execute(BASE);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ startTime: null, endTime: null }),
    );
  });

  it('refuses a start with no end', async () => {
    const { useCase, create } = makeUseCase();

    await expect(
      useCase.execute({ ...BASE, startTime: '08:00' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('refuses an end with no start', async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute({ ...BASE, endTime: '12:00' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses an end that is not after the start', async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute({ ...BASE, startTime: '12:00', endTime: '08:00' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses a zero-length span', async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute({ ...BASE, startTime: '08:00', endTime: '08:00' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
