import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class WebsocketService {
  private clients = new Map<number, Socket>();

  addClient(userId: number, socket: Socket) {
    this.clients.set(userId, socket);
  }

  removeClient(userId: number) {
    this.clients.delete(userId);
  }
getOnlineUsers() {
    return Array.from(this.clients.keys());
  }
  emitToUser(userId: number, event: string, data: any) {
    const client = this.clients.get(userId);
    if (client) {
      client.emit(event, data);
    }
  }
  //  Send global unread status 
   async updateGlobalUnread(userId: number, chatService: ChatService) {
    const hasUnread = await chatService.hasUnreadMessages(userId);
    this.emitToUser(userId, "new_unread_global", { hasUnread });
  }
 // Broadcast to everyone except the sender
  broadcast(event: string, payload: any, excludeClient?: Socket) {
    this.clients.forEach((client) => {
      if (client !== excludeClient) {
        client.emit(event, payload);
      }
    });
  }
    // 🔥 New: broadcast full list to everyone
 
  broadcastOnlineUsers() {
    const onlineUsers = this.getOnlineUsers();
    this.clients.forEach((client) => {
      client.emit('online_users_list', onlineUsers);
    });
  }
  // broadcast(event: string, data: any) {
    
  //   this.clients.forEach((client) => client.emit(event, data));
  // }
}
