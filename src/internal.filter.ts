import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class InternalFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (!(exception instanceof HttpException)) {
      const ctx = host.switchToHttp();
      const req = ctx.getRequest();
      console.error(req.params)
      console.error(req.query)
      console.error(req.headers)
      console.error(req.body)
    }
    super.catch(exception, host);
  }
}