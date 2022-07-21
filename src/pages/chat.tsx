/* This example requires Tailwind CSS v2.0+ */
import { ChatMessage } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Button from "../components/Button";
import ChatRow from "../components/Chat/ChatRow";
import ChatWindow from "../components/Chat/ChatWindow";
import { trpc } from "../utils/trpc";

export default function Chat() {
  const { data: session } = useSession();
  const conversationsQuery = trpc.useQuery(["chat.getConversations"]);
  const usersQuery = trpc.useQuery(["user.getUsers"]);
  const createConversationMutation = trpc.useMutation([
    "chat.createConversation",
  ]);
  const sendMessageMutation = trpc.useMutation(["chat.sendMessage"]);
  trpc.useSubscription(["chat.onNewMessage", undefined], {
    onNext: (message) => {
      updateLastMessage(message);
    },
  });
  const users = (usersQuery.data?.users || []).filter(
    (user) => user.email !== session?.user?.email
  );
  const conversations = conversationsQuery.data?.conversations || [];
  const [activeConversationId, setActiveConversationId] = useState<
    string | undefined
  >();
  const activeConversationQuery = trpc.useQuery(
    [
      "chat.getConversation",
      { conversationId: activeConversationId as string },
    ],
    { enabled: activeConversationId !== undefined }
  );
  const activeConversation = activeConversationQuery.data?.conversation;

  const createConversation = (participantEmails: string[]) => {
    createConversationMutation.mutate(
      { participantEmails },
      {
        onSuccess(data) {
          setActiveConversationId(data.conversation.id);
          conversationsQuery.refetch();
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
        },
      }
    );
  };
  const updateLastMessage = (message: ChatMessage) => {
    const sideBarConversation = conversations.find(
      (conversation) => conversation.id === message.conversationId
    );
    if (sideBarConversation) sideBarConversation.lastMessage = message;
    if (activeConversation?.id === message.conversationId)
      activeConversation.messages.push(message);
  };

  return (
    <div className="container mx-auto">
      <div className="min-w-full border rounded lg:grid lg:grid-cols-3">
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
                  className="w-6 h-6 text-gray-300"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <input
                type="search"
                className="block w-full py-2 pl-10 bg-gray-100 rounded outline-none"
                name="search"
                placeholder="Search"
                required
              />
              <Button onClick={() => {}} label="Users" />
            </div>
          </div>

          <ul className="overflow-auto h-[32rem]">
            <h2 className="my-2 mb-2 ml-2 text-lg text-gray-600">Users</h2>
            <li>
              {users.map((user) => {
                return (
                  <ChatRow
                    key={user.id}
                    userName={user.name ?? user.email ?? ""}
                    onClick={() => {
                      user.email && createConversation([user.email]);
                    }}
                    avatar={user.image ?? ""}
                  />
                );
              })}
            </li>
            <h2 className="my-2 mb-2 ml-2 text-lg text-gray-600">Chats</h2>
            <li>
              {conversations.map((conversation) => {
                const participant = conversation.participants.at(0);
                console.log("participant", participant?.user.image);
                return (
                  <ChatRow
                    key={conversation.id}
                    userName={participant?.user.name ?? ""}
                    classes={`${
                      conversation.id === activeConversationId
                        ? "bg-gray-100 hover:bg-gray-200"
                        : ""
                    }`}
                    lastMessage={conversation.lastMessage}
                    onClick={() => {
                      setActiveConversationId(conversation.id);
                    }}
                    avatar={participant?.user.image ?? ""}
                  />
                );
              })}
            </li>
          </ul>
        </div>
        {!!activeConversation && (
          <ChatWindow
            conversation={activeConversation}
            onSendMessage={(message) => {
              sendMessage(message, activeConversation.id);
            }}
          />
        )}
      </div>
    </div>
  );
}
