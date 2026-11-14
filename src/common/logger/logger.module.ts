import { Global, Module } from '@nestjs/common';
import { Logger } from './logger.service.js';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RequestLoggerInterceptor } from './request-logger.interceptor.js';

@Global()
@Module({
  providers: [
    Logger,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor,
    },
  ],
})
export class LoggerModule {}
