import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../core/types/authenticated-user.type.js';
import { JwtAuthGuard } from '../../platform/auth/index.js';
import { UpdateMyApplicationDto } from '../dto/request/update-my-application.dto.js';
import { UploadPaymentProofDto } from '../dto/request/upload-payment-proof.dto.js';
import { GetMyApplicationUseCase } from '../use-cases/get-my-application.use-case.js';
import { GetMyNotificationsUseCase } from '../use-cases/get-my-notifications.use-case.js';
import { GetPublishedAnnouncementsUseCase } from '../use-cases/get-published-announcements.use-case.js';
import { MarkNotificationReadUseCase } from '../use-cases/mark-notification-read.use-case.js';
import { SubmitApplicationUseCase } from '../use-cases/submit-application.use-case.js';
import { UpdateMyApplicationUseCase } from '../use-cases/update-my-application.use-case.js';
import { UploadAdmissionDocumentUseCase } from '../use-cases/upload-admission-document.use-case.js';
import { UploadPaymentProofUseCase } from '../use-cases/upload-payment-proof.use-case.js';

// No @RequirePermissions here: every handler is scoped to the JWT user's own
// application (ownership check inside the use-cases), never a path id.
@ApiTags('Admission — Applicant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admissions')
export class AdmissionApplicantController {
  constructor(
    private readonly getMyApplicationService: GetMyApplicationUseCase,
    private readonly updateMyApplicationService: UpdateMyApplicationUseCase,
    private readonly submitApplicationService: SubmitApplicationUseCase,
    private readonly uploadDocumentService: UploadAdmissionDocumentUseCase,
    private readonly uploadPaymentProofService: UploadPaymentProofUseCase,
    private readonly getMyNotificationsService: GetMyNotificationsUseCase,
    private readonly markNotificationReadService: MarkNotificationReadUseCase,
    private readonly getAnnouncementsService: GetPublishedAnnouncementsUseCase,
  ) {}

  @Get('my-application')
  @ApiOperation({
    summary: 'Get my application (form, documents, payment, wave)',
  })
  @ApiResponse({ status: 200, description: 'Application detail' })
  @ApiResponse({ status: 404, description: 'No application for this account' })
  async getMyApplication(@CurrentUser() user: AuthenticatedUser) {
    return this.getMyApplicationService.execute(user.id);
  }

  @Patch('my-application')
  @ApiOperation({
    summary: 'Update my application form (partial, per wizard step)',
  })
  @ApiResponse({ status: 200, description: 'Application updated' })
  @ApiResponse({ status: 409, description: 'Not editable in current status' })
  async updateMyApplication(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateMyApplicationDto,
  ) {
    return this.updateMyApplicationService.execute(user.id, dto);
  }

  @Post('my-application/submit')
  @ApiOperation({ summary: 'Submit my application for verification' })
  @ApiResponse({ status: 201, description: 'Application submitted' })
  @ApiResponse({ status: 400, description: 'Incomplete data or documents' })
  async submit(@CurrentUser() user: AuthenticatedUser) {
    return this.submitApplicationService.execute(user.id);
  }

  @Put('my-application/documents/:typeCode')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload (or replace) a required document' })
  @ApiParam({ name: 'typeCode', example: 'KK' })
  @ApiResponse({ status: 200, description: 'Document uploaded' })
  async uploadDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('typeCode') typeCode: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadDocumentService.execute(user.id, typeCode, file);
  }

  @Put('my-application/payment')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload payment transfer proof' })
  @ApiResponse({ status: 200, description: 'Payment proof uploaded' })
  async uploadPaymentProof(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UploadPaymentProofDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadPaymentProofService.execute(user.id, dto, file);
  }

  @Get('my-application/notifications')
  @ApiOperation({ summary: 'My notifications (latest 50, with unread count)' })
  async getNotifications(@CurrentUser() user: AuthenticatedUser) {
    return this.getMyNotificationsService.execute(user.id);
  }

  @Patch('notifications/read-all')
  @ApiOperation({ summary: 'Mark all my notifications as read' })
  async markAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.markNotificationReadService.executeAll(user.id);
  }

  @Patch('notifications/:id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.markNotificationReadService.executeOne(user.id, id);
  }

  @Get('announcements')
  @ApiOperation({ summary: 'Published announcements for my wave (or global)' })
  async getAnnouncements(@CurrentUser() user: AuthenticatedUser) {
    return this.getAnnouncementsService.execute(user.id);
  }
}
