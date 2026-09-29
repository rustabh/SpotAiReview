import "server-only";
import { prisma } from "@/lib/prisma";
import { encryptTokens, decryptTokens } from "./crypto";

interface SocialCredentialPayload {
  userAccessToken: string;
  pageAccessToken?: string;
}

async function readPayload(connectionId: string): Promise<SocialCredentialPayload> {
  const credential = await prisma.socialCredential.findUnique({ where: { socialConnectionId: connectionId } });
  if (!credential) throw new Error("This connection has no stored credentials — it needs to be reconnected.");
  return decryptTokens(credential.encryptedPayload) as unknown as SocialCredentialPayload;
}

/** Stores the long-lived user token right after OAuth completes, before a Page has been picked. */
export async function saveUserToken(connectionId: string, userAccessToken: string) {
  const encryptedPayload = encryptTokens({ userAccessToken } satisfies SocialCredentialPayload);
  await prisma.socialCredential.upsert({
    where: { socialConnectionId: connectionId },
    create: { socialConnectionId: connectionId, encryptedPayload },
    update: { encryptedPayload },
  });
}

/** Adds the Page access token once the owner picks which Facebook Page this business is — used for every publish afterwards. */
export async function savePageToken(connectionId: string, pageAccessToken: string) {
  const existing = await readPayload(connectionId);
  const encryptedPayload = encryptTokens({ ...existing, pageAccessToken } satisfies SocialCredentialPayload);
  await prisma.socialCredential.update({ where: { socialConnectionId: connectionId }, data: { encryptedPayload } });
}

/** The user-level token, only needed to (re-)list Pages during setup. */
export async function getUserAccessToken(connectionId: string): Promise<string> {
  return (await readPayload(connectionId)).userAccessToken;
}

/** The Page access token used to publish to Facebook and, via the linked account, Instagram. */
export async function getPageAccessToken(connectionId: string): Promise<string> {
  const { pageAccessToken } = await readPayload(connectionId);
  if (!pageAccessToken) throw new Error("No Facebook Page has been selected for this connection yet.");
  return pageAccessToken;
}
