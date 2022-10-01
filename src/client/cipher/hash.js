import { createHash } from "node:crypto";

export const hashMd5 = (buffer) => createHash("md5").update(buffer).digest();
