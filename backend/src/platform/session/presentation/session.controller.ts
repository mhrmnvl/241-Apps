import { RequirePermissions } from '../../access-control/permission/decorators/require-permissions.decorator.js';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/index.js';
import { SessionResponseDto } from '../dto/response/session-response.dto.js';
import { GetUserSessionsUseCase } from '../use-cases/get-user-sessions.use-case.js';
import { RevokeSessionUseCase } from '../use-cases/revoke-session.use-case.js';
import { RevokeAllSessionsUseCase } from '../use-cases/revoke-all-session.use-case.js';

@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionController {
  constructor(
    private readonly getUserSessionsUseCase: GetUserSessionsUseCase,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
    private readonly revokeAllSessionsUseCase: RevokeAllSessionsUseCase,
  ) {}

  @Get('users/:userId')
  @RequirePermissions('sessions.read')
  @ApiOperation({ summary: 'Get active sessions of a user' })
  @ApiParam({ name: 'userId', description: 'User UUID', format: 'uuid' })
  @ApiResponse({ status: 200, type: [SessionResponseDto] })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUserSessions(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.getUserSessionsUseCase.execute(userId);
  }

  @Post(':id/revoke')
  @RequirePermissions('sessions.create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force revoke a specific active session' })
  @ApiParam({ name: 'id', description: 'Session UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async revoke(@Param('id', ParseUUIDPipe) id: string) {
    await this.revokeSessionUseCase.execute(id);
  }

  @Post('users/:userId/revoke-all')
  @RequirePermissions('sessions.create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force revoke all active sessions of a user' })
  @ApiParam({ name: 'userId', description: 'User UUID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'All sessions revoked successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async revokeAll(@Param('userId', ParseUUIDPipe) userId: string) {
    await this.revokeAllSessionsUseCase.execute(userId);
  }
}
