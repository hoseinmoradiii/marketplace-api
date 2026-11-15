import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
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
import { UserService } from './user.service.js';
import type { PublicUser } from './user.service.js';
import { AuthService } from '../auth/services/auth.service.js';
import { UserId } from './decorators/user-id.decorator.js';
import { RefreshTokenGuard } from '../auth/guards/refresh-token.guard.js';
import { UpdateFullNameDto } from './dtos/update-full-name.dto.js';
import { ChangeMobileDto } from './dtos/change-mobile.dto.js';
import { OtpResponse } from '../auth/utils/otp.type.js';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
@UseGuards(RefreshTokenGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('whoAmI')
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiResponse({ status: 200, description: 'Current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async whoAmI(@UserId() userId: string): Promise<PublicUser> {
    return this.userService.whoAmI(userId);
  }

  @Patch('full-name')
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'Update the current user\'s full name' })
  @ApiBody({
    type: UpdateFullNameDto,
    examples: {
      updateFullName: {
        summary: 'Update full name',
        value: { fullName: 'علی رضایی' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Updated user' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateFullName(
    @UserId() userId: string,
    @Body() dto: UpdateFullNameDto,
  ): Promise<PublicUser> {
    return this.userService.updateFullName(userId, dto.fullName);
  }

  @Post('change-mobile')
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @ApiOperation({
    summary:
      'Change the current user\'s mobile number. Sets mobileVerified to false and sends a new OTP to the new number.',
  })
  @ApiBody({
    type: ChangeMobileDto,
    examples: {
      changeMobile: {
        summary: 'Change mobile number',
        value: { mobile: '+989123456789' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Mobile updated, OTP sent to the new number',
    type: OtpResponse,
  })
  @ApiResponse({ status: 400, description: 'Same mobile number' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Mobile already in use' })
  @ApiResponse({ status: 429, description: 'OTP cooldown active' })
  async changeMobile(
    @UserId() userId: string,
    @Body() dto: ChangeMobileDto,
  ): Promise<OtpResponse> {
    await this.userService.changeMobile(userId, dto.mobile);
    return this.authService.sendOtp(dto.mobile);
  }

  @Delete()
  @ApiOperation({ summary: 'Soft-delete the current user account' })
  @ApiResponse({ status: 200, description: 'Account deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@UserId() userId: string): Promise<string> {
    return this.userService.deleteAccount(userId);
  }
}
