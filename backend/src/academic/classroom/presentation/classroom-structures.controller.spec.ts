import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomStructureQueryDto } from '../dto/classroom-structure-query.dto.js';
import { CreateClassroomStructureDto } from '../dto/create-classroom-structure.dto.js';
import { UpdateClassroomStructureDto } from '../dto/update-classroom-structure.dto.js';
import { CreateClassroomStructureUseCase } from '../use-cases/create-classroom-structure.use-case.js';
import { DeleteClassroomStructureUseCase } from '../use-cases/delete-classroom-structure.use-case.js';
import { GetClassroomStructuresUseCase } from '../use-cases/get-classroom-structures.use-case.js';
import { UpdateClassroomStructureUseCase } from '../use-cases/update-classroom-structure.use-case.js';
import { ClassroomStructuresController } from './classroom-structures.controller.js';

describe('ClassroomStructuresController', () => {
  let controller: ClassroomStructuresController;

  const mockGetAll = { execute: jest.fn() };
  const mockCreate = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassroomStructuresController],
      providers: [
        { provide: GetClassroomStructuresUseCase, useValue: mockGetAll },
        { provide: CreateClassroomStructureUseCase, useValue: mockCreate },
        { provide: UpdateClassroomStructureUseCase, useValue: mockUpdate },
        { provide: DeleteClassroomStructureUseCase, useValue: mockDelete },
      ],
    }).compile();

    controller = module.get<ClassroomStructuresController>(
      ClassroomStructuresController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetClassroomStructuresUseCase', async () => {
      const query: ClassroomStructureQueryDto = { page: 1, limit: 10 };
      mockGetAll.execute.mockResolvedValue({ data: [] });
      const result = await controller.findAll(query);
      expect(mockGetAll.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data: [] });
    });
  });

  describe('create', () => {
    it('should delegate to CreateClassroomStructureUseCase', async () => {
      const dto: CreateClassroomStructureDto = {
        classroomId: 'cls-1',
        semesterId: 'sem-1',
        presidentId: 'stu-1',
      };
      mockCreate.execute.mockResolvedValue({ id: 'new' });
      await controller.create(dto);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateClassroomStructureUseCase', async () => {
      const dto: UpdateClassroomStructureDto = { presidentId: 'stu-2' };
      mockUpdate.execute.mockResolvedValue({ id: 'str-1' });
      await controller.update('str-1', dto);
      expect(mockUpdate.execute).toHaveBeenCalledWith('str-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteClassroomStructureUseCase', async () => {
      mockDelete.execute.mockResolvedValue(undefined);
      await controller.remove('str-1');
      expect(mockDelete.execute).toHaveBeenCalledWith('str-1');
    });
  });
});
