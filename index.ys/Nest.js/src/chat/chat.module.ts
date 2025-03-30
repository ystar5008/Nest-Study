import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { ChatRoom } from './entity/chat-room.entity';
import { Chat } from './entity/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Chat, ChatRoom]), AuthModule],
  providers: [ChatGateway, ChatService, AuthService],
})
export class ChatModule {}
