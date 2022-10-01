import { fetch } from "./fetch.js";

export const fetchPublicKey = async (baseUrl) => {
  const res = await fetch(new URL("cgi/getParm", baseUrl).href, {
    method: "POST",
    headers: { Referer: new URL("/", baseUrl).href },
  });

  const js = await res.text();
  const [eeLine, nnLine, , seqLine] = js.split("\n").map((s) => s.trim());

  return {
    exponent: Buffer.from(eeLine.slice(8, -2), "hex"),
    modulus: Buffer.from(nnLine.slice(8, -2), "hex"),
    sequence: Number(seqLine.slice(9, -2)),
  };
};
