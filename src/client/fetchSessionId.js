import { fetch } from "./fetch.js";

export const fetchSessionId = async (
  baseUrl,
  { encryption, sequence, username = "admin", password }
) => {
  const { data, sign } = encryption.encrypt(
    Buffer.from(`${username}\n${password}`, "utf8"),
    sequence,
    {
      key: encryption.key.toString("utf8"),
      iv: encryption.iv.toString("utf8"),
    }
  );

  const url = new URL("cgi/login", baseUrl);
  url.searchParams.set("data", data);
  url.searchParams.set("sign", sign);
  url.searchParams.set("Action", "1");
  url.searchParams.set("LoginStatus", "0");

  const response = await fetch(url.href, {
    method: "POST",
    headers: {
      Referer: new URL("/", baseUrl).href,
    },
  });

  const setCookie = response.headers.get("set-cookie");
  const cookieValue = setCookie?.slice(
    setCookie.indexOf("=") + 1,
    setCookie.indexOf(";")
  );

  return cookieValue !== "deleted" ? cookieValue : null;
};
