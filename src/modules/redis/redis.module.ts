import { Global, Module } from '@nestjs/common';
import { REDIS } from './utils/constant.redis.js';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service.js';

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new Redis({
          host: configService.getOrThrow<string>('REDIS_HOST'),
          port: configService.getOrThrow<number>('REDIS_PORT'),
        }),
    },
    RedisService,
  ],
  exports: [REDIS],
})
export class RedisModule {}
