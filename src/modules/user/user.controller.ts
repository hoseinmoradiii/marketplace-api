import { Controller, Delete, Get } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserEntity } from './entities/user.entity.js';
import { UserId } from './decorators/user-id.decorator.js';

@Controller('user')
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
