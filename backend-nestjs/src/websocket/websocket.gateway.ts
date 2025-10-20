import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WebsocketService } from './websocket.service';
import { ChatService } from '../chat/chat.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow frontend connections (configure in production)
  },
})
export class WebsocketGateway
implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly websocketService: WebsocketService,
    private readonly chatService: ChatService, // ✅ Inject ChatService
  ) {}

  /**
   * Handle new WebSocket client connections
   */
  handleConnection(client: Socket): void {
    const authHeader = client.handshake.auth?.token;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader. split(' ')[1]
      : authHeader;

    if (!token) {
      console.warn('⚠️ No token provided. Disconnecting client.');
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.userId = payload.id;
      this.websocketService.addClient(payload.id, client);
    this.websocketService.broadcast("user_online",payload.id,client);
    
    const onlineUsers = this.websocketService.getOnlineUsers();
    this.websocketService.broadcast("online_users_list", onlineUsers);

      console.log(`✅ User ${payload.id} connected via WebSocket`);
    } catch (error) {
      console.error('❌ Invalid token, disconnecting...', error.message);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket): void {
    if (client.data?.userId) {

      this.websocketService.removeClient(client.data.userId);
          this.websocketService.broadcast("user_offline", { id: client.data.userId });
          
    // 🔥 Broadcast updated online users list again
    const onlineUsers = this.websocketService.getOnlineUsers();
    this.websocketService.broadcast("online_users_list", onlineUsers);

      console.log(`🔌 User ${client.data.userId} disconnected`);
    } else {
      console.log('🔌 Unknown client disconnected');
    }
  }
  // 🧠 Join chat room
  @SubscribeMessage('join_chat')
  handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    client.join(`chat_${chatId}`);
    console.log(`👥 User ${client.data.userId} joined chat_${chatId}`);
  }

  // 🚪 Leave chat room
  @SubscribeMessage('leave_chat')
  handleLeaveChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    client.leave(`chat_${chatId}`);
    console.log(`👋 User ${client.data.userId} left chat_${chatId}`);
  }

  // 💬 Send message (frontend → backend)
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: number; text: string; senderId: number },
  ) {
    try {
      const savedMessage = await this.chatService.sendMessage(
        data.chatId,
        data.senderId,
        data.text,
      );

      // 🟢 Emit message to all in chat room
      this.server.to(`chat_${data.chatId}`).emit('new_message', {
        chatId: data.chatId,
        message: savedMessage,
      });

      console.log(`💬 Message sent in chat_${data.chatId}`);
    } catch (err) {
      console.error('❌ Error sending message:', err.message);
      client.emit('error_message', { error: err.message });
    }
  }

  // 🔔 Typing indicators
  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string; userId: string }) {
    client.to(`chat_${data.chatId}`).emit('user_typing', data.userId);
  }

  @SubscribeMessage('stop_typing')
  handleStopTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string; userId: string }) {
    client.to(`chat_${data.chatId}`).emit('user_stop_typing', data.userId);
  }
}
// import {
//   WebSocketGateway,
//   WebSocketServer,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   SubscribeMessage,
//   ConnectedSocket,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { JwtService } from '@nestjs/jwt';
// import { WebsocketService } from './websocket.service';

// @WebSocketGateway({
//   cors: {
//     origin: '*', // Allow frontend connections (configure in production)
//   },
// })
// export class WebsocketGateway
//   implements OnGatewayConnection, OnGatewayDisconnect
// {
//   @WebSocketServer() server: Server;

//   constructor(
//     private readonly jwtService: JwtService,
//     private readonly websocketService: WebsocketService,
//   ) {}

//   /**
//    * Handle new WebSocket client connections
//    */
//   handleConnection(client: Socket): void {
//     const authHeader = client.handshake.auth?.token;
//     const token = authHeader?.startsWith('Bearer ')
//       ? authHeader. split(' ')[1]
//       : authHeader;

//     if (!token) {
//       console.warn('⚠️ No token provided. Disconnecting client.');
//       client.disconnect();
//       return;
//     }

//     try {
//       const payload = this.jwtService.verify(token, {
//         secret: process.env.JWT_SECRET,
//       });

//       client.data.userId = payload.id;
//       this.websocketService.addClient(payload.id, client);

//       console.log(`✅ User ${payload.id} connected via WebSocket`);
//     } catch (error) {
//       console.error('❌ Invalid token, disconnecting...', error.message);
//       client.disconnect();
//     }
//   }

//   /**
//    * Handle client disconnection
//    */
//   handleDisconnect(client: Socket): void {
//     if (client.data?.userId) {
//       this.websocketService.removeClient(client.data.userId);
//       console.log(`🔌 User ${client.data.userId} disconnected`);
//     } else {
//       console.log('🔌 Unknown client disconnected');
//     }
//   }

//   /**
//    * Example test event: ping/pong
//    */
//   @SubscribeMessage('ping')
//   handlePing(@ConnectedSocket() client: Socket): void {
//     client.emit('pong', 'alive');
//   }
// }
