import crypto from "node:crypto";

export function createPublicToken() {
  return crypto.randomBytes(24).toString("base64url");
}
