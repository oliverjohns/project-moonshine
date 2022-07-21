import { ChatConversation, ChatMessage, ChatParticipant } from "@prisma/client";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { KeyboardEvent, useState } from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  conversation: ChatConversation & {
    messages: ChatMessage[];
    participants: (ChatParticipant & {
      user: User;
    })[];
  };
  onSendMessage: (message: string) => void;
  classes?: string;
}

export default function ChatWindow({
  conversation,
  onSendMessage,
  classes,
}: Props) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const userParticipant = conversation.participants.find(
    (p) => p.user.email !== userEmail
  )?.user;
  const [message, setMessage] = useState<string>("");

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      onSendMessage(message);
      setMessage("");
    }
  };

  const ChatMessage = ({
    text,
    authorEmail,
  }: {
    text: string;
    authorEmail: string;
  }) =>
    authorEmail === userEmail ? (
      <li className="flex justify-start">
        <div className="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
          <span className="block">{text}</span>
        </div>
      </li>
    ) : (
      <li className="flex justify-end">
        <div className="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
          <span className="block">{text}</span>
        </div>
      </li>
    );
  const mergedClasses = twMerge("hidden lg:col-span-2 lg:block", classes ?? "");
  return (
    <div className={mergedClasses}>
      <div className="w-full">
        <div className="relative flex items-center p-3 border-b border-gray-300">
          <div className="w-10 h-10 relative">
            {userParticipant?.image && (
              <Image
                className="object-cover rounded-full"
                layout="fill"
                src={userParticipant.image}
                alt="username"
              />
            )}
          </div>
          <span className="block ml-2 font-bold text-gray-600">
            {userParticipant?.name ?? ""}
          </span>
          <span className="absolute w-3 h-3 bg-green-600 rounded-full left-10 top-3"></span>
        </div>
        <div className="relative w-full p-6 overflow-y-auto h-[40rem]">
          <ul className="space-y-2">
            {conversation.messages.map((message, index) => (
              <ChatMessage
                key={index}
                text={message.content}
                authorEmail={message.authorId}
              />
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between w-full p-3 border-t border-gray-300">
          <button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          <input
            type="text"
            placeholder="Message"
            className="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
            name="message"
            onKeyDown={handleKeyDown}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
          />
          <button type="submit">
            <svg
              className="w-5 h-5 text-gray-500 origin-center transform rotate-90"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
