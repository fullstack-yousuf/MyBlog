import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/config.module';
import { PostsModule } from './posts/posts.module';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    AuthModule,
    AppConfigModule,
    DatabaseModule,
    WebsocketModule,
    PostsModule,
    ChatModule,
  ],
})
export class AppModule {}
