import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../core/decorators/public.decorator.js';
import { RegisterApplicantDto } from '../dto/register-applicant.dto.js';
import { GetActiveWavesUseCase } from '../use-cases/get-active-waves.use-case.js';
import { RegisterApplicantUseCase } from '../use-cases/register-applicant.use-case.js';

@ApiTags('Admission — Public')
@Controller('admissions')
export class AdmissionPublicController {
  constructor(
    private readonly getActiveWavesService: GetActiveWavesUseCase,
    private readonly registerApplicantService: RegisterApplicantUseCase,
  ) {}

  @Get('waves/active')
  @Public()
  @ApiOperation({
    summary: 'Active admission waves with requirements (landing page)',
  })
  @ApiResponse({
    status: 200,
    description: 'Active waves and document requirements',
  })
  async getActiveWaves() {
    return this.getActiveWavesService.execute();
  }

  @Post('register')
  @Public()
  @Throttle({ auth: {} })
  @ApiOperation({ summary: 'Register a new applicant account' })
  @ApiResponse({ status: 201, description: 'Applicant registered' })
  @ApiResponse({ status: 400, description: 'Wave closed or invalid data' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() dto: RegisterApplicantDto) {
    return this.registerApplicantService.execute(dto);
  }
}
