import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const syncUser = async (req, res) => {
  const { uid, email, name } = req.firebaseUser;

  // 1. Try to find user by firebaseUid OR email (migration-safe)
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ firebaseUid: uid }, { email }],
    },
  });

  // 2. If user does not exist → create
  if (!user) {
    user = await prisma.user.create({
      data: {
        firebaseUid: uid,
        email,
        name: name ?? "User",
      },
    });
  }

  // 3. If user exists but not linked → link it
  else if (!user.firebaseUid) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        firebaseUid: uid,
      },
    });
  }

  // 4. Return user profile (NO TOKEN)
  res.json(user);
};
