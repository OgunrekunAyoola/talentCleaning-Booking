import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role, // ✅ important
      isAdmin: user.isAdmin, // ✅ optional but good to have
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
