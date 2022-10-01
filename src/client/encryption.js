import { hashMd5 } from "./cipher/hash.js";
import { createCipher } from "./cipher/cipher.js";

export const createEncryption = ({
  modulus,
  exponent,
  username = "admin",
  password,
}) => {
  const cipher = createCipher({ modulus, exponent });
  const hash = hashMd5(`${username}${password}`).toString("hex");

  return {
    key: cipher.key,
    iv: cipher.iv,
    encrypt: (data, sequence, signature = {}) => {
      const encryptedData = cipher.aesEncrypt(data);
      const dataBase64 = encryptedData.toString("base64");
      const signed = new URLSearchParams(signature);
      signed.set("h", hash);
      signed.set("s", sequence + dataBase64.length);
      const signString = signed.toString();

      const signBytes = Buffer.from(signString, "utf8");
      const encryptedSignature = cipher.rsaEncrypt(signBytes);

      return {
        data: dataBase64,
        sign: encryptedSignature.toString("hex"),
      };
    },
    decrypt: (data) =>
      cipher.aesDecrypt(Buffer.from(data, "base64")).toString("utf8"),
  };
};
