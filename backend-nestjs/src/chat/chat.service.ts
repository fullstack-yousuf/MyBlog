import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
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
      this.participantRepo.create({
        chat,
        user: { id: participantId } as User,
      }),
    ];
    await this.participantRepo.save(participants);

    // Notify the other user
    this.websocketService.emitToUser(participantId, 'chat:new', {
      chatId: chat.id,
    });
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

    return plainToInstance(
      SearchUserDto,
      users.map((u) => ({
        userId: u.id,
        name: u.name,
      })),
    );
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
    const isParticipant = chat.participants.some((p) => p.user.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this chat');
    }

    // Optional: only send relevant data
    return {
      id: chat.id,
      participants: chat.participants.map((p) => ({
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

  // hrlper;
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
// async createMessage(chatId: string, senderId: string, text: string) {
//   const chat = await this.chatRepo.findOne({ where: { id: chatId } });
//   const sender = await this.userRepo.findOne({ where: { id: senderId } });

//   const message = this.messageRepo.create({ chat, sender, text });
//   return this.messageRepo.save(message);
// }

  /**
   * Send a message in a chat
   */
  async sendMessage(chatId: number, userId: number, text: string) {
    const participant = await this.participantRepo.findOne({
      where: { chat: { id: chatId }, user: { id: userId } },
      relations: ['chat', 'user'],
    });

    if (!participant) throw new ForbiddenException('Not a participant');

    // 💬 Create and save message
    const message = this.messageRepo.create({
      chat: { id: chatId } as Chat,
      sender: { id: userId },
      text,
    });

    const savedMessage = await this.messageRepo.save(message);

    // 🕒 Update chat updatedAt
    await this.chatRepo.update(chatId, { updatedAt: new Date() });

    // 👥 Fetch all participants
    const participants = await this.participantRepo.find({
      where: { chat: { id: chatId } },
      relations: ['user'],
    });

    // Iterate participants (sender + receiver)
    for (const p of participants) {
      if (p.user.id === userId) {
        /** ✅ Sender: reset their unread count (if needed) */
        if (p.unreadCount !== 0) {
          p.unreadCount = 0;
          await this.participantRepo.save(p);

          this.websocketService.emitToUser(p.user.id, 'unread_update', {
            chatId,
            unread: 0,
          });
        }

        // 🔄 Optional: update global unread status (in case all read)
        await this.websocketService.updateGlobalUnread(p.user.id, this);
      } else {
        /** 📈 Receiver: increment unread count */
        await this.participantRepo.increment({ id: p.id }, 'unreadCount', 1);

        // 🔔 Send message event
        this.websocketService.emitToUser(p.user.id, 'message:received', {
          chatId,
          message: savedMessage,
        });

        // 🔔 Update unread for chat sidebar
        this.websocketService.emitToUser(p.user.id, 'unread_update', {
          chatId,
          unread: p.unreadCount + 1,
        });

        // 💡 Update global navbar glow
        await this.websocketService.updateGlobalUnread(p.user.id, this);
      }
    }

    return savedMessage;
  }

  async getTotalUnread(userId: number) {
    const total = await this.participantRepo
      .createQueryBuilder('p')
      .select('SUM(p.unreadCount)', 'total')
      .where('p.user.id = :userId', { userId })
      .getRawOne();

    return { total: Number(total.total) || 0 };
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

    await this.websocketService.updateGlobalUnread(userId, this);

    return { success: true };
  }
  async hasUnreadMessages(userId: number): Promise<boolean> {
    const count = await this.participantRepo.count({
      where: { user: { id: userId }, unreadCount: Not(0) },
    });
    return count > 0;
  }
}
