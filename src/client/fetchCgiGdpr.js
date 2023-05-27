export const fetchCgiGdpr = async (
  baseUrl,
  payload,
  { encryption, sequence, authTimes, sessionId, tokenId }
) => {
  const { data, sign } = encryption.encrypt(
    Buffer.from(payload, "utf8"),
    sequence
  );

  const res = await fetch(new URL("cgi_gdpr", baseUrl).href, {
    method: "POST",
    headers: {
      Referer: new URL("/", baseUrl).href,
      Cookie: `loginErrorShow=${authTimes}; JSESSIONID=${sessionId}`,
      TokenID: tokenId,
      "Content-Type": "text/plain",
    },
    body: [`sign=${sign}`, `data=${data}`, ""].join("\r\n"),
  });

  if (res.status !== 200) {
    return null;
  }

  const encryptedResponse = await res.text();
  return encryption.decrypt(encryptedResponse);
};
