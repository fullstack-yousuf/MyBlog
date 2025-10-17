import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ChatParticipant } from './chat-participant.entity';
import { Message } from './message.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'private' })
  type: 'private' | 'group';

  @OneToMany(() => ChatParticipant, (p) => p.chat)
  participants: ChatParticipant[];

  @OneToMany(() => Message, (m) => m.chat)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
