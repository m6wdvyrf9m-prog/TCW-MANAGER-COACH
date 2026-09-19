export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function getPdfMaxUploadBytes() {
  const mb = Number(process.env.PDF_MAX_UPLOAD_MB || "10");
  return Math.max(1, Math.min(Number.isFinite(mb) ? mb : 10, 25)) * 1024 * 1024;
}

export function getAdminConfig() {
  return {
    username: process.env.ADMIN_USERNAME,
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
    sessionSecret: process.env.ADMIN_SESSION_SECRET
  };
}

export function requireAdminConfig() {
  const config = getAdminConfig();
  if (!config.username || !config.passwordHash || !config.sessionSecret) {
    throw new Error("Admin authentication is not configured");
  }
  if (config.sessionSecret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters");
  }
  return config as { username: string; passwordHash: string; sessionSecret: string };
}

export function getOpenAIConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-5-mini"
  };
}

export function shouldUseFileStore() {
  return !process.env.DATABASE_URL || process.env.E2E_IN_MEMORY === "1";
}
