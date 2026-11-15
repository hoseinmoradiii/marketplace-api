import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Payload } from '../utils/payload.type.js';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(userId: string): string {
    const token = this.jwtService.sign(
      { userId },
      {
        secret: this.configService.getOrThrow('ACCESS_TOKEN_SECRET'),
        expiresIn: '10m',
      },
    );

    return token;
  }

  generateRefreshToken(userId: string): string {
    const token = this.jwtService.sign(
      { userId },
      {
        secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
        expiresIn: '30d',
      },
    );

    return token;
  }

  verifyAccessToken(token: string) {
    const payload = this.jwtService.verify<Payload>(token, {
      secret: this.configService.getOrThrow('ACCESS_TOKEN_SECRET'),
    });

    return payload;
  }

  verifyRefreshToken(token: string) {
    const payload = this.jwtService.verify<Payload>(token, {
      secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
    });

    return payload;
  }
}
