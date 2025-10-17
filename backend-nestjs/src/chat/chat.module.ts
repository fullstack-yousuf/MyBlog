import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { Message } from './entities/message.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { User } from '..//auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, ChatParticipant, Message,User]), forwardRef(() => WebsocketModule)],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
