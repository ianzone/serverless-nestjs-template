import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from 'src/middleware';
import { UsersModule } from 'src/routes';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    })
  ],
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
