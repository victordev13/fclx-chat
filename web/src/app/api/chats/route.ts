import { prisma } from '@/app/prisma/prisma';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../helpers';

export const POST = withAuth(async (req: NextRequest, _, token) => {
  const body = await req.json();
  if (!body?.message) {
    return NextResponse.json(
      {
        error: 'message not informed',
      },
      { status: 400 }
    );
  }

  const chat = await prisma.chat.create({
    data: {
      user_id: token.sub!,
      messages: {
        create: {
          content: body.message,
        },
      },
    },
    select: {
      id: true,
      messages: true,
    },
  });

  return NextResponse.json(chat);
});

export const GET = withAuth(async (req: NextRequest, _, token) => {
  const chats = await prisma.chat.findMany({
    where: {
      user_id: token.sub!
    },
    select: {
      id: true,
      messages: {
        orderBy: {
          created_at: 'asc',
        },
        take: 1,
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return NextResponse.json(chats);
});
