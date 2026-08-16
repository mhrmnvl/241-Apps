import { ConflictException } from '@nestjs/common';
import { UpdateSemesterUseCase } from './update-semester.use-case.js';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';
import { IAcademicYearRepository } from '../../academic-year/index.js';

/**
 * A term with data in it does not move to another year.
 *
 * `PATCH /semesters/:id` accepted `academicYearId` and checked only that the
 * target year existed and the (year, type) pair was free. Enrolments, teaching
 * assignments, homeroom teachers, class structures and calendar entries all key
 * on `semesterId`, and report cards follow through the enrolment — so one
 * request moved a whole term into another academic year, with nothing on any
 * screen to show it had happened. On the development box that was 38
 * enrolments, 36 teaching assignments and 38 report cards.
 *
 * The design was never to re-point: `@@unique([academicYearId, typeId])` allows
 * one Ganjil and one Genap per year, and ADR-0004 defines rollover within a
 * year and promotion across years as the two transitions. This is the guard
 * that makes the design the only path.
 */
describe('UpdateSemesterUseCase — moving a semester between years', () => {
  const ID = 'sem-1';
  const CURRENT_YEAR = 'ay-2025';
  const CURRENT_TYPE = 'type-ganjil';

  function makeUseCase(options: { dependent?: string | null }) {
    const update = jest.fn().mockResolvedValue({ id: ID });
    const findFirstDependent = jest
      .fn()
      .mockResolvedValue(options.dependent ?? null);

    const useCase = new UpdateSemesterUseCase(
      {
        findById: jest.fn().mockResolvedValue({
          id: ID,
          academicYearId: CURRENT_YEAR,
          typeId: CURRENT_TYPE,
          startDate: null,
          endDate: null,
        }),
        findFirstDependent,
        findTypeById: jest.fn().mockResolvedValue({ id: 'type-genap' }),
        findByAcademicYearAndType: jest.fn().mockResolvedValue(null),
        update,
      } as unknown as ISemesterRepository,
      {
        findById: jest.fn().mockResolvedValue({ id: 'ay-2026' }),
      } as unknown as IAcademicYearRepository,
    );

    return { useCase, update, findFirstDependent };
  }

  it('refuses to change the academic year once the term holds data', async () => {
    const { useCase, update } = makeUseCase({
      dependent: 'student enrolments',
    });

    await expect(
      useCase.execute(ID, { academicYearId: 'ay-2026' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(update).not.toHaveBeenCalled();
  });

  it('refuses to change the term type once it holds data', async () => {
    const { useCase, update } = makeUseCase({
      dependent: 'teaching assignments',
    });

    await expect(
      useCase.execute(ID, { typeId: 'type-genap' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(update).not.toHaveBeenCalled();
  });

  /**
   * The refusal names what is in the way, so the person reading it knows which
   * screen to open. "Cannot update" would send them to us instead.
   */
  it('names what is holding it', async () => {
    const { useCase } = makeUseCase({ dependent: 'homeroom teachers' });

    const message = await useCase
      .execute(ID, { academicYearId: 'ay-2026' })
      .catch((error: Error) => error.message);

    expect(message).toContain('homeroom teachers');
  });

  it('allows the move while the term is still empty', async () => {
    const { useCase, update } = makeUseCase({ dependent: null });

    await useCase.execute(ID, { academicYearId: 'ay-2026' });

    expect(update).toHaveBeenCalled();
  });

  /**
   * Dates and the semester's own fields stay editable — only the two that
   * decide whose data this is are locked. A guard that froze the whole row
   * would send people to the database to fix a typo.
   */
  it('still allows editing dates on a term that holds data', async () => {
    const { useCase, update, findFirstDependent } = makeUseCase({
      dependent: 'student enrolments',
    });

    await useCase.execute(ID, {
      startDate: '2026-07-01',
      endDate: '2026-12-31',
    });

    expect(findFirstDependent).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalled();
  });

  /**
   * Sending the same year it already has is not a move. Refusing it would make
   * a form that submits every field unusable.
   */
  it('is not tripped by resubmitting the current values', async () => {
    const { useCase, update, findFirstDependent } = makeUseCase({
      dependent: 'student enrolments',
    });

    await useCase.execute(ID, {
      academicYearId: CURRENT_YEAR,
      typeId: CURRENT_TYPE,
    });

    expect(findFirstDependent).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalled();
  });
});
