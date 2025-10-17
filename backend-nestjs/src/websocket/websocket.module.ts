import { forwardRef, Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';
import { JwtModule } from '@nestjs/jwt';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [JwtModule.register({}),   forwardRef(() => ChatModule)],
  providers: [WebsocketGateway, WebsocketService],
  exports: [WebsocketService],
})
export class WebsocketModule {}
