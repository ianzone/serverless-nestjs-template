import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AuthMiddleware } from 'src/middleware';
import { UsersModule } from 'src/routes';
import { InternalFilter } from './internal.filter';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    })
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: InternalFilter,
    },
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        'docs-json',
        'docs/(.*)',
      )
      .forRoutes('*');
  }
}
