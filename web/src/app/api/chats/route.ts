import { prisma } from '@/app/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body?.message) {
    return NextResponse.json({
      error: "message not informed"
    }, {status: 400})
  }

  const chat = await prisma.chat.create({
    data: {
      messages: {
        create: {
          content: body.message,
        }
      }
    },
    select: {
      id: true,
      messages: true,
    }
  })

  return NextResponse.json(chat)
}

export async function GET(req: NextRequest) {
  const chats = await prisma.chat.findMany({
    select: {
      id: true,
      messages: {
        orderBy: {
          created_at: "asc",
        },
        take: 1
      }
    },
    orderBy: {
      created_at: "desc"
    }
  })

  return NextResponse.json(chats)
}
