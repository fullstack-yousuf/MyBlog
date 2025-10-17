import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('chat_participants')
export class ChatParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: 0 })
  unreadCount: number;
}
