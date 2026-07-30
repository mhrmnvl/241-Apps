import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserGender } from '@prisma/client';
import { CreateStudentDto } from '../dto/request/create-student.dto.js';
import { StudentRepository } from '../repositories/student.repository.js';
import { CreateStudentUseCase } from './create-student.use-case.js';
import { EnsureStudentEnrollmentUseCase } from '../../enrollment/use-cases/ensure-student-enrollment.use-case.js';

describe('CreateStudentUseCase', () => {
  let useCase: CreateStudentUseCase;

  const mockStudentRepository = {
    findByNis: jest.fn(),
    findByNisn: jest.fn(),
    create: jest.fn(),
  };

  const mockEnsureStudentEnrollment = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateStudentUseCase,
        { provide: StudentRepository, useValue: mockStudentRepository },
        {
          provide: EnsureStudentEnrollmentUseCase,
          useValue: mockEnsureStudentEnrollment,
        },
      ],
    }).compile();

    useCase = module.get<CreateStudentUseCase>(CreateStudentUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateStudentDto = {
      identifier: 'siswa001',
      password: 'P@ssw0rd!',
      name: 'Ahmad Fauzi',
      nik: '3578010101080001',
      gender: UserGender.MALE,
      birthPlace: 'Malang',
      birthDate: '2008-01-01',
      gradeId: '550e8400-e29b-41d4-a716-446655440099',
      classroomId: '550e8400-e29b-41d4-a716-446655440004',
      nis: '2024001',
      nisn: '0012345678',
    };

    const mockStudent = {
      id: 'stu-1',
      userId: 'usr-1',
      nis: '2024001',
      nisn: '0012345678',
      status: 'ACTIVE',
      gradeId: '550e8400-e29b-41d4-a716-446655440099',
    };

    it('should create a student and ensure classroom enrollment', async () => {
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue(null);
      mockStudentRepository.create.mockResolvedValue({ student: mockStudent });

      const result = await useCase.execute(dto);

      expect(mockStudentRepository.findByNis).toHaveBeenCalledWith(dto.nis);
      expect(mockStudentRepository.findByNisn).toHaveBeenCalledWith(dto.nisn);
      expect(mockStudentRepository.create).toHaveBeenCalledWith(
        dto,
        expect.any(String),
      );
      expect(mockEnsureStudentEnrollment.execute).toHaveBeenCalledWith(
        'stu-1',
        dto.classroomId,
      );
      expect(result).toEqual({
        id: 'stu-1',
        userId: 'usr-1',
        nis: '2024001',
        nisn: '0012345678',
        status: 'ACTIVE',
        gradeId: '550e8400-e29b-41d4-a716-446655440099',
      });
    });

    it('should create a student without ensuring enrollment (no classroomId)', async () => {
      const ppdbDto: CreateStudentDto = { ...dto, classroomId: undefined };
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue(null);
      mockStudentRepository.create.mockResolvedValue({ student: mockStudent });

      const result = await useCase.execute(ppdbDto);

      expect(mockEnsureStudentEnrollment.execute).not.toHaveBeenCalled();
      expect(result).toEqual({
        id: 'stu-1',
        userId: 'usr-1',
        nis: '2024001',
        nisn: '0012345678',
        status: 'ACTIVE',
        gradeId: '550e8400-e29b-41d4-a716-446655440099',
      });
    });

    it('should throw ConflictException when NIS is already registered', async () => {
      mockStudentRepository.findByNis.mockResolvedValue({
        id: 'stu-existing',
        nis: '2024001',
      });
      mockStudentRepository.findByNisn.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockStudentRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when NISN is already registered', async () => {
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue({
        id: 'stu-existing',
        nisn: '0012345678',
      });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockStudentRepository.create).not.toHaveBeenCalled();
    });
  });
});
