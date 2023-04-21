'use client';

import useSWR from 'swr';
import useSWRSubscription from 'swr/subscription';
import ClientHttp, { fetcher } from './http/http';
import { Chat, Message } from '@prisma/client';
import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { PlusIcon } from './components/icons/PlusIcon';
import { MessageIcon } from './components/icons/MessageIcon';
import { ChatItem } from './components/ChatItem';
import { ArrowRightIcon } from './components/icons/ArrowRightIcon';

type ChatWithFirstMessage = Chat & {
  messages: [Message];
};

function ChatItemError({ children }: { children: any }) {
  return (
    <li className='w-full text-gray-100 bg-gray-800'>
      <div className='md:max-w-2xl lg:max-w-xl xl:max-w-3xl py-6 m-auto flex flex-row items-start space-x-4'>
        <Image
          src='/fullcycle_logo.png'
          width={30}
          height={30}
          alt=''
        />
        <div className='relative w-[calc(100%-115px)] flex flex-col gap-1'>
          <span className='text-red-500'>Ops! Ocorreu um erro: {children}</span>
        </div>
      </div>
    </li>
  );
}

export default function Home() {
  const textAreaRef = useRef<null | HTMLTextAreaElement>(null);
  const formRef = useRef<null | HTMLFormElement>(null);

  const [chatId, setChatId] = useState<string | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);

  const { data: chats, mutate: mutateChats } = useSWR<ChatWithFirstMessage[]>(
    'chats',
    fetcher,
    {
      fallbackData: [],
      revalidateOnFocus: false,
    }
  );

  const { data: messageLoading, error: errorMessageLoading } =
    useSWRSubscription(
      messageId ? `/api/messages/${messageId}/events` : null,
      (path: string, { next }) => {
        console.log('init event source');

        const eventSource = new EventSource(path);
        eventSource.onmessage = (event) => {
          console.log('data received:', event);
          const newMessage = JSON.parse(event.data);
          next(null, newMessage.content);
        };
        eventSource.onerror = (event) => {
          console.log('error:', event);
          eventSource.close();
          //@ts-ignore
          next(event.data, null);
        };
        eventSource.addEventListener('end', (event) => {
          console.log('end:', event);
          eventSource.close();
          const newMessage = JSON.parse(event.data);
          mutateMessages((messages) => [...messages!, newMessage], false);
          next(null, null);
        });

        return () => {
          console.log('close event source');
          eventSource.close();
        };
      }
    );

  const { data: messages, mutate: mutateMessages } = useSWR<Message[]>(
    chatId ? `chats/${chatId}/messages` : null,
    fetcher,
    {
      fallbackData: [],
      revalidateOnFocus: false,
    }
  );

  function showChat(id: string) {
    setChatId(id);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = textAreaRef.current?.value;

    if (!chatId) {
      const newChat: ChatWithFirstMessage = await ClientHttp.post('chats', {
        message,
      });
      mutateChats([newChat, ...(chats || [])], false);
      setChatId(newChat.id);
      setMessageId(newChat.messages[0].id);
    } else {
      const newMessage: Message = await ClientHttp.post(
        `chats/${chatId}/messages`,
        { message }
      );
      mutateMessages([...(messages || []), newMessage], false);
      setMessageId(newMessage.id);
    }

    if (textAreaRef.current) {
      textAreaRef.current.value = '';
    }
  }

  useEffect(() => {
    if (!textAreaRef.current) return;
    const textArea = textAreaRef.current;

    textArea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
      }
    });
    textArea.addEventListener('keyup', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        formRef?.current?.requestSubmit();
      }

      if (textArea.scrollHeight >= 200) {
        textArea.style.overflowY = 'scroll';
      } else {
        textArea.style.overflowY = 'hidden';
        textArea.style.height = 'auto';
        textArea.style.height = textArea.scrollHeight + 'px';
      }
    });
  }, []);

  useLayoutEffect(() => {
    if (!messageLoading) {
      return;
    }
    const chatting = document.querySelector('#chatting') as HTMLUListElement;
    chatting.scrollTop = chatting.scrollHeight;
  }, [messageLoading]);

  function createNewChat() {
    setChatId(null);
    setMessageId(null);
  }

  return (
    <main className='overflow-hidden w-full h-full relative flex'>
      <aside className='bg-gray-900 w-[300px] flex h-screen flex-col p-2'>
        <button
          className='flex p-3 gap-3 rounded hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm mb-1 border border-white/20'
          onClick={() => createNewChat()}
        >
          <PlusIcon className='w-5 h-5' />
          New Chat
        </button>
        <div className='flex-grow overflow-y-auto -mr-2 overflow-hidden'>
          {chats?.map((chat) => (
            <div
              className='pb-2 text-gray-100 text-sm mr-2'
              key={chat.id}
            >
              <button
                className='flex p-3 gap-3 rounded hover:bg-[#3f4679] cursor-pointer hover:pr-4 group w-full'
                onClick={() => showChat(chat.id)}
              >
                <MessageIcon className='h-5 w-5' />
                <div className='max-h-5 overflow-hidden break-all relative w-full text-left'>
                  {chat.messages[0].content}
                  <div className='absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-gray-900 group-hover:from-[#3f4679]'></div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </aside>
      <div className="flex-1 flex-col relative">
        <ul
          id='chatting'
          className='h-screen overflow-y-auto bg-gray-800'
        >
          {messages?.map((message, key) => (
            <ChatItem
              key={key}
              content={message.content}
              is_from_bot={message.is_from_bot}
            />
          ))}
          {messageLoading && (
            <ChatItem
              content={messageLoading}
              is_from_bot={true}
              loading={true}
            />
          )}
          {errorMessageLoading && (
            <ChatItemError>{errorMessageLoading}</ChatItemError>
          )}

          <li className='h-36 bg-gray-800'></li>
        </ul>

        <div className='absolute bottom-0 w-full !bg-transparent bg-gradient-to-b from-gray-800 to-gray-950'>
          <div className='mb-4 mt-2 mx-auto max-w-3xl px-2'>
            <form
              onSubmit={handleSubmit}
              ref={formRef}
            >
              <div className='flex flex-nowrap justify-between items-center py-2 pl-4 pr-1 relative text-white bg-gray-700 rounded'>
                <textarea
                  ref={textAreaRef}
                  tabIndex={0}
                  rows={1}
                  placeholder='Digite sua pergunta'
                  className='resize-none bg-transparent pl-0 outline-none flex-1'
                  defaultValue='Gere uma classe de produto em JavaScript'
                ></textarea>
                <button
                  type='submit'
                  className='px-2 py-1 -my-1 text-gray-400 rounded hover:text-gray-400 hover:bg-gray-900'
                  disabled={messageLoading}
                >
                  <ArrowRightIcon className='text-white-500 w-8' />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
