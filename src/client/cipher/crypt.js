import { createCipheriv, createDecipheriv } from "node:crypto";

const crypt = (cipher, buffer) => {
  cipher.setAutoPadding(true);
  return Buffer.concat([cipher.update(buffer), cipher.final()]);
};

export const encrypt = (buffer, { algo = "aes-128-cbc", key, iv } = {}) =>
  crypt(createCipheriv(algo, key, iv), buffer);

export const decrypt = (buffer, { algo = "aes-128-cbc", key, iv } = {}) =>
  crypt(createDecipheriv(algo, key, iv), buffer);
