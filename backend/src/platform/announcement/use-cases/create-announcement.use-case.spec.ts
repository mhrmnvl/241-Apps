import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IClassroomRepository } from '../../../academic/classroom/index.js';
import { CreateAnnouncementDto } from '../dto/request/create-announcement.dto.js';
import { IAnnouncementRepository } from '../domain/interfaces/announcement-repository.interface.js';
import { CreateAnnouncementUseCase } from './create-announcement.use-case.js';

describe('CreateAnnouncementUseCase', () => {
  let useCase: CreateAnnouncementUseCase;

  const mockRepository = {
    create: jest.fn(),
  };

  const mockClassroomRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAnnouncementUseCase,
        { provide: IAnnouncementRepository, useValue: mockRepository },
        { provide: IClassroomRepository, useValue: mockClassroomRepository },
      ],
    }).compile();

    useCase = module.get<CreateAnnouncementUseCase>(CreateAnnouncementUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockAnnouncement = {
      id: 'ann-1',
      title: 'Jadwal Ujian Akhir Semester',
      description: 'End-of-term exams run from 20-25 May 2025.',
      date: new Date('2025-05-20'),
      classrooms: [],
    };

    it('should create a school-wide announcement (no classroomIds)', async () => {
      const dto: CreateAnnouncementDto = {
        title: 'Jadwal Ujian Akhir Semester',
        description: 'End-of-term exams run from 20-25 May 2025.',
        date: '2025-05-20',
      };
      mockRepository.create.mockResolvedValue(mockAnnouncement);

      const result = await useCase.execute(dto);

      expect(mockClassroomRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: dto.description,
        date: new Date(dto.date),
        classroomIds: undefined,
      });
      expect(result).toEqual(mockAnnouncement);
    });

    it('should create a classroom-specific announcement when classroomIds are valid', async () => {
      const classroomId = '550e8400-e29b-41d4-a716-446655440001';
      const dto: CreateAnnouncementDto = {
        title: 'Jadwal Ujian Akhir Semester',
        description: 'End-of-term exams run from 20-25 May 2025.',
        date: '2025-05-20',
        classroomIds: [classroomId],
      };
      mockClassroomRepository.findById.mockResolvedValue({
        id: classroomId,
        name: 'X IPA 1',
      });
      mockRepository.create.mockResolvedValue({
        ...mockAnnouncement,
        classrooms: [{ id: classroomId }],
      });

      const result = await useCase.execute(dto);

      expect(mockClassroomRepository.findById).toHaveBeenCalledWith(
        classroomId,
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: dto.description,
        date: new Date(dto.date),
        classroomIds: [classroomId],
      });
      expect(result.classrooms).toHaveLength(1);
    });

    it('should throw NotFoundException when a classroomId does not exist', async () => {
      const invalidClassroomId = '550e8400-e29b-41d4-a716-000000000000';
      const dto: CreateAnnouncementDto = {
        title: 'Jadwal Ujian Akhir Semester',
        description: 'End-of-term exams run from 20-25 May 2025.',
        date: '2025-05-20',
        classroomIds: [invalidClassroomId],
      };
      mockClassroomRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should validate each classroomId and throw on first invalid one', async () => {
      const validId = '550e8400-e29b-41d4-a716-446655440001';
      const invalidId = '550e8400-e29b-41d4-a716-000000000000';
      const dto: CreateAnnouncementDto = {
        title: 'Jadwal Ujian Akhir Semester',
        description: 'End-of-term exams run from 20-25 May 2025.',
        date: '2025-05-20',
        classroomIds: [validId, invalidId],
      };
      mockClassroomRepository.findById
        .mockResolvedValueOnce({ id: validId })
        .mockResolvedValueOnce(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });
});
