import { Module } from '@nestjs/common';
import { SubjectController } from './presentation/subject.controller.js';
import { PrismaSubjectRepository } from './infrastructure/persistence/prisma-subject.repository.js';
import { CreateSubjectUseCase } from './use-cases/create-subject.use-case.js';
import { DeleteSubjectUseCase } from './use-cases/delete-subject.use-case.js';
import { GetSubjectByIdUseCase } from './use-cases/get-subject-by-id.use-case.js';
import { GetSubjectsUseCase } from './use-cases/get-subjects.use-case.js';
import { UpdateSubjectUseCase } from './use-cases/update-subject.use-case.js';
import { ISubjectRepository } from './domain/interfaces/subject-repository.interface.js';

@Module({
  controllers: [SubjectController],
  providers: [
    {
      provide: ISubjectRepository,
      useClass: PrismaSubjectRepository,
    },
    GetSubjectsUseCase,
    GetSubjectByIdUseCase,
    CreateSubjectUseCase,
    UpdateSubjectUseCase,
    DeleteSubjectUseCase,
  ],
  exports: [ISubjectRepository],
})
export class SubjectModule {}
