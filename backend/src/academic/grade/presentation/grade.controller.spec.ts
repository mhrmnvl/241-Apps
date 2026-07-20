import { Test, TestingModule } from '@nestjs/testing';
import { CreateGradeUseCase } from '../use-cases/create-grade.use-case.js';
import { DeleteGradeUseCase } from '../use-cases/delete-grade.use-case.js';
import { GetGradeByIdUseCase } from '../use-cases/get-grade-by-id.use-case.js';
import { GetGradesUseCase } from '../use-cases/get-grades.use-case.js';
import { UpdateGradeUseCase } from '../use-cases/update-grade.use-case.js';
import { GradesController } from './grade.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('GradesController', () => {
  let controller: GradesController;

  const mockGetAll = { execute: jest.fn() };
  const mockGetById = { execute: jest.fn() };
  const mockCreate = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GradesController],
      providers: [
        { provide: GetGradesUseCase, useValue: mockGetAll },
        { provide: GetGradeByIdUseCase, useValue: mockGetById },
        { provide: CreateGradeUseCase, useValue: mockCreate },
        { provide: UpdateGradeUseCase, useValue: mockUpdate },
        { provide: DeleteGradeUseCase, useValue: mockDelete },
      ],
    }).compile();

    controller = module.get<GradesController>(GradesController);
    jest.clearAllMocks();
  });

  const mockUser: AuthenticatedUser = {
    id: 'usr-1',
    sub: 'usr-1',
    identifier: 'admin',
    sessionId: 'sess-1',
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getAll use case', async () => {
    const query = { page: 1, limit: 10 };
    mockGetAll.execute.mockResolvedValue({ data: [], total: 0 });

    await controller.findAll(mockUser, query);

    expect(mockGetAll.execute).toHaveBeenCalledWith(query);
  });

  it('should call getById use case', async () => {
    const level = { id: 'lvl-1', level: 7, name: 'VII' };
    mockGetById.execute.mockResolvedValue(level);

    const result = await controller.findById(mockUser, 'lvl-1');

    expect(mockGetById.execute).toHaveBeenCalledWith('lvl-1');
    expect(result).toEqual(level);
  });

  it('should call create use case', async () => {
    const dto = { level: 10, name: 'X' };
    const created = { id: 'lvl-new', ...dto };
    mockCreate.execute.mockResolvedValue(created);

    const result = await controller.create(mockUser, dto);

    expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(created);
  });

  it('should call update use case', async () => {
    const dto = { name: 'X-Updated' };
    mockUpdate.execute.mockResolvedValue({ id: 'lvl-1', ...dto });

    await controller.update(mockUser, 'lvl-1', dto);

    expect(mockUpdate.execute).toHaveBeenCalledWith('lvl-1', dto);
  });

  it('should call delete use case', async () => {
    mockDelete.execute.mockResolvedValue(undefined);

    await controller.remove(mockUser, 'lvl-1');

    expect(mockDelete.execute).toHaveBeenCalledWith('lvl-1');
  });
});
