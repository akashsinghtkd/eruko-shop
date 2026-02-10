import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const defaultMessage = isHttpException
      ? (exception as HttpException).message
      : 'Internal server error';

    const errorResponse: any =
      isHttpException && (exception as HttpException).getResponse();

    const message =
      typeof errorResponse === 'object' && errorResponse && 'message' in errorResponse
        ? (errorResponse as any).message
        : defaultMessage;

    response.status(status).json({
      statusCode: status,
      message,
      error: isHttpException ? (errorResponse as any)?.error ?? null : 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

