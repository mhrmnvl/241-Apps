import { Test, TestingModule } from '@nestjs/testing';
import { ParentRelation } from '@prisma/client';
import { CreateStudentParentDto } from '../dto/create-student-parent.dto.js';
import { StudentParentQueryDto } from '../dto/student-parent-query.dto.js';
import { UpdateStudentParentDto } from '../dto/update-student-parent.dto.js';
import { CreateStudentParentUseCase } from '../use-cases/create-student-parent.use-case.js';
import { DeleteStudentParentUseCase } from '../use-cases/delete-student-parent.use-case.js';
import { GetStudentParentByIdUseCase } from '../use-cases/get-student-parent-by-id.use-case.js';
import { GetStudentParentsListUseCase } from '../use-cases/get-student-parents-list.use-case.js';
import { UpdateStudentParentUseCase } from '../use-cases/update-student-parent.use-case.js';
import { StudentParentController } from './student-parent.controller.js';

describe('StudentParentController', () => {
  let controller: StudentParentController;

  const mockGetStudentParentsListService = { execute: jest.fn() };
  const mockGetStudentParentByIdService = { execute: jest.fn() };
  const mockCreateStudentParentService = { execute: jest.fn() };
  const mockUpdateStudentParentService = { execute: jest.fn() };
  const mockDeleteStudentParentService = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentParentController],
      providers: [
        {
          provide: GetStudentParentsListUseCase,
          useValue: mockGetStudentParentsListService,
        },
        {
          provide: GetStudentParentByIdUseCase,
          useValue: mockGetStudentParentByIdService,
        },
        {
          provide: CreateStudentParentUseCase,
          useValue: mockCreateStudentParentService,
        },
        {
          provide: UpdateStudentParentUseCase,
          useValue: mockUpdateStudentParentService,
        },
        {
          provide: DeleteStudentParentUseCase,
          useValue: mockDeleteStudentParentService,
        },
      ],
    }).compile();

    controller = module.get<StudentParentController>(StudentParentController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetStudentParentsListUseCase with query', async () => {
      const query: StudentParentQueryDto = { page: 1, limit: 10 };
      const expected = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockGetStudentParentsListService.execute.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(mockGetStudentParentsListService.execute).toHaveBeenCalledWith(
        query,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetStudentParentByIdUseCase with id', async () => {
      const id = 'link-1';
      const expected = { id: 'link-1', relation: ParentRelation.FATHER };
      mockGetStudentParentByIdService.execute.mockResolvedValue(expected);

      const result = await controller.findOne(id);

      expect(mockGetStudentParentByIdService.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should delegate to CreateStudentParentUseCase with dto', async () => {
      const dto: CreateStudentParentDto = {
        studentId: '550e8400-e29b-41d4-a716-446655440001',
        parentId: '550e8400-e29b-41d4-a716-446655440003',
        relation: ParentRelation.MOTHER,
      };
      const expected = { id: 'link-new', ...dto };
      mockCreateStudentParentService.execute.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockCreateStudentParentService.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateStudentParentUseCase with id and dto', async () => {
      const id = 'link-1';
      const dto: UpdateStudentParentDto = { isPrimary: true };
      const expected = { id: 'link-1', isPrimary: true };
      mockUpdateStudentParentService.execute.mockResolvedValue(expected);

      const result = await controller.update(id, dto);

      expect(mockUpdateStudentParentService.execute).toHaveBeenCalledWith(
        id,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteStudentParentUseCase with id', async () => {
      const id = 'link-1';
      mockDeleteStudentParentService.execute.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(mockDeleteStudentParentService.execute).toHaveBeenCalledWith(id);
    });
  });
});
