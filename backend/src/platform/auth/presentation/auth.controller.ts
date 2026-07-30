import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import { JwtAuthGuard } from '../index.js';
import { Public } from '../../../core/decorators/public.decorator.js';
import {
  AuthResponseDto,
  LogoutResponseDto,
  UserInfoDto,
} from '../dto/response/auth-response.dto.js';
import { LoginDto } from '../dto/request/login.dto.js';
import { ChangePasswordDto } from '../dto/request/change-password.dto.js';
import { ForgotPasswordDto } from '../dto/request/forgot-password.dto.js';
import { ResetPasswordDto } from '../dto/request/reset-password.dto.js';
import { GetProfileUseCase } from '../use-cases/get-profile.use-case.js';
import { LoginUseCase } from '../use-cases/login.use-case.js';
import { LogoutUseCase } from '../use-cases/logout.use-case.js';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case.js';
import { ChangePasswordUseCase } from '../use-cases/change-password.use-case.js';
import { RequestPasswordResetUseCase } from '../use-cases/request-password-reset.use-case.js';
import { ResetPasswordUseCase } from '../use-cases/reset-password.use-case.js';

const REFRESH_TOKEN_COOKIE = 'refresh_token';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Throttle({ auth: {} })
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiResponse({
    status: 200,
    description:
      'Login successful — refresh token set as HttpOnly cookie, access token in body',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({
    status: 429,
    description: 'Too many login attempts — try again later',
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip ?? req.socket.remoteAddress;

    const result = await this.loginUseCase.execute(dto, userAgent, ipAddress);

    this.setRefreshTokenCookie(
      res,
      result.refreshToken,
      result.refreshExpiresInMs,
    );

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refresh_token')
  @ApiOperation({
    summary: 'Refresh access token using HttpOnly cookie',
    description:
      'Reads `refresh_token` from HttpOnly cookie set during login. Not testable via Swagger UI — use a REST client that supports cookies.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Tokens rotated — new refresh token cookie set, new access token in body',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req.cookies as Record<string, string>)?.[
      REFRESH_TOKEN_COOKIE
    ];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.refreshTokenUseCase.execute(refreshToken);

    this.setRefreshTokenCookie(
      res,
      result.refreshToken,
      result.refreshExpiresInMs,
    );

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke current session' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful — session revoked, refresh cookie cleared',
    type: LogoutResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.logoutUseCase.execute(user.sessionId);

    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/auth',
    });

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    type: UserInfoDto,
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.getProfileUseCase.execute(user.id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password successfully changed' })
  @ApiResponse({ status: 400, description: 'Invalid passwords' })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.changePasswordUseCase.execute(user.id, user.sessionId, dto);
    return { success: true, message: 'Password berhasil diubah' };
  }

  @Throttle({ auth: {} })
  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset token link' })
  @ApiResponse({
    status: 200,
    description: 'Forgot password process initiated',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.requestPasswordResetUseCase.execute(dto.identifier);
  }

  @Throttle({ auth: {} })
  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with a valid token' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.resetPasswordUseCase.execute(dto);
    return { success: true, message: 'Password berhasil direset' };
  }

  private setRefreshTokenCookie(res: Response, token: string, maxAge: number) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    res.cookie(REFRESH_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/auth',
      maxAge,
    });
  }
}
