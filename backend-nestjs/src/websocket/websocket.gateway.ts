import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WebsocketService } from './websocket.service';

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
      console.log(`🔌 User ${client.data.userId} disconnected`);
    } else {
      console.log('🔌 Unknown client disconnected');
    }
  }

  /**
   * Example test event: ping/pong
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', 'alive');
  }
}
