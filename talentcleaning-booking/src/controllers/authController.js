import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const syncUser = async (req, res) => {
  const { uid, email, name } = req.firebaseUser;

  // 1️⃣ Find by firebaseUid OR email (migration-safe)
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ firebaseUid: uid }, { email }],
    },
  });

  // 2️⃣ Create if missing
  if (!user) {
    user = await prisma.user.create({
      data: {
        firebaseUid: uid,
        email,
        name: name ?? "User",
      },
    });
  }

  // 3️⃣ Link existing legacy user
  else if (!user.firebaseUid) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { firebaseUid: uid },
    });
  }

  res.json(user);
};
