import { Module } from '@nestjs/common';
import { UserModule } from '../../platform/user/user.module.js';
import { TeacherController } from './presentation/teacher.controller.js';
import { TeacherImportExportController } from './presentation/teacher-import-export.controller.js';
import { TeacherPositionsController } from './presentation/teacher-position.controller.js';
import { ITeacherRepository } from './domain/interfaces/teacher-repository.interface.js';
import { ITeacherIdentityReadPort } from './domain/interfaces/teacher-identity-read.port.js';
import { PrismaTeacherIdentityReadPort } from './infrastructure/persistence/prisma-teacher-identity.read-port.js';
import { ITeacherAddressRepository } from './domain/interfaces/teacher-address-repository.interface.js';
import { ITeacherPositionRepository } from './domain/interfaces/teacher-position-repository.interface.js';
import { PrismaTeacherRepository } from './infrastructure/persistence/prisma-teacher.repository.js';
import { PrismaTeacherAddressRepository } from './infrastructure/persistence/prisma-teacher-address.repository.js';
import { PrismaTeacherPositionRepository } from './infrastructure/persistence/prisma-teacher-position.repository.js';
import { ExcelTeacherParser as ExcelTeacherParserConcrete } from './infrastructure/parsers/excel-teacher.parser.js';
import { ExcelTeacherParser } from './domain/interfaces/teacher-excel-parser.interface.js';
import { CreateTeacherUseCase } from './use-cases/create-teacher.use-case.js';
import { DeleteTeacherUseCase } from './use-cases/delete-teacher.use-case.js';
import { GetTeacherByIdUseCase } from './use-cases/get-teacher-by-id.use-case.js';
import { GetTeachersUseCase } from './use-cases/get-teachers.use-case.js';
import { UpdateTeacherUseCase } from './use-cases/update-teacher.use-case.js';
import { UpdateTeacherProfileUseCase } from './use-cases/update-teacher-profile.use-case.js';
import { ToggleTeacherActiveUseCase } from './use-cases/toggle-teacher-active.use-case.js';
import { BulkImportTeachersUseCase } from './use-cases/bulk-import-teacher.use-case.js';
import { ResolveBulkImportConflictsUseCase } from './use-cases/resolve-bulk-import-conflicts.use-case.js';
import { ExportTeachersUseCase } from './use-cases/export-teacher.use-case.js';
import { TeacherPositionUseCase } from './use-cases/teacher-position.use-case.js';

@Module({
  imports: [UserModule],
  controllers: [
    TeacherImportExportController,
    TeacherController,
    TeacherPositionsController,
  ],
  providers: [
    { provide: ITeacherRepository, useClass: PrismaTeacherRepository },
    {
      provide: ITeacherIdentityReadPort,
      useClass: PrismaTeacherIdentityReadPort,
    },
    {
      provide: ITeacherAddressRepository,
      useClass: PrismaTeacherAddressRepository,
    },
    {
      provide: ITeacherPositionRepository,
      useClass: PrismaTeacherPositionRepository,
    },
    { provide: ExcelTeacherParser, useClass: ExcelTeacherParserConcrete },
    CreateTeacherUseCase,
    DeleteTeacherUseCase,
    GetTeacherByIdUseCase,
    GetTeachersUseCase,
    UpdateTeacherUseCase,
    UpdateTeacherProfileUseCase,
    ToggleTeacherActiveUseCase,
    BulkImportTeachersUseCase,
    ResolveBulkImportConflictsUseCase,
    ExportTeachersUseCase,
    TeacherPositionUseCase,
  ],
  exports: [
    ITeacherRepository,
    ITeacherAddressRepository,
    ITeacherPositionRepository,
    // Consumed by schedule, so `GET /schedules/me` answers from the caller's
    // teaching record rather than from what their role is called.
    ITeacherIdentityReadPort,
  ],
})
export class TeacherModule {}
