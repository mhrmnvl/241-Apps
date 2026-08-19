import { Test, TestingModule } from '@nestjs/testing';
import { CreateSubjectDto } from '../dto/request/create-subject.dto.js';
import { SubjectQueryDto } from '../dto/request/subject-query.dto.js';
import { UpdateSubjectDto } from '../dto/request/update-subject.dto.js';
import { CreateSubjectUseCase } from '../use-cases/create-subject.use-case.js';
import { DeleteSubjectUseCase } from '../use-cases/delete-subject.use-case.js';
import { GetSubjectByIdUseCase } from '../use-cases/get-subject-by-id.use-case.js';
import { GetSubjectsUseCase } from '../use-cases/get-subjects.use-case.js';
import { UpdateSubjectUseCase } from '../use-cases/update-subject.use-case.js';
import { SubjectController } from './subject.controller.js';

describe('SubjectController', () => {
  let controller: SubjectController;

  const mockGetSubjectsService = { execute: jest.fn() };
  const mockGetSubjectByIdService = { execute: jest.fn() };
  const mockCreateSubjectService = { execute: jest.fn() };
  const mockUpdateSubjectService = { execute: jest.fn() };
  const mockDeleteSubjectService = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectController],
      providers: [
        { provide: GetSubjectsUseCase, useValue: mockGetSubjectsService },
        { provide: GetSubjectByIdUseCase, useValue: mockGetSubjectByIdService },
        { provide: CreateSubjectUseCase, useValue: mockCreateSubjectService },
        { provide: UpdateSubjectUseCase, useValue: mockUpdateSubjectService },
        { provide: DeleteSubjectUseCase, useValue: mockDeleteSubjectService },
      ],
    }).compile();

    controller = module.get<SubjectController>(SubjectController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetSubjectsUseCase with query', async () => {
      const query: SubjectQueryDto = { page: 1, limit: 10, search: 'Math' };
      const expected = {
        data: [{ id: 'sub-1', name: 'Mathematics' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockGetSubjectsService.execute.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(mockGetSubjectsService.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetSubjectByIdUseCase with id', async () => {
      const id = 'sub-1';
      const expected = { id: 'sub-1', name: 'Mathematics' };
      mockGetSubjectByIdService.execute.mockResolvedValue(expected);

      const result = await controller.findOne(id);

      expect(mockGetSubjectByIdService.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should delegate to CreateSubjectUseCase with dto', async () => {
      const dto: CreateSubjectDto = {
        name: 'Chemistry',
        code: 'KIM',
      };
      const expected = { id: 'sub-new', name: 'Chemistry' };
      mockCreateSubjectService.execute.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockCreateSubjectService.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateSubjectUseCase with id and dto', async () => {
      const id = 'sub-1';
      const dto: UpdateSubjectDto = { name: 'Advanced Mathematics' };
      const expected = { id: 'sub-1', name: 'Advanced Mathematics' };
      mockUpdateSubjectService.execute.mockResolvedValue(expected);

      const result = await controller.update(id, dto);

      expect(mockUpdateSubjectService.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteSubjectUseCase with id', async () => {
      const id = 'sub-1';
      mockDeleteSubjectService.execute.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(mockDeleteSubjectService.execute).toHaveBeenCalledWith(id);
    });
  });
});
