import "server-only";
import { prisma } from "@/lib/prisma";
import { encryptTokens, decryptTokens } from "./crypto";
import { refreshAccessToken, type GoogleTokens } from "./business-profile";

export async function saveTokens(connectionId: string, tokens: GoogleTokens) {
  const encryptedPayload = encryptTokens({ ...tokens });
  await prisma.googleBusinessCredential.upsert({
    where: { googleBusinessConnectionId: connectionId },
    create: { googleBusinessConnectionId: connectionId, encryptedPayload },
    update: { encryptedPayload },
  });
}

/** Returns a currently-valid access token for this connection, refreshing and persisting it first if it's expired. */
export async function getValidAccessToken(connectionId: string): Promise<string> {
  const credential = await prisma.googleBusinessCredential.findUnique({ where: { googleBusinessConnectionId: connectionId } });
  if (!credential) throw new Error("This Google connection has no stored credentials — it needs to be reconnected.");

  const tokens = decryptTokens(credential.encryptedPayload) as unknown as GoogleTokens;
  if (Date.now() < tokens.expiresAt - 60_000) return tokens.accessToken;

  const refreshed = await refreshAccessToken(tokens.refreshToken);
  const updated: GoogleTokens = { accessToken: refreshed.accessToken, refreshToken: tokens.refreshToken, expiresAt: refreshed.expiresAt };
  await saveTokens(connectionId, updated);
  return updated.accessToken;
}
