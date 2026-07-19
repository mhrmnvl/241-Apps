import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../core/database/prisma.module.js';
import { ScholarshipController } from './controllers/scholarship.controller.js';
import { ScholarshipRepository } from './repositories/scholarship.repository.js';
import { CreateScholarshipUseCase } from './use-cases/create-scholarship.use-case.js';
import { GetScholarshipsUseCase } from './use-cases/get-scholarships.use-case.js';
import { GetScholarshipByIdUseCase } from './use-cases/get-scholarship-by-id.use-case.js';
import { UpdateScholarshipUseCase } from './use-cases/update-scholarship.use-case.js';
import { DeleteScholarshipUseCase } from './use-cases/delete-scholarship.use-case.js';

@Module({
  imports: [PrismaModule],
  controllers: [ScholarshipController],
  providers: [
    ScholarshipRepository,
    CreateScholarshipUseCase,
    GetScholarshipsUseCase,
    GetScholarshipByIdUseCase,
    UpdateScholarshipUseCase,
    DeleteScholarshipUseCase,
  ],
})
export class ScholarshipModule {}
