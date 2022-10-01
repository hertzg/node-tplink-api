import { constants, publicEncrypt } from "node:crypto";
import { decrypt, encrypt } from "./crypt.js";
import { createRsaPublicKeyFromComponents } from "./rsaPubKey.js";

const tpLinkAesKeygen = () =>
  Buffer.from(
    `${new Date().getTime()}${1e9 * Math.random()}`.substring(0, 16),
    "utf8"
  );

const tpLinkRsaChunkPadding = (buffer, size) => {
  if (buffer.length >= size) {
    return buffer;
  }
  return Buffer.concat([buffer, Buffer.alloc(size - buffer.length)]);
};

export const createCipher = ({
  modulus,
  exponent,
  algo = "aes-128-cbc",
  key = tpLinkAesKeygen(),
  iv = tpLinkAesKeygen(),
} = {}) => {
  const rsaPubKey = createRsaPublicKeyFromComponents(modulus, exponent);
  const rsaChunkSize = modulus.length;

  return {
    key,
    iv,
    aesEncrypt: (buffer) => encrypt(buffer, { algo, key, iv }),
    aesDecrypt: (buffer) => decrypt(buffer, { algo, key, iv }),
    rsaEncrypt: (buffer) => {
      const chunkCount = Math.ceil(buffer.length / rsaChunkSize);

      const encryptedChunks = [];
      for (
        let offset = 0;
        offset < chunkCount * rsaChunkSize;
        offset += rsaChunkSize
      ) {
        const chunk = tpLinkRsaChunkPadding(
          buffer.subarray(offset, offset + rsaChunkSize),
          rsaChunkSize
        );
        encryptedChunks.push(
          publicEncrypt(
            {
              key: rsaPubKey,
              padding: constants.RSA_NO_PADDING,
            },
            chunk
          )
        );
      }

      return Buffer.concat(encryptedChunks);
    },
  };
};
