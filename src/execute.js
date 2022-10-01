import { parse, stringify } from "./payload.js";
import { fetchCgiGdpr } from "./client/fetchCgiGdpr.js";

export const execute = async (
  baseUrl,
  actions,
  { encryption, sequence, sessionId, tokenId, authTimes = 1 }
) => {
  const payload = stringify(actions);

  const response = await fetchCgiGdpr(baseUrl, payload, {
    encryption,
    sequence,
    sessionId,
    tokenId,
    authTimes,
  });

  const result = parse(response);
  result.actions = result.actions.map((item) => {
    const actionIndex = Array.isArray(item)
      ? item[0].actionIndex
      : item.actionIndex;

    let newItem;
    if (Array.isArray(item)) {
      newItem = item.map(({ actionIndex, ...rest }) => rest);
    } else {
      const { actionIndex, ...rest } = item;
      if (Object.entries(rest).length) {
        newItem = rest;
      } else {
        newItem = null;
      }
    }

    return {
      req: actions[actionIndex],
      res: newItem,
    };
  });

  return result;
};
