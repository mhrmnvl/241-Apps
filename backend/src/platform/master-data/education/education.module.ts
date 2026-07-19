import { Module } from '@nestjs/common';
import { EducationController } from './controllers/education.controller.js';
import { EducationRepository } from './repositories/education.repository.js';
import { IEducationRepository } from './interfaces/education-repository.interface.js';
import { CreateEducationUseCase } from './use-cases/create-education.use-case.js';
import { DeleteEducationUseCase } from './use-cases/delete-education.use-case.js';
import { GetEducationByIdUseCase } from './use-cases/get-education-by-id.use-case.js';
import { GetEducationsUseCase } from './use-cases/get-educations.use-case.js';
import { UpdateEducationUseCase } from './use-cases/update-education.use-case.js';

@Module({
  controllers: [EducationController],
  providers: [
    { provide: IEducationRepository, useClass: EducationRepository },
    GetEducationsUseCase,
    GetEducationByIdUseCase,
    CreateEducationUseCase,
    UpdateEducationUseCase,
    DeleteEducationUseCase,
  ],
  exports: [IEducationRepository],
})
export class EducationModule {}
