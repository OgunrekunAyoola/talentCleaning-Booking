import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const syncUser = async (req, res) => {
  const fbUser = req.firebaseUser;

  let user = await prisma.user.findUnique({
    where: { firebaseUid: fbUser.uid },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        firebaseUid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.name || fbUser.email.split("@")[0],
      },
    });
  }

  res.json(user);
};
