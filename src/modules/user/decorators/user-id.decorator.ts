import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

export const UserId = createParamDecorator(
  (_: any, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getResponse();
    const userId = request.userId;
    if (!userId) throw new ForbiddenException('Access Denied');
    return userId;
  },
);
