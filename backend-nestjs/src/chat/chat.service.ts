import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { Message } from './entities/message.entity';
import { User } from '../auth/entities/user.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { WebsocketService } from '../websocket/websocket.service';
import { plainToInstance } from 'class-transformer';
import { ChatListItemDto, SearchUserDto } from './dto/chat-response.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatParticipant)
    private readonly participantRepo: Repository<ChatParticipant>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly websocketService: WebsocketService, // ✅ Inject your socket service
  ) {}

  /**
   * Find or create private chat between two users
   */

// async findOrCreatePrivateChat(userId: number, dto: CreateChatDto) {
//   const { participantId } = dto;

//   console.log('the id ', userId);
//   console.log('the id p ', participantId);

//   // ✅ Find existing chat that has both users
//   const existingChat = await this.chatRepo
//     .createQueryBuilder('chat')
//     .leftJoinAndSelect('chat.participants', 'p')
//     .leftJoinAndSelect('p.user', 'u')
//     .where('chat.type = :type', { type: 'private' })
//     .andWhere('u.id IN (:...ids)', { ids: [userId, participantId] })
//     .groupBy('chat.id')
//     .having('COUNT(DISTINCT u.id) = 2')
//     .getOne();

//   console.log('log the existing chat', existingChat);

//   if (existingChat) return existingChat;

//   // ✅ Otherwise, create a new private chat
//   const chat = this.chatRepo.create({ type: 'private' });
//   await this.chatRepo.save(chat);

//   const participants = [
//     this.participantRepo.create({ chat, user: { id: userId } as User }),
//     this.participantRepo.create({ chat, user: { id: participantId } as User }),
//   ];
//   await this.participantRepo.save(participants);

//   console.log('log the create chat', chat);
//   console.log('log the participant', participants);

//   // 🔔 Emit socket event to notify user
//   this.websocketService.emitToUser(participantId, 'chat:new', { chatId: chat.id });

//   // ✅ Load chat again with participants included
//   const fullChat = await this.chatRepo.findOne({
//     where: { id: chat.id },
//     relations: ['participants', 'participants.user'],
//   });

//   return fullChat;
// }
 /**
   * 🧠 Find existing private chat or create new
   */
  async findOrCreatePrivateChat(userId: number, dto: CreateChatDto) {
    const { participantId } = dto;

    // ✅ Check if private chat already exists
    const existingChat = await this.chatRepo
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .where('chat.type = :type', { type: 'private' })
      .andWhere('u.id IN (:...ids)', { ids: [userId, participantId] })
      .groupBy('chat.id')
      .having('COUNT(DISTINCT u.id) = 2')
      .getOne();

    if (existingChat) return existingChat;

    // ✅ Create a new chat
    const chat = this.chatRepo.create({ type: 'private' });
    await this.chatRepo.save(chat);

    const participants = [
      this.participantRepo.create({ chat, user: { id: userId } as User }),
      this.participantRepo.create({ chat, user: { id: participantId } as User }),
    ];
    await this.participantRepo.save(participants);

    // Notify the other user
    this.websocketService.emitToUser(participantId, 'chat:new', { chatId: chat.id });
    // this.websocketService.broadcast("user_online",{id:userId});


    // Return chat with participants loaded
    return await this.chatRepo.findOne({
      where: { id: chat.id },
      relations: ['participants', 'participants.user'],
    });
  }
 /**
   * 🔍 Search users for chat sidebar
   */
    async searchUsers(userId: number, query: string): Promise<SearchUserDto[]> {
    if (!query.trim()) return [];

    const users = await this.userRepo
      .createQueryBuilder('user')
      .where('user.id != :userId', { userId })
      .andWhere('LOWER(user.name) LIKE :q', { q: `%${query.toLowerCase()}%` })
      .limit(10)
      .getMany();

    return plainToInstance(SearchUserDto, users.map((u) => ({
      userId: u.id,
      name: u.name,
    })));
  }
 


