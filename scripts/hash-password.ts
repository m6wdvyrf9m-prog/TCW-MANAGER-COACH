import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function main() {
  const rl = readline.createInterface({ input, output });
  const password = await rl.question("Admin password to hash: ");
  rl.close();

  if (password.length < 12) {
    throw new Error("Use an admin password of at least 12 characters.");
  }

  const hash = await bcrypt.hash(password, 12);
  console.log(hash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
