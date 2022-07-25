import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import React, { useState } from "react";
import { PusherProvider, useSubscribeToEvent } from "../../utils/pusher";

const useLatestPusherMessage = (userId: string) => {
  const [latestMessage, setLatestMessage] = useState<string | null>(null);

  useSubscribeToEvent("question-pinned", (data: { question: string }) =>
    setLatestMessage(data.question)
  );
  useSubscribeToEvent("question-unpinned", () => setLatestMessage(null));

  return latestMessage;
};

const BrowserEmbedViewCore: React.FC<{ userId: string }> = ({ userId }) => {
  const latestMessage = useLatestPusherMessage(userId);

  if (!latestMessage) return null;

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="w-full rounded border-2 bg-gray-900/70 p-8 text-center text-2xl text-white shadow">
        {latestMessage}
      </div>
    </div>
  );
};

const BrowserEmbedView: React.FC<{ userId: string }> = (props) => {
  return (
    <PusherProvider slug={`user-${props.userId}`}>
      <BrowserEmbedViewCore {...props} />
    </PusherProvider>
  );
};

const LazyEmbedView = dynamic(() => Promise.resolve(BrowserEmbedView), {
  ssr: false,
});

const BrowserEmbedQuestionView = () => {
  const { query } = useRouter();
  if (!query.uid || typeof query.uid !== "string") {
    return null;
  }

  return <LazyEmbedView userId={query.uid} />;
};

export default BrowserEmbedQuestionView;
