import { Metadata } from '@grpc/grpc-js';
import { chatClient } from './client';
import { ChatServiceClient as GrpcChatService } from './rpc/pb/ChatService';

const authorization = '123456';

class ChatServiceClient {
  constructor(private chatClient: GrpcChatService) {}

  chatStream(data: { chat_id?: string; user_id: string; message: string }) {
    const metadata = new Metadata();
    metadata.set('authorization', authorization);
    const stream = this.chatClient.chatStream(
      {
        chatId: data.chat_id,
        userId: data.user_id,
        userMessage: data.message,
      },
      metadata
    );

    stream
      .on('data', (data) => {
        console.log('data', data);
      })
      .on('error', (err) => {
        console.log(err);
      })
      .on('end', () => {
        console.log('end');
      });

    return stream;
  }
}

export class ChatServiceClientFactory {
  static create() {
    return new ChatServiceClient(chatClient);
  }
}
