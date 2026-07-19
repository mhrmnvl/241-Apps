import { Test, TestingModule } from '@nestjs/testing';
import { CreateClassroomUseCase } from '../use-cases/create-classroom.use-case.js';
import { DeleteClassroomUseCase } from '../use-cases/delete-classroom.use-case.js';
import { GetClassroomByIdUseCase } from '../use-cases/get-classroom-by-id.use-case.js';
import { GetClassroomsUseCase } from '../use-cases/get-classrooms.use-case.js';
import { UpdateClassroomUseCase } from '../use-cases/update-classroom.use-case.js';
import { ClassroomController } from './classroom.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('ClassroomController', () => {
  let controller: ClassroomController;

  const mockGetClassesUC = { execute: jest.fn() };
  const mockGetClassroomByIdUC = { execute: jest.fn() };
  const mockCreateClassroomUC = { execute: jest.fn() };
  const mockUpdateClassroomUC = { execute: jest.fn() };
  const mockDeleteClassroomUC = { execute: jest.fn() };

  const mockUser: AuthenticatedUser = {
    id: 'usr-1',
    sub: 'usr-1',
    identifier: 'admin',
    sessionId: 'sess-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassroomController],
      providers: [
        { provide: GetClassroomsUseCase, useValue: mockGetClassesUC },
        { provide: GetClassroomByIdUseCase, useValue: mockGetClassroomByIdUC },
        { provide: CreateClassroomUseCase, useValue: mockCreateClassroomUC },
        { provide: UpdateClassroomUseCase, useValue: mockUpdateClassroomUC },
        { provide: DeleteClassroomUseCase, useValue: mockDeleteClassroomUC },
      ],
    }).compile();

    controller = module.get<ClassroomController>(ClassroomController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetClassroomsUseCase', async () => {
      const query = { page: 1, limit: 10 };
      const expected = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockGetClassesUC.execute.mockResolvedValue(expected);

      const result = await controller.findAll(mockUser, query);

      expect(mockGetClassesUC.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetClassroomByIdUseCase', async () => {
      mockGetClassroomByIdUC.execute.mockResolvedValue({ id: 'cls-1' });

      const result = await controller.findOne(mockUser, 'cls-1');

      expect(mockGetClassroomByIdUC.execute).toHaveBeenCalledWith('cls-1');
      expect(result).toEqual({ id: 'cls-1' });
    });
  });

  describe('create', () => {
    it('should delegate to CreateClassroomUseCase', async () => {
      const dto = {
        curriculumId: 'c',
        academicYearId: 'a',
        classroomLevelId: 'lvl-7',
        code: 'VII-A',
        name: 'Awesome',
        capacity: 30,
      };
      mockCreateClassroomUC.execute.mockResolvedValue({ id: 'new', ...dto });

      await controller.create(dto, mockUser);

      expect(mockCreateClassroomUC.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateClassroomUseCase', async () => {
      const dto = { name: 'B' };
      mockUpdateClassroomUC.execute.mockResolvedValue({
        id: 'cls-1',
        name: 'B',
      });

      await controller.update(mockUser, 'cls-1', dto);

      expect(mockUpdateClassroomUC.execute).toHaveBeenCalledWith('cls-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteClassroomUseCase', async () => {
      mockDeleteClassroomUC.execute.mockResolvedValue(undefined);

      await controller.remove(mockUser, 'cls-1');

      expect(mockDeleteClassroomUC.execute).toHaveBeenCalledWith('cls-1');
    });
  });
});
