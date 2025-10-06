import bcrypt from "bcrypt";

const plainPassword = "ClientPass123"; // put the password you want
const saltRounds = 10;

const run = async () => {
  const hash = await bcrypt.hash(plainPassword, saltRounds);
  console.log("thisisworking:", hash);
};

run();
