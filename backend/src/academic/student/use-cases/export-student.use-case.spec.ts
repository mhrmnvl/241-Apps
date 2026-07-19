import { Test, TestingModule } from '@nestjs/testing';
import { StudentRepository } from '../repositories/student.repository.js';
import { ExportStudentsUseCase } from './export-student.use-case.js';

const mockStudent = {
  nis: '2024001',
  nisn: '0012345678',
  gradeId: 'lvl-7',
  grade: { id: 'lvl-7', level: 7, name: 'VII' },
  user: {
    identifier: 'siswa001',
    isActive: true,
    profile: {
      name: 'Ahmad Fauzi',
      nik: '3578010101080001',
      gender: 'MALE',
      birthPlace: 'Malang',
      birthDate: new Date('2008-01-01'),
      email: 'ahmad@test.com',
      phone: '081234567890',
    },
  },
  enrollments: [
    {
      classroom: {
        id: 'cls-1',
        code: 'VII-A',
        gradeId: 'lvl-7',
      },
    },
  ],
  status: 'ACTIVE',
};

describe('ExportStudentsUseCase', () => {
  let useCase: ExportStudentsUseCase;

  const mockRepo = {
    findAllForExport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportStudentsUseCase,
        { provide: StudentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<ExportStudentsUseCase>(ExportStudentsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return a Buffer', async () => {
      mockRepo.findAllForExport.mockResolvedValue([mockStudent]);

      const result = await useCase.execute({});

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should call findAllForExport with provided filters', async () => {
      mockRepo.findAllForExport.mockResolvedValue([]);

      await useCase.execute({ search: 'Ahmad', isActive: true });

      expect(mockRepo.findAllForExport).toHaveBeenCalledWith({
        search: 'Ahmad',
        isActive: true,
      });
    });

    it('should return a valid XLSX buffer even when no students match', async () => {
      mockRepo.findAllForExport.mockResolvedValue([]);

      const result = await useCase.execute({});

      expect(result[0]).toBe(0x50); // 'P'
      expect(result[1]).toBe(0x4b); // 'K'
    });

    it('should handle students without optional profile fields', async () => {
      const studentMinimal = {
        nis: '2024002',
        nisn: '0000000002',
        user: {
          identifier: 'siswa002',
          isActive: false,
          profile: null,
        },
        enrollments: [],
        status: 'ACTIVE',
      };
      mockRepo.findAllForExport.mockResolvedValue([studentMinimal]);

      const result = await useCase.execute({});

      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
