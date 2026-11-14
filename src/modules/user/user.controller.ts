import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserEntity } from './entities/user.entity.js';
import { UserId } from './decorators/user-id.decorator.js';
import { RefreshTokenGuard } from '../auth/guards/refresh-token.guard.js';

@Controller('user')
@UseGuards(RefreshTokenGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('whoAmI')
  async whoAmI(@UserId() userId: string): Promise<UserEntity> {
    const result = await this.userService.whoAmI(userId);
    return result;
  }

  @Delete()
  async delete(@UserId() userId: string): Promise<string> {
    const result = await this.userService.deleteAccount(userId);
    return result;
  }
}
