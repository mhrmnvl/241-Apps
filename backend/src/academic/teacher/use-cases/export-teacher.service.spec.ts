import { Test, TestingModule } from '@nestjs/testing';
import { ITeacherRepository } from '../domain/interfaces/teacher-repository.interface.js';
import { ExportTeachersUseCase } from './export-teacher.use-case.js';

const mockTeacher = {
  nip: '198006152005011001',
  nuptk: '1234567890123456',
  employmentType: { id: 'type-1', name: 'PNS', code: 'PNS' },
  user: {
    identifier: 'guru001',
    isActive: true,
    profile: {
      name: 'Budi Santoso',
      nik: '3578010101700001',
      gender: 'MALE',
      birthPlace: 'Surabaya',
      birthDate: new Date('1980-06-15'),
      email: 'budi@test.com',
      phone: '081298765432',
    },
  },
  teacherPositions: [
    { isPrimary: true, position: { name: 'Guru Matematika' } },
  ],
};

describe('ExportTeachersUseCase', () => {
  let useCase: ExportTeachersUseCase;

  const mockRepo = {
    findAllForExport: jest.fn(),
    getActiveEmploymentTypeCodes: jest
      .fn()
      .mockResolvedValue(['PNS', 'PPPK', 'NON_ASN']),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportTeachersUseCase,
        { provide: ITeacherRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<ExportTeachersUseCase>(ExportTeachersUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return a Buffer', async () => {
      mockRepo.findAllForExport.mockResolvedValue([mockTeacher]);

      const result = await useCase.execute({});

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should call findAllForExport with provided filters', async () => {
      mockRepo.findAllForExport.mockResolvedValue([]);

      await useCase.execute({
        search: 'Budi',
        employmentTypeId: 'type-1',
      });

      expect(mockRepo.findAllForExport).toHaveBeenCalledWith({
        search: 'Budi',
        employmentTypeId: 'type-1',
      });
    });

    it('should return a valid XLSX buffer even when no teachers match', async () => {
      mockRepo.findAllForExport.mockResolvedValue([]);

      const result = await useCase.execute({});

      expect(result[0]).toBe(0x50); // 'P'
      expect(result[1]).toBe(0x4b); // 'K'
    });

    it('should handle teachers without optional fields', async () => {
      const teacherMinimal = {
        nip: null,
        nuptk: null,
        employmentType: { id: 'type-2', name: 'HONORER', code: 'HONORER' },
        user: {
          identifier: 'guru002',
          isActive: false,
          profile: null,
        },
        teacherPositions: [],
      };
      mockRepo.findAllForExport.mockResolvedValue([teacherMinimal]);

      const result = await useCase.execute({});

      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
