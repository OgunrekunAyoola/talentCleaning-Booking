import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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

          // ✅ email-safe (prevents crash)
          email: fbUser.email ?? `${fbUser.uid}@firebase.local`, // fallback

          // ✅ name-safe
          name: fbUser.name ?? fbUser.displayName ?? "User",

          // ✅ REQUIRED for your app
          role: "CLIENT",
        },
      });
    }

    return res.json(user);
  } catch (err) {
    console.error("Auth sync error:", err);
    return res.status(401).json({ message: "Auth sync failed" });
  }
};
