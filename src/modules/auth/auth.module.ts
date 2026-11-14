import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy.js';
import { AccessTokenStrategy } from './strategies/access-token.strategy.js';

@Module({
  imports: [PassportModule],
  providers: [
    RefreshTokenStrategy,
    AccessTokenStrategy,
    AccessTokenGuard,
    RefreshTokenGuard,
  ],
  exports: [
    RefreshTokenStrategy,
    AccessTokenStrategy,
    AccessTokenGuard,
    RefreshTokenGuard,
  ],
})
export class AuthModule {}
