import { Module } from '@nestjs/common';
import { GraduationController } from './presentation/graduation.controller.js';
import { PrismaGraduationRepository } from './infrastructure/persistence/prisma-graduation.repository.js';
import { CreateStudentGraduationUseCase } from './use-cases/create-student-graduation.use-case.js';
import { DeleteStudentGraduationUseCase } from './use-cases/delete-student-graduation.use-case.js';
import { GetStudentGraduationByIdUseCase } from './use-cases/get-student-graduation-by-id.use-case.js';
import { GetStudentGraduationsUseCase } from './use-cases/get-student-graduations.use-case.js';
import { UpdateStudentGraduationUseCase } from './use-cases/update-student-graduation.use-case.js';
import { GetGraduationCandidatesUseCase } from './use-cases/get-graduation-candidates.use-case.js';
import { BulkGraduateStudentsUseCase } from './use-cases/bulk-graduate-students.use-case.js';
import { IGraduationRepository } from './domain/interfaces/graduation-repository.interface.js';

@Module({
  controllers: [GraduationController],
  providers: [
    {
      provide: IGraduationRepository,
      useClass: PrismaGraduationRepository,
    },
    GetStudentGraduationsUseCase,
    GetStudentGraduationByIdUseCase,
    CreateStudentGraduationUseCase,
    UpdateStudentGraduationUseCase,
    DeleteStudentGraduationUseCase,
    GetGraduationCandidatesUseCase,
    BulkGraduateStudentsUseCase,
  ],
  exports: [IGraduationRepository],
})
export class GraduationModule {}
