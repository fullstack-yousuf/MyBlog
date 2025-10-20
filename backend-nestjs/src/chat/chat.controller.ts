import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { PaginationDto } from './dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // -------------------
  // Create or find a private chat
  // -------------------
  @Post()
  async findOrCreateChat(@Req() req, @Body() dto: CreateChatDto) {
    const user = req.user as any;
    // console.log("user coning on serach in req",user);

    return this.chatService.findOrCreatePrivateChat(user.id, dto);
  }

  // -------------------
  // Get all chats for current user
  // -------------------
  @Get()
  async getChats(@Req() req) {
    const user = req.user as any;
    return this.chatService.getUserChats(user.id);
  }

  // -------------------
  // Search users (exclude current user)
  // -------------------
  @Get('search/users')
  async searchUsers(@Req() req, @Query('q') q: string) {
    return this.chatService.searchUsers(req.user['id'], q);
  }

  // -------------------
  // Get chat by ID (with participants and last message)
  // -------------------
  @Get(':chatId')
  async getChatById(@Param('chatId') chatId: number, @Req() req) {
    const user = req.user as any;
    return this.chatService.getChatById(chatId, user.id);
  }
  // -------------------
  // Get messages in a chat
  // -------------------
  @Get(':chatId/messages')
  async getMessages(
    @Param('chatId') chatId: number,
    @Req() req,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    const user = req.user as any;
    return this.chatService.getMessages(chatId, user.id, limit, skip);
  }

  // -------------------
  // Send a message
  // -------------------
  @Post(':chatId/message')
  async sendMessage(
    @Param('chatId') chatId: number,
    @Body('text') text: string,
    @Req() req,
  ) {
    const user = req.user as any;
    if (!text?.trim()) throw new ForbiddenException('Message text required');
    return this.chatService.sendMessage(chatId, user.id, text);
  }
  @Get('unread/total')
  async getTotalUnread(@Req() req) {
    const user = req.user as any;
    return this.chatService.getTotalUnread(user.id);
  }

  // -------------------
  // Mark chat as read
  // -------------------
  @Post(':chatId/read')
  async markAsRead(@Param('chatId') chatId: number, @Req() req) {
    const user = req.user as any;
    return this.chatService.markAsRead(chatId, user.id);
  }
}