import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, createHmac, randomInt } from 'crypto';
import { RedisService } from '../../redis/redis.service.js';
import { TokenService } from './token.service.js';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../user/user.repository.js';
import { UserEntity } from '../../user/entities/user.entity.js';
import { AccessToken, Tokens } from '../utils/token.type.js';
import { OtpResponse } from '../utils/otp.type.js';

@Injectable()
export class AuthService {
  private readonly OTP_TTL = 300;
  private readonly OTP_COOLDOWN = 60;
  private readonly MAX_ATTEMPTS = 5;

  constructor(
    private readonly redisService: RedisService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {}

  private generateOtp(): string {
    return randomInt(100000, 1000000).toString();
  }

  private hashOtp(otp: string): string {
    return createHmac(
      'sha256',
      this.configService.getOrThrow<string>('OTP_SECRET'),
    )
      .update(otp)
      .digest('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async sendOtp(mobile: string): Promise<OtpResponse> {
    let user = await this.userRepository.findUserByMobile(mobile);

    if (!user) {
      user = new UserEntity();
      user.mobile = mobile;
      await this.userRepository.save(user);
    }

    const key = `otp:login:${user.mobile}`;
    const cooldownKey = `otp:cooldown:login:${user.mobile}`;

    const allowed = await this.redisService.setIfAbsent(
      cooldownKey,
      '1',
      this.OTP_COOLDOWN,
    );

    if (!allowed) {
      throw new HttpException(
        'Please wait before requesting another OTP',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otp = this.generateOtp();

    try {
      await this.redisService.storeOtp(key, this.hashOtp(otp), this.OTP_TTL);
      // TODO: Send OTP through SMS provider.
      // await this.smsService.send(mobile, otp);
      const isProduction =
        this.configService.getOrThrow<string>('NODE_ENV') === 'production';
      return isProduction ? { mobile: user.mobile } : { mobile: user.mobile, otp };
    } catch (error) {
      await this.redisService.delete(key);
      await this.redisService.delete(cooldownKey);
      throw error;
    }
  }

  async verifyOtp(mobile: string, submittedOtp: string): Promise<Tokens> {
    const user = await this.userRepository.findUserByMobile(mobile);

    if (!user) {
      throw new NotFoundException('No user exists with this mobile number');
    }

    const key = `otp:login:${user.mobile}`;

    const result = await this.redisService.verifyOtp(
      key,
      this.hashOtp(submittedOtp),
      this.MAX_ATTEMPTS,
    );

    if (result === -1) {
      throw new BadRequestException('OTP expired or does not exist');
    }

    if (result === 0) {
      throw new BadRequestException('Invalid OTP');
    }

    const accessToken = this.tokenService.generateAccessToken(user.id);
    const refreshToken = this.tokenService.generateRefreshToken(user.id);

    user.accessToken = this.hashToken(accessToken);
    user.refreshToken = this.hashToken(refreshToken);
    user.mobileVerified = true;

    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  async regenerateAccessToken(refreshToken: string): Promise<AccessToken> {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    if (!payload || !payload.sub)
      throw new UnauthorizedException('invalid token');
    const user = await this.userRepository.findById(payload.sub);
    if (!user || user.refreshToken !== this.hashToken(refreshToken))
      throw new UnauthorizedException('Invalid refresh token');
    const accessToken = this.tokenService.generateAccessToken(user.id);
    user.accessToken = this.hashToken(accessToken);
    await this.userRepository.save(user);
    return { accessToken };
  }

  async logout(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('user is not authorized');
    user.accessToken = '';
    user.refreshToken = '';
    await this.userRepository.save(user);
    return true;
  }

  async resendOtp(mobile: string): Promise<OtpResponse> {
    return this.sendOtp(mobile);
  }
}
