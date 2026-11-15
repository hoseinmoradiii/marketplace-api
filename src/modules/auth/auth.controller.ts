import {
  Body,
  Controller,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './services/auth.service.js';
import { OtpResponse } from './utils/otp.type.js';
import { SendOtpDto } from './dtos/send-otp.dto.js';
import { VerifyOtpDto } from './dtos/verify-otp.dto.js';
import { AccessToken, Tokens } from './utils/token.type.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { UserId } from '../user/decorators/user-id.decorator.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'Send a login OTP to a mobile number' })
  @ApiBody({
    type: SendOtpDto,
    examples: {
      sendOtp: {
        summary: 'Send OTP',
        value: { mobile: '+989123456789' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'OTP generated', type: OtpResponse })
  @ApiResponse({ status: 429, description: 'OTP cooldown active' })
  async sendOtp(@Body() dto: SendOtpDto): Promise<OtpResponse> {
    return this.authService.sendOtp(dto.mobile);
  }

  @Post('verify-otp')
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'Verify OTP and receive access/refresh tokens' })
  @ApiBody({
    type: VerifyOtpDto,
    examples: {
      verifyOtp: {
        summary: 'Verify OTP',
        value: { mobile: '+989123456789', submittedOtp: '123456' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Tokens issued', type: Tokens })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<Tokens> {
    return this.authService.verifyOtp(dto.mobile, dto.submittedOtp);
  }

  @Post('resend-access-token')
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exchange a refresh token for a new access token' })
  @ApiResponse({ status: 201, description: 'New access token', type: AccessToken })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async resendAccessToken(
    @Headers('authorization') authorization?: string,
  ): Promise<AccessToken> {
    const refreshToken = authorization?.replace(/^Bearer\s+/i, '') ?? '';
    return this.authService.regenerateAccessToken(refreshToken);
  }

  @Post('resend-otp')
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'Resend the login OTP to a mobile number' })
  @ApiBody({
    type: SendOtpDto,
    examples: {
      resendOtp: {
        summary: 'Resend OTP',
        value: { mobile: '+989123456789' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'OTP generated', type: OtpResponse })
  @ApiResponse({ status: 429, description: 'OTP cooldown active' })
  async resendOtp(@Body() dto: SendOtpDto): Promise<OtpResponse> {
    return this.authService.resendOtp(dto.mobile);
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate the current user\'s tokens' })
  @ApiResponse({ status: 201, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@UserId() userId: string): Promise<boolean> {
    return this.authService.logout(userId);
  }
}
