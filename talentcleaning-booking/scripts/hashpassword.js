// scripts/hash.js
import bcrypt from "bcrypt";

const plainPassword = "AdminPass123"; // put the password you want
const saltRounds = 10;

const run = async () => {
  const hash = await bcrypt.hash(plainPassword, saltRounds);
  console.log("thisisntworking:", hash);
};

run();
