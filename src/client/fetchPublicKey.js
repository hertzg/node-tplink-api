import { fetch } from "./fetch.js";

export const _extractVariables = (js) => {
  return js
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length)
    .reduce(
      (acc, line) => {
        switch (true) {
          case line.startsWith("var ee="):
            acc.exponent = line.slice(8, -2);
            break;
          case line.startsWith("var nn="):
            acc.modulus = line.slice(8, -2);
            break;
          case line.startsWith("var seq="):
            acc.sequence = line.slice(9, -2);
            break;
        }
        return acc;
      },
      { exponent: "", modulus: "", sequence: "" }
    );
};

export const fetchPublicKey = async (baseUrl) => {
  const res = await fetch(new URL("cgi/getParm", baseUrl).href, {
    method: "POST",
    headers: { Referer: new URL("/", baseUrl).href },
  });

  const js = await res.text();

  const { exponent, modulus, sequence } = _extractVariables(js);

  return {
    exponent: Buffer.from(exponent, "hex"),
    modulus: Buffer.from(modulus, "hex"),
    sequence: Number(sequence),
  };
};
