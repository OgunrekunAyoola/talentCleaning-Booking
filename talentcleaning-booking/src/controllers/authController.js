import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Sync Firebase user with database
 * - Creates DB user if missing
 * - Always returns DB user
 */
export const syncUser = async (req, res) => {
  try {
    const fbUser = req.firebaseUser;

    let user = await prisma.user.findUnique({
      where: { firebaseUid: fbUser.uid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: fbUser.uid,
          email: fbUser.email ?? `${fbUser.uid}@firebase.local`,
          name:
            fbUser.name ??
            fbUser.displayName ??
            fbUser.email?.split("@")[0] ??
            "User",
          role: "CLIENT", // default role
        },
      });
    }

    return res.json(user);
  } catch (err) {
    console.error("Auth sync error:", err);
    return res.status(500).json({ message: "Auth sync failed" });
  }
};
