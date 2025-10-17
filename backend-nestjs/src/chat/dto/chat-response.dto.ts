// dto/chat-response.dto.ts
import { Expose } from 'class-transformer';

export class ChatListItemDto {
  @Expose() chatId: number;
  @Expose() name: string;
  @Expose() lastMessage?: string;
  @Expose() unread: number;
}

export class SearchUserDto {
  @Expose() userId: number;
  @Expose() name: string;
}
