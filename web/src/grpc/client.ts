import * as protoLoader from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import path from 'path';
import { ProtoGrpcType } from './rpc/chat';

const packageDefinition = protoLoader.loadSync(
  path.resolve(process.cwd(), 'proto', 'chat.proto')
);

const proto = grpc.loadPackageDefinition(
  packageDefinition
) as unknown as ProtoGrpcType;

export const chatClient = new proto.pb.ChatService(
  '127.0.0.1:50052',
  grpc.credentials.createInsecure()
);
