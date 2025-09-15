import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, BadRequestException
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Capturar errores de validación de DTO
    let validationErrors = null;
    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        validationErrors = (response as any).message;
      }
    }

    const payload = {
      ok: false,
      status,
      // en dev exponemos más info
      error: {
        name: exception?.name ?? 'Error',
        message: isHttp ? exception.message : (exception?.message ?? 'Internal error'),
        stack: process.env.NODE_ENV !== 'production' ? exception?.stack : undefined,
        validationErrors: validationErrors,
        supabase: exception?.details ? {
          code: exception?.code,
          message: exception?.message,
          details: exception?.details,
          hint: exception?.hint,
        } : undefined,
      },
    };

    res.status(status).json(payload);
  }
}



