import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomRepository } from '../../../academic/classroom/index.js';
import { UpdateAnnouncementDto } from '../dto/request/update-announcement.dto.js';
import { AnnouncementRepository } from '../repositories/announcement.repository.js';
import { UpdateAnnouncementUseCase } from './update-announcement.use-case.js';

describe('UpdateAnnouncementUseCase', () => {
  let useCase: UpdateAnnouncementUseCase;

  const mockRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockClassroomRepo = {
    findById: jest.fn(),
  };

  const mockExisting = {
    id: 'ann-1',
    title: 'Jadwal Ujian Akhir Semester',
    description:
      'Ujian akhir semester genap dilaksanakan pada tanggal 20-25 Mei 2025.',
    date: new Date('2025-05-20'),
    classrooms: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAnnouncementUseCase,
        { provide: AnnouncementRepository, useValue: mockRepository },
        { provide: ClassroomRepository, useValue: mockClassroomRepo },
      ],
    }).compile();

    useCase = module.get<UpdateAnnouncementUseCase>(UpdateAnnouncementUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'ann-1';

    it('should update title only (no classroomIds)', async () => {
      const dto: UpdateAnnouncementDto = { title: 'Updated Title' };
      const updated = { ...mockExisting, title: 'Updated Title' };

      mockRepository.findById.mockResolvedValue(mockExisting);
      mockRepository.update.mockResolvedValue(updated);

      const result = await useCase.execute(id, dto);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(mockClassroomRepo.findById).not.toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalledWith(
        id,
        { title: 'Updated Title' },
        undefined,
      );
      expect(result).toEqual(updated);
    });

    it('should update with date conversion when date is provided', async () => {
      const dto: UpdateAnnouncementDto = { date: '2025-06-01' };

      mockRepository.findById.mockResolvedValue(mockExisting);
      mockRepository.update.mockResolvedValue({
        ...mockExisting,
        date: new Date('2025-06-01'),
      });

      await useCase.execute(id, dto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        id,
        { date: new Date('2025-06-01') },
        undefined,
      );
    });

    it('should validate classroomIds when updating class targets', async () => {
      const classroomId = '550e8400-e29b-41d4-a716-446655440001';
      const dto: UpdateAnnouncementDto = { classroomIds: [classroomId] };

      mockRepository.findById.mockResolvedValue(mockExisting);
      mockClassroomRepo.findById.mockResolvedValue({
        id: classroomId,
        name: 'X IPA 1',
      });
      mockRepository.update.mockResolvedValue(mockExisting);

      await useCase.execute(id, dto);

      expect(mockClassroomRepo.findById).toHaveBeenCalledWith(classroomId);
      expect(mockRepository.update).toHaveBeenCalledWith(id, {}, [classroomId]);
    });

    it('should throw NotFoundException when announcement ID not found', async () => {
      const dto: UpdateAnnouncementDto = { title: 'Updated Title' };
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when a classroomId in update does not exist', async () => {
      const invalidId = '550e8400-e29b-41d4-a716-000000000000';
      const dto: UpdateAnnouncementDto = { classroomIds: [invalidId] };

      mockRepository.findById.mockResolvedValue(mockExisting);
      mockClassroomRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });
});
