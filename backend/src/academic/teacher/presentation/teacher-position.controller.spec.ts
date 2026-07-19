import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateTeacherPositionDto,
  UpdateTeacherPositionDto,
} from '../dto/request/teacher-position.request.dto.js';
import { TeacherPositionUseCase } from '../use-cases/teacher-position.use-case.js';
import { TeacherPositionsController } from './teacher-position.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('TeacherPositionsController', () => {
  let controller: TeacherPositionsController;

  const mockPositionUseCase = {
    findAll: jest.fn(),
    assign: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid',
    sub: 'user-uuid',
    identifier: 'admin',
    sessionId: 'session-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeacherPositionsController],
      providers: [
        { provide: TeacherPositionUseCase, useValue: mockPositionUseCase },
      ],
    }).compile();

    controller = module.get<TeacherPositionsController>(
      TeacherPositionsController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to TeacherPositionUseCase.findAll with teacherId', async () => {
      const id = 'emp-1';
      const expected = [{ id: 'link-1', position: { name: 'Guru Kelas' } }];
      mockPositionUseCase.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(id, mockUser);

      expect(mockPositionUseCase.findAll).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('assign', () => {
    it('should delegate to TeacherPositionUseCase.assign with teacherId and dto', async () => {
      const id = 'emp-1';
      const dto: CreateTeacherPositionDto = {
        positionId: '550e8400-e29b-41d4-a716-446655440007',
        hireDate: '2020-01-01',
      };
      const expected = { id: 'link-new', positionId: dto.positionId };
      mockPositionUseCase.assign.mockResolvedValue(expected);

      const result = await controller.assign(id, dto, mockUser);

      expect(mockPositionUseCase.assign).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to TeacherPositionUseCase.update with ids and dto', async () => {
      const id = 'emp-1';
      const positionId = 'link-1';
      const dto: UpdateTeacherPositionDto = { isPrimary: true };
      const expected = { id: 'link-1', isPrimary: true };
      mockPositionUseCase.update.mockResolvedValue(expected);

      const result = await controller.update(id, positionId, dto, mockUser);

      expect(mockPositionUseCase.update).toHaveBeenCalledWith(
        id,
        positionId,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to TeacherPositionUseCase.remove with ids', async () => {
      const id = 'emp-1';
      const positionId = 'link-1';
      mockPositionUseCase.remove.mockResolvedValue(undefined);

      await controller.remove(id, positionId, mockUser);

      expect(mockPositionUseCase.remove).toHaveBeenCalledWith(id, positionId);
    });
  });
});
