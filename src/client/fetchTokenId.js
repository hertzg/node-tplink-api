import { fetch } from "./fetch.js";

export const fetchTokenId = async (
  baseUrl,
  { authTimes = 1, sessionId } = {}
) => {
  const res = await fetch(new URL("/", baseUrl).href, {
    method: "GET",
    headers: {
      Referer: new URL("/", baseUrl).href,
      Cookie: `loginErrorShow=${authTimes}; JSESSIONID=${sessionId}`,
    },
  });

  const html = await res.text();
  const [, token] = html.match(/var token="([^"]*)"/);

  return token;
};
