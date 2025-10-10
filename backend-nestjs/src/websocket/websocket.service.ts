import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WebsocketService {
  private clients = new Map<number, Socket>();

  addClient(userId: number, socket: Socket) {
    this.clients.set(userId, socket);
  }

  removeClient(userId: number) {
    this.clients.delete(userId);
  }

  emitToUser(userId: number, event: string, data: any) {
    const client = this.clients.get(userId);
    if (client) {
      client.emit(event, data);
    }
  }

  broadcast(event: string, data: any) {
    this.clients.forEach((client) => client.emit(event, data));
  }
}
