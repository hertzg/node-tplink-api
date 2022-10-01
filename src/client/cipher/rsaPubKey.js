import { createPublicKey } from "node:crypto";

const length = (n) => {
  if (n < 0x80) {
    return [n];
  } else if (n < 0x100) {
    return [0x81, n];
  } else if (n < 0x10000) {
    return [0x82, n >>> 8, n & 255];
  } else if (n < 0x1000000) {
    return [0x83, n >>> 16, (n >>> 8) & 255, n & 255];
  }

  throw new Error("too big");
};

export const createRsaPublicKeyFromComponents = (modulus, exponent) => {
  const modulusBytes = [0x02, ...length(modulus.length), ...modulus];
  const exponentBytes = [0x02, ...length(exponent.length), ...exponent];
  return createPublicKey({
    key: Buffer.from([
      0x30, // SEQUENCE
      ...length(modulusBytes.length + exponentBytes.length),
      ...modulusBytes,
      ...exponentBytes,
    ]),
    format: "der",
    type: "pkcs1",
  });
};
