import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository.js';
import { UserEntity } from './entities/user.entity.js';

export type PublicUser = Omit<UserEntity, 'accessToken' | 'refreshToken'>;

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async whoAmI(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('no user exists');
    return this.toPublicUser(user);
  }

  async updateFullName(userId: string, fullName: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('no user exists');
    user.fullName = fullName;
    return this.toPublicUser(await this.userRepository.save(user));
  }

  async changeMobile(userId: string, mobile: string): Promise<PublicUser> {
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
    return this.toPublicUser(await this.userRepository.save(user));
  }

  async deleteAccount(userId: string): Promise<string> {
    const result = await this.userRepository.softDelete(userId);
    return result === true ? 'account deleted successfully' : 'no user exists';
  }

  private toPublicUser(user: UserEntity): PublicUser {
    const { accessToken, refreshToken, ...publicUser } = user;
    return publicUser;
  }
}
