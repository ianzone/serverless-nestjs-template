import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class InternalFilter extends BaseExceptionFilter {
  logger = new Logger(InternalFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    if (!(exception instanceof HttpException)) {
      const ctx = host.switchToHttp();
      const req = ctx.getRequest();
      this.logger.error({ Params: req.params })
      this.logger.error({ Query: req.query })
      this.logger.error({ Headers: req.headers })
      this.logger.error({ Body: req.body })
    }
    super.catch(exception, host);
  }
}