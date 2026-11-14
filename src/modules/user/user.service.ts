import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository.js';
import { UserEntity } from './entities/user.entity.js';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async whoAmI(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('no user exists');
    return user;
  }

  async deleteAccount(userId: string): Promise<string> {
    const result = await this.userRepository.softDelete(userId);
    return result === true ? 'account deleted successfully' : 'no user exists';
  }
}