async getChatById(chatId: number, userId: number) {
  const chat = await this.chatRepo.findOne({
    where: { id: chatId },
    relations: ['participants', 'participants.user', 'messages'],
    order: { messages: { createdAt: 'DESC' } },
  });

  if (!chat) {
    throw new NotFoundException('Chat not found');
  }

  // Check if current user is part of the chat
  const isParticipant = chat.participants.some(p => p.user.id === userId);
  if (!isParticipant) {
    throw new ForbiddenException('You are not a participant in this chat');
  }

  // Optional: only send relevant data
  return {
    id: chat.id,
    participants: chat.participants.map(p => ({
      id: p.user.id,
      name: p.user.name,
    })),
    lastMessage: chat.messages[0]
      ? { text: chat.messages[0].text, createdAt: chat.messages[0].createdAt }
      : null,
  };
}
/**
   * 🧩 Get all chats for a user (sidebar)
   */
  async getUserChats(userId: number): Promise<ChatListItemDto[]> {
    const chats = await this.chatRepo.find({
      relations: ['participants', 'participants.user', 'messages'],
      order: { updatedAt: 'DESC' },
    });

    const result = chats
      .filter((chat) => chat.participants.some((p) => p.user.id === userId))
      .map((chat) => {
        const currentUser = chat.participants.find((p) => p.user.id === userId);
        const otherUser = chat.participants.find((p) => p.user.id !== userId);
        const lastMessage = chat.messages?.at(-1);

        return {
          chatId: chat.id,
          name: otherUser?.user?.name ?? 'Unknown',
          lastMessage: lastMessage?.text ?? '',
          unread: currentUser?.unreadCount ?? 0,
        };
      });

    return plainToInstance(ChatListItemDto, result);
  }
//  async getUserChats(userId: number) {
//     // Fetch only necessary data with relations
//     const chats = await this.chatRepo.find({
//       relations: [
//         'participants',
//         'participants.user',
//         'messages',
//         'messages.sender',
//       ],
//       order: { updatedAt: 'DESC' },
//     });

//     // Filter and transform in one pass
//     return chats
//       .filter((chat) => chat.participants.some((p) => p.user.id === userId))
//       .map((chat) => {
//         const currentUser = chat.participants.find(
//           (p) => p.user.id === userId,
//         );
//         const otherParticipant = chat.participants.find(
//           (p) => p.user.id !== userId,
//         );
//         const lastMessage =
//           chat.messages?.length > 0
//             ? chat.messages[chat.messages.length - 1]
//             : null;

//         return {
//           chatId: chat.id,
//           name: otherParticipant?.user?.name || 'Unknown',
//           lastMessage: lastMessage?.text || '',
//           unread: currentUser?.unreadCount || 0,
//         //   updatedAt: chat.updatedAt,
//         };
//       });
//   }
hrlper
async getParticipants(chatId: number) {
  return this.participantRepo.find({
    where: { chat: { id: chatId } },
    relations: ['user'],
  });
}

  /**
   * Get messages for a specific chat
   */
  async getMessages(chatId: number, userId: number, limit = 50, skip = 0) {
    const isParticipant = await this.participantRepo.findOne({
      where: { chat: { id: chatId }, user: { id: userId } },
    });
    if (!isParticipant) throw new ForbiddenException();

    return this.messageRepo.find({
      where: { chat: { id: chatId } },
      order: { createdAt: 'ASC' },
      take: limit,
      skip,
    });
  }

  /**
   * Send a message in a chat
   */
  async sendMessage(chatId: number, userId: number, text: string) {
    const participant = await this.participantRepo.findOne({
      where: { chat: { id: chatId }, user: { id: userId } },
    });
    if (!participant) throw new ForbiddenException('Not a participant');

    const message = this.messageRepo.create({
      chat: { id: chatId } as Chat,
      sender: { id: userId },
      text,
    });

    const saved = await this.messageRepo.save(message);
    await this.chatRepo.update(chatId, { updatedAt: new Date() });

    // 🔔 Notify all participants (except sender)
    const participants = await this.participantRepo.find({
      where: { chat: { id: chatId } },
      relations: ['user'],
    });

    participants.forEach((p) => {
      if (p.user.id !== userId) {
        this.websocketService.emitToUser(p.user.id, 'message:received', {
          chatId,
          message: saved,
        });
      }
    });

    return saved;
  }

  /**
   * Mark chat as read
   */
  async markAsRead(chatId: number, userId: number) {
    const result = await this.participantRepo.update(
      { chat: { id: chatId }, user: { id: userId } },
      { unreadCount: 0 },
    );

    if (!result.affected) throw new NotFoundException('Chat not found');

    return { success: true };
  }
  
}
