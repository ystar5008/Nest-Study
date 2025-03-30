import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { CacheTTL } from '@nestjs/cache-manager';
import { cli } from 'winston/lib/winston/config';
import { UseInterceptors } from '@nestjs/common';
import { WsTranscationInterceptor } from 'src/common/interceptor/ws-transaction.interceptor';
import { WsQueryRunner } from 'src/common/decorator/ws-queryrunner.decorator';
import { QueryRunner } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  handleDisconnect(client: any) {
    const user = client.data.user;

    if (user) {
      this.chatService.removeClient(user.sub);
    }
  }

  async handleConnection(client: Socket) {
    try {
      const rawToken = client.handshake.headers['authorization'];

      console.log(client.handshake);
      const payload = await this.authService.parseBearerToken(rawToken, false);

      if (payload) {
        client.data.user = payload;
        this.chatService.registerClient(payload.sub, client);
        await this.chatService.joinUserRooms(payload, client);
      } else {
        client.disconnect();
      }
    } catch (e) {
      console.log(e);
      client.disconnect();
    }
  }

  @SubscribeMessage('sendMessage')
  @UseInterceptors(WsTranscationInterceptor)
  async handleMesaage(
    @MessageBody() body: CreateChatDto,
    @ConnectedSocket() client: Socket,
    @WsQueryRunner() qr: QueryRunner,
  ) {
    const payload = client.data.user;
    await this.chatService.createMesaage(payload, body, qr);
  }
}
