import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { timeSince } from "../../utils/date";

interface LastMessage {
  content: string;
  createdAt: Date;
}

interface Props {
  lastMessage?: LastMessage;
  userName: string;
  avatar: string;
  onClick: () => void;
  classes?: string;
}

export default function ChatRow({
  lastMessage,
  userName,
  avatar,
  classes,
  onClick,
}: Props) {
  const mergedClasses = twMerge(
    "flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none",
    classes ?? ""
  );
  return (
    <a className={mergedClasses} onClick={onClick}>
      <div className="w-10 h-10 relative">
        {!!avatar && (
          <Image
            className="object-cover rounded-full"
            src={avatar}
            alt="username"
            layout="fill"
          />
        )}
      </div>
      <div className="w-full pb-2">
        <div className="flex justify-between">
          <span className="block ml-2 font-semibold text-gray-600">
            {userName}
          </span>
          <span className="block ml-2 text-sm text-gray-600">
            {timeSince(lastMessage?.createdAt)}
          </span>
        </div>
        <span className="block ml-2 text-sm text-gray-600 truncate">
          {lastMessage?.content}
        </span>
      </div>
    </a>
  );
}
