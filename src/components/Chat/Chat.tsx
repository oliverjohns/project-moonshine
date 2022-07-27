/* This example requires Tailwind CSS v2.0+ */
import { ChatConversation, ChatMessage, ChatParticipant, User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { KeyboardEvent, useState } from 'react';
import ChatRow from '../../components/Chat/ChatRow';
import ChatWindow from '../../components/Chat/ChatWindow';
import { AppWrapper } from '../../pages';
import { useSubscribeToEvent } from '../../utils/pusher';
import { trpc } from '../../utils/trpc';

export type FullChatConversation = ChatConversation & {
  messages: ChatMessage[];
  participants: (ChatParticipant & {
    user: User;
  })[];
};

export default function Chat() {
  const { data: sesh } = useSession();

  const [userSearchInput, setUserSearchInput] = useState<string>('');
  const [userSearchQuery, setUserSearchQuery] = useState<string | undefined>();
  const conversationsQuery = trpc.proxy.chat.getAll.useQuery();
  const usersQuery = trpc.useQuery(['user.query', { query: userSearchQuery ?? '' }], { enabled: !!userSearchQuery });
  const createConversationMutation = trpc.proxy.chat.createConversation.useMutation();
  const sendMessageMutation = trpc.useMutation(['chat.sendMessage']);

  const users = (usersQuery.data?.users || []).filter(user => user.id !== sesh?.user?.id);
  const conversations = conversationsQuery.data?.conversations || [];
  const [activeConversation, setActiveConversation] = useState<{
    id?: string;
    conversation?: FullChatConversation;
  }>();
  trpc.useQuery(['chat.getFull', { conversationId: activeConversation?.id as string }], {
    enabled: activeConversation?.id !== undefined,
    onSuccess(data) {
      if (data.conversation)
        setActiveConversation({
          id: data.conversation?.id,
          conversation: data.conversation,
        });
      setUserSearchQuery(undefined);
    },
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      setUserSearchQuery(userSearchInput);
    }
  };

  const pushMessage = (message: ChatMessage) => {
    if (activeConversation?.conversation)
      setActiveConversation({
        ...activeConversation,
        conversation: {
          ...activeConversation.conversation,
          messages: [...activeConversation?.conversation.messages, message],
        },
      });
  };

  useSubscribeToEvent(`chat-message`, (data: { message: ChatMessage; authorId: string }) => {
    if (data && data.authorId !== sesh?.user?.id) {
      console.log('receivedMessage', data);
      updateLastMessage(data.message);
      if (data.message.conversationId === activeConversation?.id) pushMessage(data.message);
    }
  });

  const createConversation = (participantIds: string[]) => {
    createConversationMutation.mutate(
      { participantIds },
      {
        onSuccess(data) {
          setActiveConversation({ id: data?.conversation?.id });
          conversationsQuery.refetch();
          setUserSearchQuery(undefined);
        },
      }
    );
  };

  const sendMessage = (content: string, conversationId: string) => {
    sendMessageMutation.mutate(
      { content, conversationId },
      {
        onSuccess(data) {
          updateLastMessage(data.message);
          pushMessage(data.message);
        },
      }
    );
  };
  const updateLastMessage = (message: ChatMessage) => {
    const sideBarConversation = conversations.find(conversation => conversation.id === message.conversationId);
    if (sideBarConversation) sideBarConversation.lastMessage = message;
  };

  if (!sesh || !sesh.user?.id) return null;

  return (
    <AppWrapper>
      <div className="container mx-auto">
        <div className="min-w-full rounded border lg:grid lg:grid-cols-3">
          <div className="border-r border-gray-300 lg:col-span-1">
            <div className="mx-3 my-3">
              <div className="relative text-gray-600">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    className="h-6 w-6 text-gray-300"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search"
                  className="block w-full rounded bg-gray-100 py-2 pl-10 outline-none"
                  name="search"
                  onKeyDown={handleKeyDown}
                  value={userSearchInput}
                  onChange={event => setUserSearchInput(event.target.value)}
                  required
                />
              </div>
            </div>

            <ul className="h-[32rem] overflow-auto">
              {userSearchQuery ? (
                <>
                  <h2 className="my-2 mb-2 ml-2 text-lg text-gray-600">Users</h2>
                  <li>
                    {users.map(user => {
                      return (
                        <ChatRow
                          key={user.id}
                          userName={user.name ?? user.id ?? ''}
                          onClick={() => {
                            user.id && createConversation([user.id]);
                          }}
                          avatar={user.image ?? ''}
                        />
                      );
                    })}
                  </li>
                </>
              ) : (
                <>
                  <h2 className="my-2 mb-2 ml-2 text-lg text-gray-600">Chats</h2>
                  <li>
                    {conversations.map(conversation => {
                      const participant = conversation.participants.at(0);
                      return (
                        <ChatRow
                          key={conversation.id}
                          userName={participant?.user.name ?? ''}
                          classes={`${
                            conversation.id === activeConversation?.id ? 'bg-gray-100 hover:bg-gray-200' : ''
                          }`}
                          lastMessage={conversation.lastMessage}
                          onClick={() => {
                            setActiveConversation({ id: conversation?.id });
                          }}
                          avatar={participant?.user.image ?? ''}
                        />
                      );
                    })}
                  </li>
                </>
              )}
            </ul>
          </div>
          {!!activeConversation?.conversation && (
            <ChatWindow
              conversation={activeConversation.conversation}
              onSendMessage={message => {
                sendMessage(message, activeConversation.id ?? '');
              }}
            />
          )}
        </div>
      </div>
    </AppWrapper>
  );
}
