import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { REDIS } from './utils/constant.redis.js';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject(REDIS)
    private readonly redis: Redis,
  ) {}

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    await this.redis.set(key, value, 'EX', ttl);
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
