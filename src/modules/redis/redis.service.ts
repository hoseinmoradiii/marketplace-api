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

  async setIfAbsent(key: string, value: string, ttl: number): Promise<boolean> {
    const result = await this.redis.set(key, value, 'EX', ttl, 'NX');

    return result === 'OK';
  }

  async storeOtp(key: string, hashedOtp: string, ttl: number): Promise<void> {
    await this.redis
      .multi()
      .hset(key, 'hash', hashedOtp, 'attempts', '0')
      .expire(key, ttl)
      .exec();
  }

  async verifyOtp(
    key: string,
    hashedOtp: string,
    maxAttempts: number,
  ): Promise<number> {
    const script = `
    local stored = redis.call('HGET', KEYS[1], 'hash')

    if not stored then
      return -1
    end

    if stored == ARGV[1] then
      redis.call('DEL', KEYS[1])
      return 1
    end

    local attempts = redis.call('HINCRBY', KEYS[1], 'attempts', 1)

    if attempts >= tonumber(ARGV[2]) then
      redis.call('DEL', KEYS[1])
    end

    return 0
  `;

    return Number(
      await this.redis.eval(script, 1, key, hashedOtp, maxAttempts),
    );
  }
}
