import { fetch } from "./fetch.js";

export const fetchBusy = async (baseUrl) => {
  const res = await fetch(new URL("cgi/getBusy", baseUrl).href, {
    method: "POST",
    headers: { Referer: new URL("/", baseUrl).href },
  });

  const js = await res.text();
  const [isLoggedInLine, isBusyLine] = js.split("\n").map((s) => s.trim());

  return {
    isLoggedIn: Boolean(Number(isLoggedInLine.slice(14, -1))),
    isBusy: Boolean(Number(isBusyLine.slice(11, -1))),
  };
};
