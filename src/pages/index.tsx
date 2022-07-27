import type { GetServerSidePropsContext } from 'next';
import { signIn, signOut, useSession } from 'next-auth/react';
import { getMoonshineAuthSession } from '../server/common/get-server-session';

import dynamic from 'next/dynamic';
import { FaComment, FaDiscord, FaGithub, FaHome, FaSignOutAlt, FaTwitch } from 'react-icons/fa';

import { PusherProvider } from '../utils/pusher';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import Link from 'next/link';
import { useRouter } from 'next/router';
import Chat from './chat';

function ChatWrapper() {
  const { data: sesh } = useSession();

  if (!sesh || !sesh.user?.id) return null;

  return (
    <PusherProvider slug={`user-${sesh.user?.id}`}>
      <Chat />
    </PusherProvider>
  );
}

const LazyChatView = dynamic(() => Promise.resolve(ChatWrapper), {
  ssr: false,
});

const NavButtons: React.FC<{ userId: string }> = ({ userId }) => {
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <Link href={'/'}>
        <button className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100">
          Home <FaHome size={24} />
        </button>
      </Link>
      <Link href={'chat'}>
        <button className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100">
          Chat <FaComment size={24} />
        </button>
      </Link>
      <button
        onClick={() => signOut()}
        className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100"
      >
        Logout <FaSignOutAlt size={24} />
      </button>
    </div>
  );
};

const Login = () => {
  return (
    <div className="flex grow flex-col items-center justify-center">
      <div className="text-2xl font-bold">Please log in below</div>
      <div className="p-4" />
      <button
        onClick={() => signIn('twitch')}
        className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-2xl text-black"
      >
        <span>Sign in with Twitch</span>
        <FaTwitch />
      </button>
      <button
        onClick={() => signIn('github')}
        className="mt-2 flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-2xl text-black"
      >
        <span>Sign in with Github</span>
        <FaGithub />
      </button>
      <button
        onClick={() => signIn('discord')}
        className="mt-2 flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-2xl text-black"
      >
        <span>Sign in with Discord</span>
        <FaDiscord />
      </button>
    </div>
  );
};

export const AppWrapper = (children: any) => {
  const { data: sesh } = useSession();
  if (!sesh) return <Login />;
  return (
    <div className="relative flex h-screen w-screen flex-col justify-between">
      <div className="flex flex-col">
        <div className="flex w-full items-center justify-between bg-gray-800 py-4 px-8 shadow">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            {sesh.user?.image && <img src={sesh.user?.image} alt="pro pic" className="w-16 rounded-full" />}
            {sesh.user?.name}
          </h1>
          <NavButtons userId={sesh.user?.id!} />
        </div>
        {children.children}
      </div>
      <div className="flex w-full justify-between bg-black/40 py-4 px-8">
        <span>
          Project Moonshine, created with{' '}
          <a href="https://github.com/t3-oss/create-t3-app" className="text-blue-300">
            T3
          </a>
        </span>
        <div className="flex gap-4">
          <a href="https://github.com" className="text-blue-300">
            Github
          </a>
          <a href="https://t3.gg/discord" className="text-blue-300">
            Discord
          </a>
        </div>
      </div>
    </div>
  );
};

const Root = () => {
  const { data: sesh } = useSession();
  if (!sesh) return <Login />;
  return (
    <AppWrapper>
      <>Welcome home!</>
    </AppWrapper>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return {
    props: {
      session: await getMoonshineAuthSession(ctx),
    },
  };
};

export default Root;
