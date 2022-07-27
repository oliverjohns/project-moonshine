/* This example requires Tailwind CSS v2.0+ */
import { useSession } from 'next-auth/react';
import Chat from '../../components/Chat/Chat';
import { PusherProvider } from '../../utils/pusher';

export default function ChatPage() {
  const { data: sesh } = useSession();
  if (!sesh) return null;
  return (
    <PusherProvider slug={`user-${sesh.user?.id}`}>
      <Chat />
    </PusherProvider>
  );
}
