import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../core/database/prisma.module.js';
import { ScholarshipController } from './presentation/scholarship.controller.js';
import { PrismaScholarshipRepository } from './infrastructure/persistence/prisma-scholarship.repository.js';
import { IScholarshipRepository } from './domain/interfaces/scholarship-repository.interface.js';
import { CreateScholarshipUseCase } from './use-cases/create-scholarship.use-case.js';
import { GetScholarshipsUseCase } from './use-cases/get-scholarships.use-case.js';
import { GetScholarshipByIdUseCase } from './use-cases/get-scholarship-by-id.use-case.js';
import { UpdateScholarshipUseCase } from './use-cases/update-scholarship.use-case.js';
import { DeleteScholarshipUseCase } from './use-cases/delete-scholarship.use-case.js';

@Module({
  imports: [PrismaModule],
  controllers: [ScholarshipController],
  providers: [
    {
      provide: IScholarshipRepository,
      useClass: PrismaScholarshipRepository,
    },
    CreateScholarshipUseCase,
    GetScholarshipsUseCase,
    GetScholarshipByIdUseCase,
    UpdateScholarshipUseCase,
    DeleteScholarshipUseCase,
  ],
  exports: [IScholarshipRepository],
})
export class ScholarshipModule {}
