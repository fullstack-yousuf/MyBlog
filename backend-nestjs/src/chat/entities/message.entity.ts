import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column()
  text: string;

  @CreateDateColumn()
  createdAt: Date;
}
