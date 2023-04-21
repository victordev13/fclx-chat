import { describe } from 'node:test';
import { ChatServiceClientFactory } from './chat-service-client';

describe('ChatServiceClient', () => {
  it('grpc client', (done) => {
    const chatService = ChatServiceClientFactory.create();
    const stream = chatService.chatStream({
      user_id: '1',
      message: 'hello world',
    });

    stream.on('end', () => {
      done()
    })
  });
});
