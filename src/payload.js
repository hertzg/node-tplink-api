export const ACT = Object.seal({
  GET: 1,
  SET: 2,
  ADD: 3,
  DEL: 4,
  GL: 5,
  GS: 6,
  OP: 7,
  CGI: 8,
});

const LINE_BREAK = "\r\n";
export const stringify = (actions) => {
  const { preamble, blocks } = actions.reduce(
    (
      acc,
      [
        type,
        oid,
        attributes = [],
        stack = "0,0,0,0,0,0",
        pStack = "0,0,0,0,0,0",
      ],
      index
    ) => {
      const { preamble, blocks } = acc;
      preamble.push(type);

      const attributeLines = Array.isArray(attributes)
        ? attributes
        : Object.entries(attributes).map(([k, v]) => `${k}=${v}`);

      const [header, marker] = [
        [oid, stack, pStack].join("#"),
        [index, attributeLines.length].join(","),
      ];

      blocks.push([`[${header}]${marker}`, ...attributeLines].join(LINE_BREAK));

      return acc;
    },
    { preamble: [], blocks: [] }
  );

  return [preamble.join("&"), blocks.join(LINE_BREAK), ""].join(LINE_BREAK);
};

const parseSectionHeader = (line) => {
  const endOfHeaderIndex = line.indexOf("]");
  const stack = line.slice(1, endOfHeaderIndex);
  const trailingNumber = Number(line.slice(endOfHeaderIndex + 1));
  const section = {
    stack,
    actionIndex: trailingNumber,
  };

  switch (stack) {
    case "cgi":
      return { ...section, script: "" };
    case "error":
      return { ...section, code: trailingNumber };
    default:
      return { ...section, attributes: {} };
  }
};

const parseAttributeLine = (line, section) => {
  const [name, ...values] = line.split("=");
  section.attributes[name] = values.join("=");
};

const parseScriptLine = (line, section) => {
  section.script += `${line}\n`;
};

export const parse = (data) => {
  const lines = data.split("\n");

  const sections = [];
  {
    let section;
    for (const line of lines) {
      if (line.startsWith("[")) {
        section = parseSectionHeader(line);
        sections.push(section);
      } else if (section && section.stack === "cgi") {
        parseScriptLine(line, section);
      } else if (line && section) {
        parseAttributeLine(line, section);
      }
    }
  }

  const combined = sections.reduce(
    (acc, section) => {
      if (section.stack === "error") {
        acc.error = section.code;
      } else {
        if (acc.actions[section.actionIndex]) {
          acc.actions[section.actionIndex] = Array.isArray(
            acc.actions[section.actionIndex]
          )
            ? [...acc.actions[section.actionIndex], section]
            : [acc.actions[section.actionIndex], section];
        } else {
          acc.actions[section.actionIndex] = section;
        }
      }
      return acc;
    },
    { error: null, actions: [] }
  );

  for (let i = 0; i < combined.actions.length; i++) {
    if (!combined.actions[i]) {
      combined.actions[i] = {
        actionIndex: i,
      };
    }
  }

  return combined;
};
