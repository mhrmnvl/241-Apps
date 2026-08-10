import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { PaginatedResponse } from '../../../shared/domain/interfaces/repository.interface.js';
import {
  CredentialWithCode,
  CredentialWithHolder,
} from '../domain/entities/credential.entity.js';
import { CredentialPrintQueryDto } from '../dto/request/credential-print-query.dto.js';
import { CredentialQueryDto } from '../dto/request/credential-query.dto.js';
import { IssueCredentialDto } from '../dto/request/issue-credential.dto.js';
import { RevokeCredentialDto } from '../dto/request/revoke-credential.dto.js';
import { GetCredentialsForPrintUseCase } from '../use-cases/get-credentials-for-print.use-case.js';
import {
  GetCredentialByIdUseCase,
  GetCredentialsUseCase,
} from '../use-cases/get-credentials.use-case.js';
import { IssueCredentialUseCase } from '../use-cases/issue-credential.use-case.js';
import { ReplaceCredentialUseCase } from '../use-cases/replace-credential.use-case.js';
import { RevokeCredentialUseCase } from '../use-cases/revoke-credential.use-case.js';

@ApiTags('Presence — Credentials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('presence/credentials')
export class CredentialController {
  constructor(
    private readonly getAll: GetCredentialsUseCase,
    private readonly getById: GetCredentialByIdUseCase,
    private readonly getForPrint: GetCredentialsForPrintUseCase,
    private readonly issue: IssueCredentialUseCase,
    private readonly revoke: RevokeCredentialUseCase,
    private readonly replace: ReplaceCredentialUseCase,
  ) {}

  @Get()
  @RequirePermissions('presence-credentials.read')
  @ApiOperation({ summary: 'List cards (never returns the card code)' })
  async list(
    @Query() query: CredentialQueryDto,
  ): Promise<PaginatedResponse<CredentialWithHolder>> {
    return this.getAll.execute(query);
  }

  // Declared before `:id` so "print" is not parsed as a uuid.
  @Get('print')
  @RequirePermissions('presence-credentials.read')
  @ApiOperation({ summary: 'Card codes for a print run' })
  async print(
    @Query() query: CredentialPrintQueryDto,
  ): Promise<CredentialWithCode[]> {
    return this.getForPrint.execute(query.userIds);
  }

  @Get(':id')
  @RequirePermissions('presence-credentials.read')
  @ApiParam({ name: 'id', format: 'uuid' })
  async detail(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CredentialWithHolder> {
    return this.getById.execute(id);
  }

  @Post()
  @RequirePermissions('presence-credentials.create')
  @ApiOperation({ summary: 'Issue a card — the code is returned once' })
  async create(
    @Body() dto: IssueCredentialDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CredentialWithCode> {
    return this.issue.execute(dto, user.id);
  }

  @Post(':id/revoke')
  @RequirePermissions('presence-credentials.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Revoke a card — ends the holder’s expected days' })
  async revokeCard(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RevokeCredentialDto,
  ) {
    return this.revoke.execute(id, dto);
  }

  @Post(':id/replace')
  @RequirePermissions('presence-credentials.create')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Replace a lost card — history stays continuous' })
  async replaceCard(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RevokeCredentialDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CredentialWithCode> {
    return this.replace.execute(id, dto, user.id);
  }
}
