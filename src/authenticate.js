import { fetchInfo } from "./client/fetchInfo.js";
import { fetchPublicKey } from "./client/fetchPublicKey.js";
import { createEncryption } from "./client/encryption.js";
import { fetchBusy } from "./client/fetchBusy.js";
import { fetchSessionId } from "./client/fetchSessionId.js";
import { fetchTokenId } from "./client/fetchTokenId.js";

export const authenticate = async (
  baseUrl,
  { username = "admin", password, forceLogin = true }
) => {
  const info = await fetchInfo(baseUrl);

  const { sequence, ...keyParameters } = await fetchPublicKey(baseUrl);
  const encryption = createEncryption({
    ...keyParameters,
    username,
    password,
  });

  const { isLoggedIn } = await fetchBusy(baseUrl);
  if (isLoggedIn && !forceLogin) {
    return null;
  }

  const sessionId = await fetchSessionId(baseUrl, {
    encryption,
    sequence,
    username,
    password,
  });
  if (!sessionId) {
    return null;
  }

  const tokenId = await fetchTokenId(baseUrl, {
    authTimes: info.authTimes,
    sessionId,
  });

  return { encryption, sequence, info, sessionId, tokenId };
};
