import { Test, TestingModule } from '@nestjs/testing';
import { CreateCurriculumSubjectUseCase } from '../use-cases/create-curriculum-subject.use-case.js';
import { DeleteCurriculumSubjectUseCase } from '../use-cases/delete-curriculum-subject.use-case.js';
import { GetCurriculumSubjectByIdUseCase } from '../use-cases/get-curriculum-subject-by-id.use-case.js';
import { GetCurriculumSubjectsUseCase } from '../use-cases/get-curriculum-subjects.use-case.js';
import { UpdateCurriculumSubjectUseCase } from '../use-cases/update-curriculum-subject.use-case.js';
import { CurriculumSubjectController } from './curriculum-subject.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('CurriculumSubjectController', () => {
  let controller: CurriculumSubjectController;

  const mockGetAll = { execute: jest.fn() };
  const mockGetById = { execute: jest.fn() };
  const mockCreate = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid',
    sub: 'user-uuid',
    identifier: 'admin',
    sessionId: 'session-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurriculumSubjectController],
      providers: [
        { provide: GetCurriculumSubjectsUseCase, useValue: mockGetAll },
        { provide: GetCurriculumSubjectByIdUseCase, useValue: mockGetById },
        { provide: CreateCurriculumSubjectUseCase, useValue: mockCreate },
        { provide: UpdateCurriculumSubjectUseCase, useValue: mockUpdate },
        { provide: DeleteCurriculumSubjectUseCase, useValue: mockDelete },
      ],
    }).compile();

    controller = module.get<CurriculumSubjectController>(
      CurriculumSubjectController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetCurriculumSubjectsUseCase', async () => {
      const query = { page: 1, limit: 10 };
      mockGetAll.execute.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll(mockUser, query);

      expect(mockGetAll.execute).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetCurriculumSubjectByIdUseCase', async () => {
      mockGetById.execute.mockResolvedValue({ id: 'cs-1' });

      const result = await controller.findOne(mockUser, 'cs-1');

      expect(mockGetById.execute).toHaveBeenCalledWith('cs-1');
      expect(result).toEqual({ id: 'cs-1' });
    });
  });

  describe('create', () => {
    it('should delegate to CreateCurriculumSubjectUseCase', async () => {
      const dto = {
        curriculumId: 'c',
        subjectId: 's',
        hoursPerWeek: 4,
      };
      mockCreate.execute.mockResolvedValue({ id: 'new', ...dto });

      await controller.create(dto, mockUser);

      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateCurriculumSubjectUseCase', async () => {
      mockUpdate.execute.mockResolvedValue({ id: 'cs-1' });

      await controller.update(mockUser, 'cs-1', { hoursPerWeek: 6 });

      expect(mockUpdate.execute).toHaveBeenCalledWith('cs-1', {
        hoursPerWeek: 6,
      });
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteCurriculumSubjectUseCase', async () => {
      mockDelete.execute.mockResolvedValue(undefined);

      await controller.remove(mockUser, 'cs-1');

      expect(mockDelete.execute).toHaveBeenCalledWith('cs-1');
    });
  });
});
