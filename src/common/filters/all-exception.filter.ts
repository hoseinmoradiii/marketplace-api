import { ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { QueryFailedError } from 'typeorm';
import { ValidationException } from '../exceptions/validation.exception.js';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  reasonPhrase: ReasonPhrases | object | string | string[];
}

export class CatchAllErrorsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response: Response = host.switchToHttp().getResponse();

    const errorResponse: ErrorResponse = {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      reasonPhrase: ReasonPhrases.INTERNAL_SERVER_ERROR,
    };

    if (exception instanceof ValidationException) {
      errorResponse.statusCode = exception.getStatus();
      errorResponse.message = exception.message;
      errorResponse.reasonPhrase = exception.validationError;
    } else if (exception instanceof QueryFailedError) {
      errorResponse.statusCode = StatusCodes.BAD_REQUEST;
      errorResponse.message = 'Database error occurred';
      errorResponse.reasonPhrase = (
        exception as QueryFailedError
      ).driverError.message;
    } else if (exception instanceof HttpException) {
      errorResponse.message = exception.message;
      errorResponse.statusCode = exception.getStatus();
      errorResponse.reasonPhrase = exception.getResponse();
    } else {
      console.error('[UnhandledError]', exception);
    }

    return response.status(errorResponse.statusCode).json(errorResponse);
  }
}
