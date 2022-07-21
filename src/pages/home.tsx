/* This example requires Tailwind CSS v2.0+ */
import { useSession } from "next-auth/react";
import Container from "../components/Container";
import Typography from "../components/Typography";
import { trpc } from "../utils/trpc";

export default function Home() {
  const { data: session, status } = useSession();
  const hello = trpc.useQuery(["example.hello", { text: "from tRPC" }]);

  console.log(session, hello);
  return (
    <Container>
      <div className="grid grid-cols-1">
        {hello && <Typography>{hello.data?.greeting}</Typography>}
        {session ? (
          <Typography>{`Signed in as ${session.user?.name}`}</Typography>
        ) : (
          <></>
        )}
      </div>
    </Container>
  );
}
