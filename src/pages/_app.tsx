// src/pages/_app.tsx
import { withTRPC } from '@trpc/next';
import { SessionProvider, signIn } from 'next-auth/react';
import type { AppType } from 'next/dist/shared/lib/utils';
import { FaDiscord, FaGithub, FaTwitch } from 'react-icons/fa';
import superjson from 'superjson';
import type { AppRouter } from '../server/router';
import '../styles/globals.css';

const Login = () => (
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

const MyApp: AppType = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      {/* <Head>
        <title>{'Project Moonshine'}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head> */}
      <Component {...pageProps} />
    </SessionProvider>
  );
};

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
