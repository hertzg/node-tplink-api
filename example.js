import { ACT, authenticate, execute } from "./src/index.js";

const ADDRESS = "http://192.168.1.1";
const PASSWORD = "admin";

const { info, ...context } = await authenticate(ADDRESS, {
  password: PASSWORD,
});

console.log("info: %j", info);
console.log("sess: %j", context.sessionId);
console.log("tokn: %j", context.tokenId);

const result = await execute(
  ADDRESS,
  [
    [ACT.GET, "LTE_BANDINFO"],
    [ACT.CGI, "cgi/logout"],
  ],
  context
);
console.dir(result, { depth: 4 });
