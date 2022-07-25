import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { getMoonshineAuthSession } from "../server/common/get-server-session";

import { FaCopy, FaGithub, FaSignOutAlt, FaTwitch } from "react-icons/fa";
import dynamic from "next/dynamic";

import { trpc } from "../utils/trpc";

import { FaEye, FaEyeSlash, FaArchive } from "react-icons/fa";
import {
  PusherProvider,
  useCurrentMemberCount,
  useSubscribeToEvent,
} from "../utils/pusher";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import LoadingSVG from "../assets/puff.svg";
import Image from "next/image";
import { PropsWithChildren, useEffect } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const AnimatedQuestionsWrapper = (
  props: PropsWithChildren<{ className: string }>
) => {
  const [parent] = useAutoAnimate<HTMLDivElement>();

  return (
    <div ref={parent} className={props.className}>
      {props.children}
    </div>
  );
};

const QuestionsView = () => {
  const { data, isLoading, refetch } = trpc.proxy.questions.getAll.useQuery();
  // Refetch when new questions come through
  useSubscribeToEvent("new-question", () => refetch());

  const connectionCount = useCurrentMemberCount() - 1;

  // Question pinning mutation
  const {
    mutate: pinQuestion,
    variables: currentlyPinned, // The "variables" passed are the currently pinned Q
    reset: resetPinnedQuestionMutation, // The reset allows for "unpinning" on client
  } = trpc.proxy.questions.pin.useMutation();
  const pinnedId = currentlyPinned?.questionId;

  const { mutate: unpinQuestion } = trpc.proxy.questions.unpin.useMutation({
    onMutate: () => {
      resetPinnedQuestionMutation(); // Reset variables from mutation to "unpin"
    },
  });

  const tctx = trpc.useContext();
  const { mutate: removeQuestion } = trpc.proxy.questions.archive.useMutation({
    onMutate: ({ questionId }) => {
      // Optimistic update
      tctx.queryClient.setQueryData(
        ["questions.getAll", null],
        data?.filter((q) => q.id !== questionId)
      );

      // Unpin if this one was pinned
      if (questionId === pinnedId) unpinQuestion();
    },
  });

  if (isLoading)
    return (
      <div className="flex animate-fade-in-delay justify-center p-8">
        <Image src={LoadingSVG} alt="loading..." width={200} height={200} />
      </div>
    );

  return (
    <>
      <div>
        {connectionCount > 0 && (
          <span>Currently connected: {connectionCount}</span>
        )}
      </div>
      <AnimatedQuestionsWrapper className="flex flex-wrap justify-center gap-4 p-8">
        {data?.map((q) => (
          <div
            key={q.id}
            className="flex h-52 w-96 animate-fade-in-down flex-col rounded border border-gray-500 bg-gray-600 shadow-xl"
          >
            <div className="flex justify-between border-b border-gray-500 p-4">
              {dayjs(q.createdAt).fromNow()}
              <div className="flex gap-4">
                {pinnedId === q.id && (
                  <button onClick={() => unpinQuestion()}>
                    <FaEyeSlash size={24} />
                  </button>
                )}
                {pinnedId !== q.id && (
                  <button onClick={() => pinQuestion({ questionId: q.id })}>
                    <FaEye size={24} />
                  </button>
                )}
                <button onClick={() => removeQuestion({ questionId: q.id })}>
                  <FaArchive size={24} />
                </button>
              </div>
            </div>
            <div className="p-4">{q.body}</div>
          </div>
        ))}
      </AnimatedQuestionsWrapper>
    </>
  );
};

function QuestionsViewWrapper() {
  const { data: sesh } = useSession();

  if (!sesh || !sesh.user?.id) return null;

  return (
    <PusherProvider slug={`user-${sesh.user?.id}`}>
      <QuestionsView />
    </PusherProvider>
  );
}

const LazyQuestionsView = dynamic(() => Promise.resolve(QuestionsViewWrapper), {
  ssr: false,
});

const copyUrlToClipboard = (path: string) => () => {
  if (!process.browser) return;
  navigator.clipboard.writeText(`${window.location.origin}${path}`);
};

const NavButtons: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: sesh } = useSession();

  return (
    <div className="flex gap-2">
      <button
        onClick={copyUrlToClipboard(`/embed/${userId}`)}
        className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100"
      >
        Copy embed url <FaCopy size={24} />
      </button>
      <button
        onClick={copyUrlToClipboard(`/ask/${sesh?.user?.name?.toLowerCase()}`)}
        className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100"
      >
        Copy Q&A url <FaCopy size={24} />
      </button>
      <button
        onClick={() => signOut()}
        className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100"
      >
        Logout <FaSignOutAlt size={24} />
      </button>
    </div>
  );
};

const HomeContents = () => {
  const { data } = useSession();

  if (!data)
    return (
      <div className="flex grow flex-col items-center justify-center">
        <div className="text-2xl font-bold">Please log in below</div>
        <div className="p-4" />
        <button
          onClick={() => signIn("twitch")}
          className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-2xl text-black"
        >
          <span>Sign in with Twitch</span>
          <FaTwitch />
        </button>
        <button
          onClick={() => signIn("github")}
          className="mt-2 flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-2xl text-black"
        >
          <span>Sign in with Github</span>
          <FaGithub />
        </button>
      </div>
    );

  return (
    <div className="flex flex-col">
      <div className="flex w-full items-center justify-between bg-gray-800 py-4 px-8 shadow">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          {data.user?.image && (
            <img
              src={data.user?.image}
              alt="pro pic"
              className="w-16 rounded-full"
            />
          )}
          {data.user?.name}
        </h1>
        <NavButtons userId={data.user?.id!} />
      </div>
      <LazyQuestionsView />
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>{"Stream Q&A Tool"}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative flex h-screen w-screen flex-col justify-between">
        <HomeContents />
        <div className="flex w-full justify-between bg-black/40 py-4 px-8">
          <span>
            Project Moonshine, created with{" "}
            <a
              href="https://github.com/t3-oss/create-t3-app"
              className="text-blue-300"
            >
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
    </>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return {
    props: {
      session: await getMoonshineAuthSession(ctx),
    },
  };
};

export default Home;
