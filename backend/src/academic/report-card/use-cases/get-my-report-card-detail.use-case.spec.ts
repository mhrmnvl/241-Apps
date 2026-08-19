import { NotFoundException } from '@nestjs/common';
import { GetMyReportCardDetailUseCase } from './get-my-report-card-detail.use-case.js';
import { GetReportCardDetailUseCase } from './get-report-card-detail.use-case.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';

/**
 * Opening one's own report card, and nobody else's.
 *
 * The id comes from the screen, which means it comes from whoever is holding
 * the screen. `report-cards.read-own` says the caller may open *theirs*; the
 * only thing that makes that true is this check.
 *
 * Every refusal is the same refusal on purpose. A "forbidden" where a
 * classmate's id was named and a "not found" where none exists would let
 * someone learn which ids are real cards by the shape of the answer.
 */
describe('GetMyReportCardDetailUseCase', () => {
  const CARD_ID = 'card-1';
  const MINE = 'student-mine';
  const THEIRS = 'student-theirs';

  function makeUseCase(options: {
    studentId: string | null;
    owner?: string;
    isPublished?: boolean;
  }) {
    const detail = jest.fn().mockResolvedValue({
      id: CARD_ID,
      isPublished: options.isPublished ?? true,
      attendance: { SICK: 1, EXCUSED: 0, ABSENT: 2 },
    });

    const findOwnership = jest
      .fn()
      .mockResolvedValue(
        options.owner
          ? { enrollmentId: 'enr-1', studentId: options.owner }
          : null,
      );

    const useCase = new GetMyReportCardDetailUseCase(
      { execute: detail } as unknown as GetReportCardDetailUseCase,
      { findOwnership } as unknown as IReportCardRepository,
      {
        findStudentIdByUserId: jest.fn().mockResolvedValue(options.studentId),
      },
    );

    return { useCase, detail, findOwnership };
  }

  it('returns the caller’s own published card', async () => {
    const { useCase } = makeUseCase({ studentId: MINE, owner: MINE });

    const result = await useCase.execute(CARD_ID, 'user-1');

    expect(result.attendance).toEqual({ SICK: 1, EXCUSED: 0, ABSENT: 2 });
  });

  it('refuses a card belonging to another student', async () => {
    const { useCase } = makeUseCase({ studentId: MINE, owner: THEIRS });

    await expect(useCase.execute(CARD_ID, 'user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  /**
   * The card is never even loaded. Refusing after reading it would work, and
   * would leave the row one careless edit away from being returned.
   */
  it('does not read a card it is about to refuse', async () => {
    const { useCase, detail } = makeUseCase({
      studentId: MINE,
      owner: THEIRS,
    });

    await expect(useCase.execute(CARD_ID, 'user-1')).rejects.toThrow();
    expect(detail).not.toHaveBeenCalled();
  });

  /**
   * `report-cards.read-own` is defined as published-only: a draft is a card the
   * school has not yet stood behind, and the list this is opened from returns
   * nothing else.
   */
  it('refuses an unpublished card even when it is the caller’s own', async () => {
    const { useCase } = makeUseCase({
      studentId: MINE,
      owner: MINE,
      isPublished: false,
    });

    await expect(useCase.execute(CARD_ID, 'user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  /**
   * An account with no student record — a teacher who somehow holds the
   * permission, a user mid-provisioning. Nothing of theirs exists, and the
   * absence must not widen into an unscoped read.
   */
  it('refuses when the caller has no student record', async () => {
    const { useCase, findOwnership } = makeUseCase({
      studentId: null,
      owner: MINE,
    });

    await expect(useCase.execute(CARD_ID, 'user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(findOwnership).not.toHaveBeenCalled();
  });

  it('refuses a card that does not exist, in the same words', async () => {
    const missing = makeUseCase({ studentId: MINE });
    const foreign = makeUseCase({ studentId: MINE, owner: THEIRS });

    const first = await missing.useCase
      .execute(CARD_ID, 'user-1')
      .catch((e: Error) => e.message);
    const second = await foreign.useCase
      .execute(CARD_ID, 'user-1')
      .catch((e: Error) => e.message);

    expect(first).toEqual(second);
  });
});
