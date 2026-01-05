import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const syncUser = async (req, res) => {
  // 🔒 HARD GUARD (this is what was missing)
  if (!req.firebaseUser) {
    return res.status(401).json({
      message: "Unauthenticated: Firebase user not found",
    });
  }

  const { uid, email, name } = req.firebaseUser;

  try {
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

    // 3️⃣ Link legacy user
    else if (!user.firebaseUid) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid: uid },
      });
    }

    res.json(user);
  } catch (err) {
    console.error("syncUser error:", err);
    res.status(500).json({ message: "Failed to sync user" });
  }
};
