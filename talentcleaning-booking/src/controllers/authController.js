import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const syncUser = async (req, res) => {
  const { uid, email, name } = req.firebaseUser;

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ firebaseUid: uid }, { email }],
    },
  });

  // create new user
  if (!user) {
    user = await prisma.user.create({
      data: {
        firebaseUid: uid,
        email,
        name: name ?? "User",
        role: "USER",
      },
    });
  }

  // link old user to firebase
  else if (!user.firebaseUid) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { firebaseUid: uid },
    });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
};
