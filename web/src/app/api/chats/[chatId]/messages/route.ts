import { withAuth } from '@/app/api/helpers';
import { prisma } from '@/app/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(
  async (_, { params }: { params: { chatId: string } }, token) => {
    let chat = null;
    try {
      chat = await prisma.chat.findUniqueOrThrow({
        where: {
          id: params.chatId,
        },
      });
    } catch (err) {
      return NextResponse.json(
        {
          error: 'chat not found',
        },
        { status: 404 }
      );
    }

    if (chat.user_id !== token.sub) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: {
        chat_id: params.chatId,
      },
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json(messages);
  }
);

export const POST = withAuth(
  async (
    request: NextRequest,
    { params }: { params: { chatId: string } },
    token
  ) => {
    const body = await request.json();
    if (!body?.message) {
      return NextResponse.json(
        {
          error: 'message not informed',
        },
        { status: 400 }
      );
    }

    let chat = null;
    try {
      chat = await prisma.chat.findUniqueOrThrow({
        where: {
          id: params.chatId,
        },
      });
    } catch (err) {
      return NextResponse.json(
        {
          error: 'chat not found',
        },
        { status: 404 }
      );
    }

    if (chat.user_id !== token.sub) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const createdMessage = await prisma.message.create({
      data: {
        content: body.message,
        chat_id: chat.id,
      },
    });

    return NextResponse.json(createdMessage);
  }
);
