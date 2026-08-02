import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateClassroomDto } from '../dto/request/update-classroom.dto.js';
import { IClassroomRepository } from '../domain/interfaces/classroom-repository.interface.js';
import { UpdateClassroomUseCase } from './update-classroom.use-case.js';

describe('UpdateClassroomUseCase', () => {
  let useCase: UpdateClassroomUseCase;

  const mockRepository = {
    findById: jest.fn(),
    findDuplicate: jest.fn(),
    update: jest.fn(),
  };

  const existingClassroom = {
    id: 'cls-1',
    curriculumId: 'cur-1',
    academicYearId: 'ay-1',
    gradeId: 'lvl-7',
    code: 'VII-A',
    name: 'Kelas VII A',
    capacity: 30,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClassroomUseCase,
        { provide: IClassroomRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<UpdateClassroomUseCase>(UpdateClassroomUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update successfully when no name change', async () => {
      const dto: UpdateClassroomDto = { capacity: 35 };
      mockRepository.findById.mockResolvedValue(existingClassroom);
      mockRepository.update.mockResolvedValue({ ...existingClassroom, ...dto });

      const result = await useCase.execute('cls-1', dto);

      expect(mockRepository.findDuplicate).not.toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalledWith('cls-1', dto);
      expect(result.capacity).toBe(35);
    });

    it('should check duplicate when code changes', async () => {
      const dto: UpdateClassroomDto = { code: 'VII-B' };
      mockRepository.findById.mockResolvedValue(existingClassroom);
      mockRepository.findDuplicate.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue({
        ...existingClassroom,
        code: 'VII-B',
      });

      await useCase.execute('cls-1', dto);

      expect(mockRepository.findDuplicate).toHaveBeenCalled();
    });

    it('should throw ConflictException when duplicate found', async () => {
      const dto: UpdateClassroomDto = { code: 'VII-B' };
      mockRepository.findById.mockResolvedValue(existingClassroom);
      mockRepository.findDuplicate.mockResolvedValue({ id: 'cls-other' });

      await expect(useCase.execute('cls-1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when class not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('cls-missing', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
