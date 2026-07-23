import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../core/types/authenticated-user.type.js';
import { RequirePermissions } from '../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { JwtAuthGuard } from '../../platform/auth/index.js';
import {
  AcceptApplicationDto,
  EnrollApplicantDto,
  RejectApplicationDto,
  RequestRevisionDto,
  VerifyDocumentDto,
  VerifyPaymentDto,
} from '../dto/request/admin-actions.dto.js';
import { AdmissionApplicationQueryDto } from '../dto/request/admission-query.dto.js';
import { AcceptApplicationUseCase } from '../use-cases/accept-application.use-case.js';
import { EnrollApplicantUseCase } from '../use-cases/enroll-applicant.use-case.js';
import { GetAdmissionStatsUseCase } from '../use-cases/get-admission-stats.use-case.js';
import { GetApplicationByIdUseCase } from '../use-cases/get-application-by-id.use-case.js';
import { GetApplicationsUseCase } from '../use-cases/get-applications.use-case.js';
import { RejectApplicationUseCase } from '../use-cases/reject-application.use-case.js';
import { RequestRevisionUseCase } from '../use-cases/request-revision.use-case.js';
import { VerifyApplicationUseCase } from '../use-cases/verify-application.use-case.js';
import { VerifyDocumentUseCase } from '../use-cases/verify-document.use-case.js';
import { VerifyPaymentUseCase } from '../use-cases/verify-payment.use-case.js';

@ApiTags('Admission — Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admissions')
export class AdmissionAdminController {
  constructor(
    private readonly getApplicationsService: GetApplicationsUseCase,
    private readonly getApplicationByIdService: GetApplicationByIdUseCase,
    private readonly verifyDocumentService: VerifyDocumentUseCase,
    private readonly verifyPaymentService: VerifyPaymentUseCase,
    private readonly requestRevisionService: RequestRevisionUseCase,
    private readonly verifyApplicationService: VerifyApplicationUseCase,
    private readonly acceptApplicationService: AcceptApplicationUseCase,
    private readonly rejectApplicationService: RejectApplicationUseCase,
    private readonly enrollApplicantService: EnrollApplicantUseCase,
    private readonly getStatsService: GetAdmissionStatsUseCase,
  ) {}

  @Get('stats')
  @RequirePermissions('admissions.read')
  @ApiOperation({ summary: 'Admission statistics per status and wave' })
  async getStats(@Query('waveId') waveId?: string) {
    return this.getStatsService.execute(waveId);
  }

  @Get('applications')
  @RequirePermissions('admissions.read')
  @ApiOperation({ summary: 'List applications (paginated, filterable)' })
  async findAll(@Query() query: AdmissionApplicationQueryDto) {
    return this.getApplicationsService.execute(query);
  }

  @Get('applications/:id')
  @RequirePermissions('admissions.read')
  @ApiOperation({ summary: 'Application detail (form, documents, payment)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getApplicationByIdService.execute(id);
  }

  @Patch('applications/:id/documents/:docId/verify')
  @RequirePermissions('admissions.verify')
  @ApiOperation({ summary: 'Approve or reject a document' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiParam({ name: 'docId', format: 'uuid' })
  async verifyDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @Body() dto: VerifyDocumentDto,
  ) {
    return this.verifyDocumentService.execute(id, docId, dto, user.id);
  }

  @Patch('applications/:id/payment/verify')
  @RequirePermissions('admissions.verify')
  @ApiOperation({ summary: 'Verify or reject the payment proof' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async verifyPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.verifyPaymentService.execute(id, dto, user.id);
  }

  @Post('applications/:id/request-revision')
  @RequirePermissions('admissions.verify')
  @ApiOperation({
    summary: 'Return the application to the applicant for revision',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  async requestRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RequestRevisionDto,
  ) {
    return this.requestRevisionService.execute(id, dto);
  }

  @Post('applications/:id/verify')
  @RequirePermissions('admissions.verify')
  @ApiOperation({
    summary: 'Mark application VERIFIED (all docs approved + payment verified)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  async verifyApplication(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.verifyApplicationService.execute(id, user.id);
  }

  @Post('applications/:id/accept')
  @RequirePermissions('admissions.decide')
  @ApiOperation({ summary: 'Accept the application' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async accept(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AcceptApplicationDto,
  ) {
    return this.acceptApplicationService.execute(id, dto, user.id);
  }

  @Post('applications/:id/reject')
  @RequirePermissions('admissions.decide')
  @ApiOperation({ summary: 'Reject the application' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async reject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectApplicationDto,
  ) {
    return this.rejectApplicationService.execute(id, dto, user.id);
  }

  @Post('applications/:id/enroll')
  @RequirePermissions('admissions.enroll')
  @ApiOperation({ summary: 'Provision the accepted applicant as a student' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 409, description: 'NIS/NISN/NIK conflict' })
  async enroll(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EnrollApplicantDto,
  ) {
    return this.enrollApplicantService.execute(id, dto);
  }
}
