import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.chatConversation.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.chatParticipant.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  // Users
  const user1 = await prisma.user.create({
    data: {
      email: "test1@example.com",
      name: "testuser1",
    },
  });
  const user2 = await prisma.user.create({
    data: {
      email: "test2@example.com",
      name: "testuser2",
    },
  });
  // Chat
  const conversation1 = await prisma.chatConversation.create({
    data: {},
  });
  await prisma.chatParticipant.create({
    data: {
      user: { connect: { id: user1.id } },
      conversation: { connect: { id: conversation1.id } },
    },
  });
  await prisma.chatParticipant.create({
    data: {
      user: { connect: { id: user2.id } },
      conversation: { connect: { id: conversation1.id } },
    },
  });
  await prisma.chatMessage.create({
    data: {
      content: "hej",
      author: { connect: { id: user1.id } },
      conversation: { connect: { id: conversation1.id } },
    },
  });
  await prisma.chatMessage.create({
    data: {
      content: "hejsan",
      author: { connect: { id: user2.id } },
      conversation: { connect: { id: conversation1.id } },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
