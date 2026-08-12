import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAnnouncementRepository } from '../domain/interfaces/announcement-repository.interface.js';
import { GetAnnouncementByIdUseCase } from './get-announcement-by-id.use-case.js';

describe('GetAnnouncementByIdUseCase', () => {
  let useCase: GetAnnouncementByIdUseCase;

  const mockRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAnnouncementByIdUseCase,
        { provide: IAnnouncementRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetAnnouncementByIdUseCase>(
      GetAnnouncementByIdUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'ann-1';

    it('should return an announcement by ID', async () => {
      const mockAnnouncement = {
        id: 'ann-1',
        title: 'Jadwal Ujian Akhir Semester',
        description: 'End-of-term exams run from 20-25 May 2025.',
        date: new Date('2025-05-20'),
        classrooms: [],
      };
      mockRepository.findById.mockResolvedValue(mockAnnouncement);

      const result = await useCase.execute(id);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockAnnouncement);
    });

    it('should throw NotFoundException when ID not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
    });
  });
});
