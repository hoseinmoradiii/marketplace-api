import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async updateFullName(userId: string, fullName: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('no user exists');
    user.fullName = fullName;
    return this.userRepository.save(user);
  }

  async changeMobile(userId: string, mobile: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('no user exists');
    if (user.mobile === mobile) {
      throw new BadRequestException('This is already your mobile number');
    }
    const existing = await this.userRepository.findUserByMobile(mobile);
    if (existing && existing.id !== userId) {
      throw new ConflictException('Mobile number is already in use');
    }
    user.mobile = mobile;
    user.mobileVerified = false;
    return this.userRepository.save(user);
  }

  async deleteAccount(userId: string): Promise<string> {
    const result = await this.userRepository.softDelete(userId);
    return result === true ? 'account deleted successfully' : 'no user exists';
  }
}
