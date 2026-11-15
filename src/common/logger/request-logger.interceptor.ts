import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Logger } from './logger.service.js';
import { Request, Response } from 'express';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const requestType = context.getType();
    if (requestType !== 'http') return next.handle();

    const http = context.switchToHttp();
    const request: Request = http.getRequest();
    const response: Response = http.getResponse();
    const { method, originalUrl } = request;
    const startTime = process.hrtime.bigint();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration =
            Number(process.hrtime.bigint() - startTime) / 1_000_000;

          this.logger.log(
            `${method} ${originalUrl} ${response.statusCode} - ${duration.toFixed(2)}ms`,
          );
        },

        error: (error: unknown) => {
          const duration =
            Number(process.hrtime.bigint() - startTime) / 1_000_000;

          const statusCode =
            typeof error === 'object' &&
            error !== null &&
            'getStatus' in error &&
            typeof error.getStatus === 'function'
              ? error.getStatus()
              : 500;

          this.logger.error(
            `${method} ${originalUrl} ${statusCode} - ${duration.toFixed(2)}ms`,
            error instanceof Error ? error.stack : undefined,
            'HTTP',
          );
        },
      }),
    );
  }
}
