import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { Payload } from '../utils/payload.type.js';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.getOrThrow('ACCESS_TOKEN_SECRET'),
        expiresIn: '10m',
      },
    );
  }

  generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, jti: randomUUID() },
      {
        secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
        expiresIn: '30d',
      },
    );
  }

  verifyAccessToken(token: string): Payload | null {
    try {
      return this.jwtService.verify<Payload>(token, {
        secret: this.configService.getOrThrow('ACCESS_TOKEN_SECRET'),
      });
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): Payload | null {
    try {
      return this.jwtService.verify<Payload>(token, {
        secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
      });
    } catch {
      return null;
    }
  }
}
