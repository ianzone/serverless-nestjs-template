import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class InternalFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (!(exception instanceof HttpException)) {
      const ctx = host.switchToHttp();
      const req = ctx.getRequest();
      console.log(req.params)
      console.log(req.query)
      console.log(req.headers)
      console.log(req.body)
    }
    super.catch(exception, host);
  }
}